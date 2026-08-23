@echo off
:: ============================================================
:: Install OSCA Fingerprint Bridge as a Windows Service
:: Run this as Administrator
:: ============================================================

echo.
echo ══════════════════════════════════════════════════
echo   Installing OSCA Fingerprint Bridge Service
echo ══════════════════════════════════════════════════
echo.

:: Check for admin rights
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Build the project first
echo [1/4] Building the project...
dotnet publish -c Release -o "%~dp0publish" --self-contained true -r win-x64
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:: Create Windows Service
echo [2/4] Creating Windows Service...
sc create "OSCAFingerprintBridge" ^
    binPath= "%~dp0publish\FingerprintBridge.exe" ^
    start= auto ^
    DisplayName= "OSCA Fingerprint Bridge"

:: Set service description
echo [3/4] Setting service description...
sc description "OSCAFingerprintBridge" "Local fingerprint scanner bridge for OSCA Senior Citizen Management System. Connects Windows Hello biometrics to the web application."

:: Start the service
echo [4/4] Starting service...
sc start "OSCAFingerprintBridge"

echo.
echo ══════════════════════════════════════════════════
echo   Installation Complete!
echo   Service: OSCAFingerprintBridge
echo   Status: Running
echo   Port: http://localhost:8000
echo ══════════════════════════════════════════════════
echo.
echo   To uninstall: sc delete "OSCAFingerprintBridge"
echo.
pause
