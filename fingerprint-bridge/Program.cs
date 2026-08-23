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
    return Results.Ok(new
    {
        service = "OSCA Fingerprint Bridge",
        version = "1.0.0",
        status = "running",
        platform = "Windows Biometric Framework",
        timestamp = DateTime.Now.ToString("o")
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
                message = "Fingerprint captured successfully via Windows Hello"
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
