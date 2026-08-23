// ============================================================
// OSCA Fingerprint Bridge Service
// Local HTTP server (port 8000) that connects Windows Hello
// Fingerprint to the OSCA web application via REST API.
//
// Usage:
//   dotnet run
//   (or) FingerprintBridge.exe
//
// Endpoints:
//   GET  /api/status   - Check if service is running
//   POST /api/capture  - Capture fingerprint via Windows Hello
//   POST /api/verify   - Verify fingerprint against stored template
// ============================================================

using FingerprintBridge.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Enable running as a Windows Service
builder.Host.UseWindowsService();

// Listen on all interfaces (localhost for HTTPS mixed-content exemption + LAN IP for dev)
builder.WebHost.UseUrls("http://localhost:8000");

// Add services
builder.Services.AddSingleton<WindowsBiometricService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Allow OSCA web app origins
        policy.WithOrigins(
            "http://localhost:5173",        // Vite dev (localhost)
            "http://localhost:3000",         // Alt dev (localhost)
            "https://me.oscajuban.online", // Production (update this)
            "https://oscajuban.online"     // Production alt
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Enable CORS (critical for browser requests)
app.UseCors();

// ─── Health/Status Endpoint ───
app.MapGet("/api/status", () =>
{
    var ports = System.IO.Ports.SerialPort.GetPortNames();
    return Results.Ok(new
    {
        service = "OSCA Fingerprint Bridge",
        version = "1.1.0",
        status = "running",
        platform = "Serial + Windows Biometric Framework",
        serialPorts = ports,
        serialPortCount = ports.Length,
        timestamp = DateTime.Now.ToString("o")
    });
});

// ─── Diagnose Endpoint (debug biometric hardware) ───
app.MapGet("/api/diagnose", () =>
{
    var serialPorts = System.IO.Ports.SerialPort.GetPortNames();
    
    // Check WinBio
    string winBioStatus = "unknown";
    int unitCount = 0;
    try
    {
        // Quick check via sc query
        var psi = new System.Diagnostics.ProcessStartInfo("sc", "query WbioSrvc")
        {
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        var proc = System.Diagnostics.Process.Start(psi);
        var output = proc?.StandardOutput.ReadToEnd() ?? "";
        proc?.WaitForExit();
        winBioStatus = output.Contains("RUNNING") ? "running" : output.Contains("STOPPED") ? "stopped" : "unknown";
    }
    catch { winBioStatus = "check_failed"; }

    return Results.Ok(new
    {
        serialPorts = serialPorts,
        winBioServiceStatus = winBioStatus,
        recommendations = new[]
        {
            "1. Ensure Windows Biometric Service (WbioSrvc) is RUNNING",
            "2. Ensure at least one fingerprint is enrolled: Settings → Accounts → Sign-in options → Fingerprint",
            "3. If SYNO_FIDO sensor: try touching/swiping the sensor DURING capture (not before)",
            "4. Make sure only ONE biometric device is enabled in Device Manager",
            "5. Try: sc stop WbioSrvc && sc start WbioSrvc to reset biometric service"
        },
        note = "If capture hangs, the sensor may need a swipe/press gesture (not just resting finger). Try pressing firmly when prompted."
    });
});

// ─── Capture Fingerprint Endpoint ───
app.MapPost("/api/capture", async (WindowsBiometricService biometricService) =>
{
    try
    {
        var result = await biometricService.CaptureFingerprint();

        if (result.Success)
        {
            return Results.Ok(new
            {
                success = true,
                template = result.TemplateBase64,
                id = result.TemplateId,
                quality = result.Quality,
                method = result.CaptureMethod,
                port = result.Port,
                message = $"Fingerprint captured successfully via {result.CaptureMethod}"
            });
        }
        else
        {
            return Results.BadRequest(new
            {
                success = false,
                error = result.ErrorMessage
            });
        }
    }
    catch (Exception ex)
    {
        return Results.Json(new
        {
            success = false,
            error = $"Capture failed: {ex.Message}"
        }, statusCode: 500);
    }
});

// ─── Verify Fingerprint Endpoint ───
app.MapPost("/api/verify", async (HttpContext context, WindowsBiometricService biometricService) =>
{
    try
    {
        var body = await context.Request.ReadFromJsonAsync<VerifyRequest>();
        if (body == null || string.IsNullOrEmpty(body.StoredTemplate))
        {
            return Results.BadRequest(new { success = false, error = "Missing storedTemplate in body" });
        }

        var result = await biometricService.VerifyFingerprint(body.StoredTemplate);

        return Results.Ok(new
        {
            success = result.IsMatch,
            confidence = result.Confidence,
            message = result.IsMatch ? "Fingerprint verified!" : "Fingerprint does not match."
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new
        {
            success = false,
            error = $"Verification failed: {ex.Message}"
        }, statusCode: 500);
    }
});

Console.WriteLine("══════════════════════════════════════════════════");
Console.WriteLine("  OSCA Fingerprint Bridge Service v1.0.0");
Console.WriteLine("  Listening on: http://localhost:8000");
Console.WriteLine("  Endpoints:");
Console.WriteLine("    GET  /api/status  - Service health check");
Console.WriteLine("    POST /api/capture - Capture fingerprint");
Console.WriteLine("    POST /api/verify  - Verify fingerprint");
Console.WriteLine("══════════════════════════════════════════════════");
Console.WriteLine("  Press Ctrl+C to stop the service.");
Console.WriteLine("");

app.Run();

// ─── Request Models ───
public record VerifyRequest
{
    public string StoredTemplate { get; init; } = "";
}

// Hacky extension to support Results.StatusCode with body
public static class ResultsExtensions
{
    public static IResult StatusCode(this IResultExtensions _, int statusCode, object value)
    {
        return Microsoft.AspNetCore.Http.Results.Json(value, statusCode: statusCode);
    }
}
