@echo off
:: ============================================================
:: Install OSCA Fingerprint Bridge as a User-Session Task
:: Runs at logon under the current user (required for biometric access)
:: Run this as Administrator
:: ============================================================

echo.
echo ══════════════════════════════════════════════════════
echo   Installing OSCA Fingerprint Bridge
echo ══════════════════════════════════════════════════════
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
echo [1/5] Building the project...
dotnet publish -c Release -o "%~dp0publish" --self-contained true -r win-x64
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:: Remove old Windows Service if it exists
echo [2/5] Cleaning up old service (if any)...
sc stop "OSCAFingerprintBridge" >nul 2>&1
sc delete "OSCAFingerprintBridge" >nul 2>&1
schtasks /delete /tn "OSCAFingerprintBridge" /f >nul 2>&1

:: Create Scheduled Task that runs at logon (user session = biometric access)
echo [3/5] Creating startup task (runs at logon)...
schtasks /create /tn "OSCAFingerprintBridge" ^
    /tr "\"%~dp0publish\FingerprintBridge.exe\"" ^
    /sc onlogon ^
    /rl highest ^
    /f

:: Set description
echo [4/5] Configuring task...
powershell -Command "$task = Get-ScheduledTask -TaskName 'OSCAFingerprintBridge'; $task.Description = 'OSCA Fingerprint Bridge - connects USB fingerprint scanner to the OSCA web app via Windows Biometric Framework'; Set-ScheduledTask -InputObject $task" >nul 2>&1

:: Start it now
echo [5/5] Starting the bridge now...
schtasks /run /tn "OSCAFingerprintBridge"

echo.
echo ══════════════════════════════════════════════════════
echo   Installation Complete!
echo   Task: OSCAFingerprintBridge
echo   Trigger: Runs at every logon (user session)
echo   Port: http://localhost:8000
echo ══════════════════════════════════════════════════════
echo.
echo   The bridge runs in your user session so it can
echo   access the fingerprint scanner hardware (WinBio).
echo.
echo   To uninstall:
echo     schtasks /delete /tn "OSCAFingerprintBridge" /f
echo.
echo   To stop:
echo     taskkill /im FingerprintBridge.exe /f
echo.
pause
