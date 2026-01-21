@echo off
REM Quick Start Script for EWallet SDK Documentation Generator (Windows)

echo ==================================================
echo   EWallet SDK Documentation Generator
echo   Quick Start Installation
echo ==================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Found Python
python --version
echo.

REM Ask user which version to use
echo Which version would you like to use?
echo.
echo 1) Standard Version (Simple, uses online service)
echo    - Faster setup
echo    - Requires internet connection
echo    - Good diagram quality
echo.
echo 2) Enhanced Version (Best quality, local rendering)
echo    - Requires Playwright (~300MB)
echo    - Better diagram quality
echo    - Works offline after setup
echo.

set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo 📦 Installing dependencies for Standard Version...
    python -m pip install reportlab requests pillow
    
    if errorlevel 1 (
        echo ❌ Installation failed. Please check error messages.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ Installation complete!
    echo.
    echo 🚀 Generating PDF documentation...
    python generate_ewallet_sdk_documentation.py
    
    if errorlevel 1 (
        echo ❌ Failed to generate PDF. Check error messages above.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ SUCCESS! PDF generated: EWallet_Flutter_SDK_Architecture.pdf
    
) else if "%choice%"=="2" (
    echo.
    echo 📦 Installing dependencies for Enhanced Version...
    python -m pip install reportlab requests pillow playwright
    
    if errorlevel 1 (
        echo ❌ Installation failed. Please check error messages.
        pause
        exit /b 1
    )
    
    echo.
    echo 🌐 Installing Chromium browser for Playwright...
    python -m playwright install chromium
    
    if errorlevel 1 (
        echo ❌ Playwright installation failed.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ Installation complete!
    echo.
    echo 🚀 Generating PDF documentation...
    python generate_ewallet_sdk_doc_enhanced.py
    
    if errorlevel 1 (
        echo ❌ Failed to generate PDF. Check error messages above.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ SUCCESS! PDF generated: EWallet_Flutter_SDK_Architecture.pdf
    
) else (
    echo ❌ Invalid choice. Please run the script again and choose 1 or 2.
    pause
    exit /b 1
)

echo.
echo ==================================================
echo   Documentation generation complete!
echo ==================================================
echo.
pause
