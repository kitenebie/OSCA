using FingerprintBridge.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:9123");
builder.Services.AddSingleton<DigitalPersonaService>();
builder.Services.AddSingleton<SemaphoreSlim>(_ => new SemaphoreSlim(1, 1));

var allowedOrigins = builder.Configuration.GetSection("FingerprintBridge:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(allowedOrigins)
    .WithMethods("GET", "POST")
    .WithHeaders("Content-Type")));

var app = builder.Build();
app.UseCors();

// CORS protects browser reads. Also reject requests from unapproved browser origins.
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers.Origin.ToString();
    if (!string.IsNullOrEmpty(origin) && !allowedOrigins.Contains(origin, StringComparer.Ordinal))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }
    await next();
});

app.MapGet("/api/fingerprint/status", (DigitalPersonaService scanner) =>
{
    if (!scanner.IsAvailable())
        return Results.Ok(new { connected = false, device = (string?)null, error = "DigitalPersona SDK unavailable. Install the U.are.U SDK and driver." });

    var connected = scanner.GetDevices().Count > 0;
    return Results.Ok(new
    {
        connected,
        device = connected ? "DigitalPersona U.are.U 4500" : null,
        error = connected ? null : "Scanner disconnected or driver unavailable."
    });
});

app.MapPost("/api/fingerprint/capture", async (DigitalPersonaService scanner, SemaphoreSlim captureGate) =>
{
    if (!await captureGate.WaitAsync(0))
        return Results.Conflict(new { success = false, code = "busy", error = "Scanner is already in use." });

    try
    {
        if (!scanner.IsAvailable())
            return Results.Json(new { success = false, code = "sdk_unavailable", error = "DigitalPersona SDK unavailable." }, statusCode: 503);
        if (scanner.GetDevices().Count == 0)
            return Results.Json(new { success = false, code = "disconnected", error = "Scanner disconnected." }, statusCode: 503);

        // The native SDK blocks during capture. Never send its image or template to the browser.
        var capture = await Task.Run(() => scanner.Capture(timeoutMs: 12000));
        if (capture is null || !capture.Success)
        {
            var error = capture?.ErrorMessage ?? "Could not open the scanner.";
            var code = error.Contains("Timeout", StringComparison.OrdinalIgnoreCase) ? "timeout"
                : error.Contains("quality", StringComparison.OrdinalIgnoreCase) ? "poor_quality" : "scanner_error";
            return Results.BadRequest(new { success = false, code, error });
        }

        if (capture.Quality < 70)
            return Results.Json(new { success = false, code = "poor_quality", error = "Poor Fingerprint Quality. Clean the sensor and try again." }, statusCode: 422);

        return Results.Ok(new
        {
            success = true,
            quality = capture.Quality,
            qualityLabel = capture.QualityLabel,
            templateFormat = capture.TemplateFormat,
            message = "Fingerprint Captured"
        });
    }
    catch (Exception)
    {
        return Results.Json(new { success = false, code = "scanner_error", error = "Scanner error. Check the driver and try again." }, statusCode: 500);
    }
    finally
    {
        captureGate.Release();
    }
});

app.MapPost("/api/fingerprint/cancel", (DigitalPersonaService scanner, SemaphoreSlim captureGate) =>
{
    if (captureGate.CurrentCount == 0) scanner.CancelCapture();
    return Results.Ok(new { cancelled = true });
});

app.Run();
