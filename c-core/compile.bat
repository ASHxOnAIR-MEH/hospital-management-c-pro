@echo off
REM ==============================================================================
REM compile.bat - Hospital Bed Monitoring System (C Core Module)
REM Windows Build Script
REM ==============================================================================

echo [HOSPITAL BED MONITORING SYSTEM] Compiling C Core Module...

where gcc >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Found GCC compiler. Compiling...
    gcc -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed.exe
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Compilation successful! Created hospital_bed.exe
        echo Run './hospital_bed.exe' or 'compile.bat run' to launch.
        if "%1"=="run" (
            echo Launching Hospital Bed Monitoring System...
            hospital_bed.exe
        )
        exit /b 0
    ) else (
        echo [ERROR] GCC compilation failed. Check error messages above.
        exit /b 1
    )
)

where clang >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Found Clang compiler. Compiling...
    clang -Wall -Wextra -std=c99 main.c bed.c validation.c filter.c report.c -o hospital_bed.exe
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Compilation successful! Created hospital_bed.exe
        echo Run './hospital_bed.exe' or 'compile.bat run' to launch.
        if "%1"=="run" (
            echo Launching Hospital Bed Monitoring System...
            hospital_bed.exe
        )
        exit /b 0
    ) else (
        echo [ERROR] Clang compilation failed. Check error messages above.
        exit /b 1
    )
)

echo.
echo [NOTICE] Neither GCC nor Clang was detected directly in your Windows PATH.
echo.
echo You can compile this project using any of the following options:
echo  1. Install MinGW-w64 or GCC on Windows (e.g. winget install -e --id MSYS2.MSYS2)
echo  2. Use Visual Studio Developer Command Prompt:
echo     cl main.c bed.c validation.c filter.c report.c /Fe:hospital_bed.exe
echo  3. Compile inside WSL (Windows Subsystem for Linux) or Linux terminal:
echo     gcc main.c bed.c validation.c filter.c report.c -o hospital_bed
echo  4. Upload and run on OnlineGDB / Replit:
echo     https://www.onlinegdb.com/online_c_compiler
echo.
exit /b 1
