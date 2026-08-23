@echo off
title OSCA Fingerprint Bridge Service
echo.
echo ══════════════════════════════════════════════════
echo   OSCA Fingerprint Bridge Service v1.0.0
echo   Starting on http://localhost:8000
echo ══════════════════════════════════════════════════
echo.
echo   Make sure:
echo   1. Windows Hello fingerprint is enrolled
echo   2. Fingerprint reader is connected
echo   3. Windows Biometric Service is running
echo.
echo ──────────────────────────────────────────────────
echo.

:: Check if .NET 8 runtime is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] .NET 8 Runtime not found!
    echo Download from: https://dotnet.microsoft.com/download/dotnet/8.0
    echo.
    pause
    exit /b 1
)

:: Start the service
dotnet run --project "%~dp0FingerprintBridge.csproj"

pause
