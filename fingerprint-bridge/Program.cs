// ============================================================
// OSCA Fingerprint Bridge Service
// Local HTTP server (port 8000) that connects fingerprint scanners
// to the OSCA web application via REST API.
//
// Supported Devices (tried in order):
//   0. DigitalPersona U.are.U 4500 (via dpfpdd.dll SDK)
//   1. Serial scanners (ZFM-20, R307, R305)
//   2. WinBio Identify (Windows Hello enrolled fingerprint)
//   3. WinBio Raw Capture
//
// Usage:
//   dotnet run
//   (or) FingerprintBridge.exe
//
// Endpoints:
//   GET  /api/status   - Check if service is running + detected hardware
//   GET  /api/diagnose - Detailed hardware diagnostics
//   POST /api/capture  - Capture fingerprint (auto-selects best method)
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
builder.Services.AddSingleton<DigitalPersonaService>();
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

// Initialize DigitalPersona service at startup
var dpService = app.Services.GetRequiredService<DigitalPersonaService>();
bool dpAvailable = dpService.IsAvailable();
if (dpAvailable)
{
    var devices = dpService.GetDevices();
    Console.WriteLine($"[STARTUP] DigitalPersona: {devices.Count} device(s) detected");
}

// ─── Health/Status Endpoint ───
app.MapGet("/api/status", (DigitalPersonaService dp) =>
{
    var ports = System.IO.Ports.SerialPort.GetPortNames();
    var dpDevices = dp.IsAvailable() ? dp.GetDevices() : new List<string>();

    return Results.Ok(new
    {
        service = "OSCA Fingerprint Bridge",
        version = "2.0.0",
        status = "running",
        platform = "DigitalPersona + Serial + Windows Biometric Framework",
        devices = new
        {
            digitalPersona = new
            {
                available = dp.IsAvailable(),
                count = dpDevices.Count,
                names = dpDevices
            },
            serialPorts = ports,
            serialPortCount = ports.Length
        },
        captureOrder = new[] {
            "0. DigitalPersona U.are.U (dpfpdd.dll)",
            "1. Serial (ZFM-20/R307)",
            "2. WinBio Identify",
            "3. WinBio Raw"
        },
        timestamp = DateTime.Now.ToString("o")
    });
});

// ─── Diagnose Endpoint (debug biometric hardware) ───
app.MapGet("/api/diagnose", (DigitalPersonaService dp) =>
{
    var serialPorts = System.IO.Ports.SerialPort.GetPortNames();
    var dpDevices = dp.IsAvailable() ? dp.GetDevices() : new List<string>();

    // Check WinBio
    string winBioStatus = "unknown";
    try
    {
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
        digitalPersona = new
        {
            sdkAvailable = dp.IsAvailable(),
            devices = dpDevices,
            dllsRequired = new[] { "dpfpdd.dll", "dpfj.dll" },
            dllLocation = "Same directory as FingerprintBridge.exe OR C:\\Program Files\\DigitalPersona\\Bin\\"
        },
        serialPorts = serialPorts,
        winBioServiceStatus = winBioStatus,
        recommendations = new[]
        {
            "1. [RECOMMENDED] Install DigitalPersona U.are.U SDK + copy dpfpdd.dll & dpfj.dll here",
            "2. Ensure U.are.U 4500 driver is installed (Device Manager → Biometric devices)",
            "3. If using WinBio: Enroll fingerprint in Windows Hello (Settings → Accounts → Sign-in)",
            "4. If device not detected: unplug and replug the USB scanner",
            "5. Only ONE application can use the scanner at a time"
        }
    });
});

// ─── Capture Fingerprint Endpoint ───
app.MapPost("/api/capture", async (DigitalPersonaService dp, WindowsBiometricService biometricService) =>
{
    try
    {
        // ═══ METHOD 0: DigitalPersona U.are.U (PREFERRED) ═══
        if (dp.IsAvailable())
        {
            Console.WriteLine("[CAPTURE] Trying DigitalPersona U.are.U...");
            var dpResult = dp.Capture(timeoutMs: 12000);

            if (dpResult != null && dpResult.Success)
            {
                return Results.Ok(new
                {
                    success = true,
                    template = dpResult.TemplateBase64,
                    id = dpResult.TemplateId,
                    image = dpResult.ImageBase64,  // Base64 BMP image for display/storage
                    quality = dpResult.Quality,
                    qualityLabel = dpResult.QualityLabel,
                    method = "digitalpersona",
                    format = dpResult.TemplateFormat,
                    templateSize = dpResult.TemplateSizeBytes,
                    nfiqScore = dpResult.NfiqScore,
                    imageInfo = new { width = dpResult.ImageWidth, height = dpResult.ImageHeight },
                    message = $"Fingerprint captured via DigitalPersona U.are.U! Quality: {dpResult.Quality}% ({dpResult.QualityLabel})"
                });
            }
            else if (dpResult != null)
            {
                Console.WriteLine($"[CAPTURE] DigitalPersona failed: {dpResult.ErrorMessage}");
                // Fall through to other methods
            }
        }

        // ═══ METHODS 1-3: Serial + WinBio fallbacks ═══
        Console.WriteLine("[CAPTURE] Falling back to Serial/WinBio...");
        var result = await biometricService.CaptureFingerprint();

        if (result.Success)
        {
            return Results.Ok(new
            {
                success = true,
                template = result.TemplateBase64,
                id = result.TemplateId,
                quality = result.Quality,
                qualityLabel = "N/A",
                method = result.CaptureMethod,
                format = "proprietary",
                templateSize = 0,
                nfiqScore = 0,
                imageInfo = new { width = 0, height = 0 },
                port = result.Port,
                message = $"Fingerprint captured via {result.CaptureMethod}! Quality: {result.Quality}%"
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
app.MapPost("/api/verify", async (HttpContext context, DigitalPersonaService dp, WindowsBiometricService biometricService) =>
{
    try
    {
        var body = await context.Request.ReadFromJsonAsync<VerifyRequest>();
        if (body == null || string.IsNullOrEmpty(body.StoredTemplate))
        {
            return Results.BadRequest(new { success = false, error = "Missing storedTemplate in body" });
        }

        // Capture a new fingerprint first
        DigitalPersonaService.CaptureOutput? newCapture = null;
        
        if (dp.IsAvailable())
        {
            newCapture = dp.Capture(timeoutMs: 12000);
        }

        if (newCapture != null && newCapture.Success)
        {
            // Use DigitalPersona SDK for proper biometric comparison
            var compareResult = dp.Compare(body.StoredTemplate, newCapture.TemplateBase64);

            return Results.Ok(new
            {
                success = compareResult.IsMatch,
                confidence = compareResult.Confidence,
                method = "digitalpersona",
                message = compareResult.IsMatch
                    ? $"✓ Fingerprint verified! Confidence: {compareResult.Confidence:F1}%"
                    : "✗ Fingerprint does not match. Try again with the correct finger."
            });
        }
        else
        {
            // Fallback to WinBio verification
            var result = await biometricService.VerifyFingerprint(body.StoredTemplate);

            return Results.Ok(new
            {
                success = result.IsMatch,
                confidence = result.Confidence,
                method = "winbio-fallback",
                message = result.IsMatch ? "Fingerprint verified!" : "Fingerprint does not match."
            });
        }
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

Console.WriteLine("══════════════════════════════════════════════════════");
Console.WriteLine("  OSCA Fingerprint Bridge Service v2.0.0");
Console.WriteLine("  Listening on: http://localhost:8000");
Console.WriteLine("  Endpoints:");
Console.WriteLine("    GET  /api/status   - Service health check");
Console.WriteLine("    GET  /api/diagnose - Hardware diagnostics");
Console.WriteLine("    POST /api/capture  - Capture fingerprint");
Console.WriteLine("    POST /api/verify   - Verify fingerprint");
Console.WriteLine("══════════════════════════════════════════════════════");

// Show detected hardware at startup
Console.WriteLine($"  DigitalPersona SDK: {(dpAvailable ? "✓ LOADED" : "✗ Not found (dpfpdd.dll)")}");

var serialPorts = System.IO.Ports.SerialPort.GetPortNames();
Console.WriteLine($"  Serial Ports: {(serialPorts.Length > 0 ? string.Join(", ", serialPorts) : "none")}");

// Check WinBio devices
try
{
    var psi = new System.Diagnostics.ProcessStartInfo("powershell", "-Command \"Get-PnpDevice | Where-Object { $_.Class -eq 'Biometric' -and $_.Status -eq 'OK' } | Select-Object -ExpandProperty FriendlyName\"")
    {
        RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true
    };
    var proc = System.Diagnostics.Process.Start(psi);
    var bioDevices = proc?.StandardOutput.ReadToEnd()?.Trim() ?? "";
    proc?.WaitForExit();
    if (!string.IsNullOrEmpty(bioDevices))
    {
        foreach (var dev in bioDevices.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            Console.WriteLine($"  Biometric: {dev.Trim()} ✓");
    }
    else
    {
        Console.WriteLine("  Biometric: none detected");
    }
}
catch { Console.WriteLine("  Biometric: check failed"); }

Console.WriteLine("══════════════════════════════════════════════════════");
if (!dpAvailable)
{
    Console.WriteLine("  ⚠ TIP: For best results with U.are.U 4500, install the");
    Console.WriteLine("    DigitalPersona SDK and copy dpfpdd.dll + dpfj.dll here.");
    Console.WriteLine("    Download: https://sdk.hidglobal.com/developer-center/digitalpersona-touchchip");
    Console.WriteLine("══════════════════════════════════════════════════════");
}
Console.WriteLine("  Press Ctrl+C to stop the service.");
Console.WriteLine("");

app.Run();

// ─── Request Models ───
public record VerifyRequest
{
    public string StoredTemplate { get; init; } = "";
}
