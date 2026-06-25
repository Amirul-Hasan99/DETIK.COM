@echo off
echo ===================================================
echo   Git Auto Push to Amirul-Hasan99/DETIK.COM
echo ===================================================

set /p message="Masukkan pesan commit: "

if "%message%"=="" (
    echo Pesan commit tidak boleh kosong. Dibatalkan.
    pause
    exit /b
)

echo.
echo Menambahkan file ke staging area...
git add .

echo.
echo Melakukan commit...
git commit -m "%message%"

echo.
echo Melakukan push ke GitHub repository...
git push origin main

echo.
echo Melakukan push ke Hugging Face Space...
git push huggingface main

echo.
echo Selesai!
pause
