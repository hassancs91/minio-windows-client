@echo off
echo Building MinIO MC Wrapper v2.0...
echo.

REM Check if mc.exe exists
if not exist "mc.exe" (
    echo ERROR: mc.exe not found!
    echo Please download from https://dl.min.io/client/mc/release/windows-amd64/mc.exe
    pause
    exit /b 1
)

REM Clean previous builds
echo Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"

REM Build the app
echo Building portable executable...
call npm run dist

if %errorlevel% neq 0 (
    echo.
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful!
echo Look for the portable .exe in the 'dist' folder
echo.
pause