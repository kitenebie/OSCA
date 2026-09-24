@echo off
title OSCA Fingerprint Bridge Service
echo.
echo ══════════════════════════════════════════════════
echo   OSCA U.are.U 4500 Local Bridge
echo   Starting on http://127.0.0.1:9123
echo ══════════════════════════════════════════════════
echo.
echo   Make sure:
echo   1. DigitalPersona U.are.U driver and SDK are installed
echo   2. dpfpdd.dll and dpfj.dll are available to the bridge
echo   3. U.are.U 4500 reader is connected
echo.
echo ──────────────────────────────────────────────────
echo.

:: Check if the .NET SDK is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] .NET SDK not found!
    echo Download from: https://dotnet.microsoft.com/download/dotnet/8.0
    echo.
    pause
    exit /b 1
)

:: Start the service
dotnet run --project "%~dp0FingerprintBridge.csproj"

pause
