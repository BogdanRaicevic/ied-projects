@echo off
setlocal

rem Define the port you want to check
set "PORT=8000"

rem Get the process ID (PID) using the port
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :%PORT%') do set "PID=%%i"

rem Check if a PID was found
if defined PID (
    echo Terminating process using port %PORT% (PID: %PID%)
    taskkill /PID %PID% /F
    if %ERRORLEVEL% EQU 0 (
        echo Process terminated successfully.
    ) else (
        echo Failed to terminate process.
    )
) else (
    echo No process found using port %PORT%.
)

rem Get the directory of the script
set "SCRIPT_DIR=%~dp0"

rem Navigate to the project directories and run the commands
start cmd /k "cd /d %SCRIPT_DIR%ied-be && pnpm run start"
start cmd /k "cd /d %SCRIPT_DIR%ied-fe && pnpm run preview"

start http://localhost:4173

endlocal