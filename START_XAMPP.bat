@echo off
REM START_XAMPP.bat - Start XAMPP and QR Treasure Hunt Application

echo.
echo ================================
echo QR Treasure Hunt - PHP Version
echo ================================
echo.

REM Check if XAMPP is installed
if exist "C:\xampp\xampp_start.exe" (
    echo Starting XAMPP...
    start "" "C:\xampp\xampp_start.exe"
    timeout /t 5
) else (
    echo.
    echo ERROR: XAMPP not found at C:\xampp\
    echo.
    echo Download and install XAMPP from:
    echo https://www.apachefriends.org/download.html
    echo.
    pause
    exit /b 1
)

REM Wait for services to start
echo Waiting for services to start...
timeout /t 5 /nobreak

REM Open browser
echo Opening application...
start "" "http://localhost/qr-treasure-hunt/"

echo.
echo ✅ Application opened!
echo.
echo 📍 Application URL: http://localhost/qr-treasure-hunt/
echo.
echo 🔐 Default Login:
echo    Email: admin@example.com
echo    Password: admin123
echo    Select: Admin Login
echo.
echo 📚 Setup Guide: Open PHP_SETUP.md for detailed instructions
echo.
echo Note: Keep XAMPP running while using the application!
echo.
pause
