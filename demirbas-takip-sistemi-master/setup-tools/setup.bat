@echo off
echo Demirbaş Takip Sistemi - Kurulum Başlatılıyor
echo ================================================
echo Yönetici izni isteniyor...
PowerShell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0setup.ps1""' -Verb RunAs -Wait"
pause
