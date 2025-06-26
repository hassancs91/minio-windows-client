@echo off
echo Setting up MinIO MC Wrapper...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if mc.exe exists
if not exist "mc.exe" (
    echo WARNING: mc.exe not found in current directory!
    echo.
    echo Please download mc.exe from:
    echo https://dl.min.io/client/mc/release/windows-amd64/mc.exe
    echo and place it in this directory.
    echo.
    pause
)

REM Install dependencies
echo Installing dependencies...
call npm install

echo.
echo Setup complete!
echo.
echo To run the app in development mode: npm start
echo To build portable app: npm run dist
echo.
pause