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
echo Melakukan push ke Hugging Face Space dengan Git LFS...
git checkout --orphan hf-deploy
git lfs install
git lfs track "*.pkl"
git lfs track "*.db"
git add .
git commit -m "Deploy to Hugging Face"
git push -f huggingface hf-deploy:main
git checkout main
git branch -D hf-deploy

echo.
echo Selesai!
pause
