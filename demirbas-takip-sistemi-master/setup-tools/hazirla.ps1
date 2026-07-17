# =============================================================
# hazirla.ps1 — Demirbaş Takip Sistemi Kurulum Paketi Hazırlayıcı
# Eski bilgisayarda çalıştırılır. Paket\ klasörünü oluşturur.
# =============================================================
$ErrorActionPreference = "Stop"

$ScriptDir  = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptDir -Parent
$PaketDir   = Join-Path $ScriptDir "paket"

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Skip($msg)  { Write-Host "    [ATLA] $msg" -ForegroundColor Yellow }
function Write-Warn($msg)  { Write-Host "    [UYARI] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)  { Write-Host "    [HATA] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DEMİRBAŞ TAKİP SİSTEMİ — KURULUM PAKETİ HAZIRLAMA" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Proje kök: $ProjectRoot"
Write-Host "  Paket çıktı: $PaketDir"
Write-Host ""

# Paket klasörü yapısını oluştur
foreach ($d in @(
    "$PaketDir\app\backend",
    "$PaketDir\app\frontend",
    "$PaketDir\database",
    "$PaketDir\uploads",
    "$PaketDir\installers",
    "$PaketDir\tools"
)) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# ─────────────────────────────────────────────────────────────
# Adım 1 — appsettings.json'dan DB bilgilerini oku
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 1 — Proje yapılandırması okunuyor"

$appSettingsPath = Join-Path $ProjectRoot "backend\DemirbasTakip.Api\appsettings.json"
$json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
$connStr  = $json.ConnectionStrings.DefaultConnection
$instance = [regex]::Match($connStr, "Server=([^;]+)").Groups[1].Value
$dbName   = [regex]::Match($connStr, "Database=([^;]+)").Groups[1].Value

Write-OK "DB Instance: $instance"
Write-OK "DB Adı: $dbName"

# ─────────────────────────────────────────────────────────────
# Adım 2 — Backend publish
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 2 — Backend publish ediliyor (.NET)"

$backendProj = Join-Path $ProjectRoot "backend\DemirbasTakip.Api"
$backendOut  = Join-Path $PaketDir "app\backend"

try {
    Push-Location $backendProj
    dotnet publish -c Release -o $backendOut --nologo 2>&1 | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -ne 0) { throw "dotnet publish başarısız (exit: $LASTEXITCODE)" }
    Pop-Location
    Write-OK "Backend publish tamamlandı → $backendOut"
} catch {
    Pop-Location -ErrorAction SilentlyContinue
    Write-Fail "Backend publish hatası: $_"
    throw
}

# ─────────────────────────────────────────────────────────────
# Adım 3 — Logo dosyalarını backend wwwroot'a kopyala
# (BirthdayMailService için gereken görseller)
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 3 — Logo / görsel dosyaları kopyalanıyor"

$srcLogos  = Join-Path $ProjectRoot "frontend\demirbas-takip-ui\public\logos"
$dstLogos  = Join-Path $backendOut "wwwroot\logos"

if (Test-Path $srcLogos) {
    New-Item -ItemType Directory -Path $dstLogos -Force | Out-Null
    Copy-Item -Path "$srcLogos\*" -Destination $dstLogos -Recurse -Force
    Write-OK "Logolar kopyalandı → $dstLogos"
} else {
    Write-Warn "Logo klasörü bulunamadı: $srcLogos (doğum günü görselleri eksik olabilir)"
}

# ─────────────────────────────────────────────────────────────
# Adım 4 — Frontend build
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 4 — Frontend build ediliyor (React/Vite)"

$frontendProj = Join-Path $ProjectRoot "frontend\demirbas-takip-ui"
$frontendOut  = Join-Path $PaketDir "app\frontend"

try {
    Push-Location $frontendProj

    # .env.production oluştur — production build için API URL
    $envContent = "VITE_API_BASE_URL=http://localhost:5000`n"
    Set-Content -Path ".env.production" -Value $envContent -Encoding UTF8
    Write-OK ".env.production oluşturuldu"

    Write-Host "    npm install çalıştırılıyor..." -ForegroundColor Gray
    npm install --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "npm install başarısız" }

    Write-Host "    npm run build çalıştırılıyor..." -ForegroundColor Gray
    npm run build 2>&1 | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -ne 0) { throw "npm run build başarısız (TypeScript veya Vite hatası)" }

    # dist\ içeriğini pakete kopyala
    $distPath = Join-Path $frontendProj "dist"
    if (-not (Test-Path $distPath)) { throw "dist\ klasörü oluşturulmadı" }
    Copy-Item -Path "$distPath\*" -Destination $frontendOut -Recurse -Force

    # Geçici .env.production temizle
    Remove-Item ".env.production" -Force -ErrorAction SilentlyContinue

    Pop-Location
    Write-OK "Frontend build tamamlandı → $frontendOut"
} catch {
    Pop-Location -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $frontendProj ".env.production") -Force -ErrorAction SilentlyContinue
    Write-Fail "Frontend build hatası: $_"
    throw
}

# ─────────────────────────────────────────────────────────────
# Adım 5 — Veritabanı yedeği al
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 5 — Veritabanı yedeği alınıyor ($dbName)"

$bakPath = Join-Path $PaketDir "database\DemirbasTakipDb.bak"
# Backup yolu SQL Server process'inin yazabileceği yerde olmalı — TEMP kullan, sonra kopyala
$tempBak = Join-Path $env:TEMP "DemirbasTakipDb_backup.bak"

$sqlcmdAvailable = $null -ne (Get-Command "sqlcmd" -ErrorAction SilentlyContinue)

if ($sqlcmdAvailable) {
    try {
        $backupQuery = "BACKUP DATABASE [$dbName] TO DISK = N'$tempBak' WITH INIT, FORMAT, COMPRESSION, STATS = 10"
        Write-Host "    sqlcmd çalıştırılıyor..." -ForegroundColor Gray
        sqlcmd -S $instance -E -Q $backupQuery
        if ($LASTEXITCODE -ne 0) { throw "sqlcmd backup başarısız (exit: $LASTEXITCODE)" }
        Copy-Item $tempBak $bakPath -Force
        Remove-Item $tempBak -Force -ErrorAction SilentlyContinue
        $bakSize = [math]::Round((Get-Item $bakPath).Length / 1MB, 1)
        Write-OK "Yedek alındı → $bakPath ($bakSize MB)"
    } catch {
        Write-Warn "Otomatik yedek alınamadı: $_"
        Write-Warn "Manuel yedek için SSMS'te $dbName veritabanına sağ tıklayın → Tasks → Back Up"
        Write-Warn "Yedek dosyasını şuraya kopyalayın: $bakPath"
        Read-Host "Yedeği aldıktan sonra ENTER'a basın..."
    }
} else {
    Write-Warn "sqlcmd bulunamadı. Manuel yedek gerekiyor."
    Write-Host ""
    Write-Host "    SSMS'te $dbName veritabanına sağ tıklayın:" -ForegroundColor Yellow
    Write-Host "    Tasks → Back Up → Disk → Add → $bakPath" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "    Yedeği aldıktan sonra ENTER'a basın..."
    if (-not (Test-Path $bakPath)) {
        Write-Warn "Yedek dosyası bulunamadı: $bakPath — setup.ps1 veritabanı adımını atlayacak"
    } else {
        Write-OK "Yedek dosyası bulundu: $bakPath"
    }
}

# ─────────────────────────────────────────────────────────────
# Adım 6 — Uploads klasörünü kopyala
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 6 — Yüklenmiş dosyalar (uploads) kopyalanıyor"

$srcUploads = Join-Path $ProjectRoot "backend\DemirbasTakip.Api\wwwroot\uploads"
$dstUploads = Join-Path $PaketDir "uploads"

if (Test-Path $srcUploads) {
    Copy-Item -Path "$srcUploads\*" -Destination $dstUploads -Recurse -Force -ErrorAction SilentlyContinue
    $count = (Get-ChildItem $dstUploads -Recurse -File).Count
    Write-OK "$count dosya kopyalandı → $dstUploads"
} else {
    Write-Skip "Uploads klasörü boş veya yok ($srcUploads)"
}

# ─────────────────────────────────────────────────────────────
# Adım 7 — setup.bat ve setup.ps1'i pakete kopyala
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 7 — Installer scriptleri pakete kopyalanıyor"

Copy-Item (Join-Path $ScriptDir "setup.bat") $PaketDir -Force
Copy-Item (Join-Path $ScriptDir "setup.ps1") $PaketDir -Force
Write-OK "setup.bat ve setup.ps1 kopyalandı"

# ─────────────────────────────────────────────────────────────
# Adım 8 — installers\ README oluştur
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 8 — installers\ README oluşturuluyor"

$installersReadme = @"
DEMİRBAŞ TAKİP SİSTEMİ — KURULUM İÇİN GEREKLİ DOSYALAR
=========================================================

Aşağıdaki dosyaları indirip bu klasöre (installers\) kopyalayın.
setup.ps1 bu dosyaları otomatik olarak kurar.

Dosya bulunamazsa ilgili adım atlanır ve manuel kurulum gerekir.

1. dotnet-sdk-10.exe — .NET 10 SDK
   İndir: https://dotnet.microsoft.com/download/dotnet/10.0
   (Windows x64 Installer seçin)
   Dosya adı: dotnet-sdk-10-win-x64.exe
   Bu klasöre kaydet: dotnet-sdk-10.exe

2. node-lts.msi — Node.js LTS
   İndir: https://nodejs.org/en/download
   (Windows Installer (.msi) 64-bit seçin)
   Dosya adı: node-v22.x.x-x64.msi
   Bu klasöre kaydet: node-lts.msi

3. sqlexpress.exe — SQL Server 2022 Express
   İndir: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   (Express → Download now tıklayın)
   Dosya adı: SQL2022-SSEI-Expr.exe
   Bu klasöre kaydet: sqlexpress.exe

4. nssm.exe — Non-Sucking Service Manager
   İndir: https://nssm.cc/download
   (nssm-2.24.zip → win64\nssm.exe dosyasını alın)
   Bu klasöre değil tools\ klasörüne kaydet: tools\nssm.exe

NOT: Bu dosyalar lisans kısıtlamaları nedeniyle pakete dahil edilemez.
"@

Set-Content -Path (Join-Path $PaketDir "installers\README.txt") -Value $installersReadme -Encoding UTF8
New-Item -ItemType Directory -Path (Join-Path $PaketDir "tools") -Force | Out-Null
Set-Content -Path (Join-Path $PaketDir "tools\README.txt") -Value "nssm.exe bu klasöre kopyalanmalı.`nhttps://nssm.cc/download adresinden indirin (win64\nssm.exe)" -Encoding UTF8
Write-OK "README dosyaları oluşturuldu"

# ─────────────────────────────────────────────────────────────
# Adım 9 — OKUBENI.txt oluştur
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 9 — OKUBENI.txt oluşturuluyor"

$okuneniText = @"
================================================================
  DEMİRBAŞ TAKİP SİSTEMİ — KURULUM PAKETİ
  Oluşturulma: $(Get-Date -Format "dd.MM.yyyy HH:mm")
================================================================

KURULUM ADIMLARI
================

1. İNDİRMELER (Önce Yapılacak)
   installers\README.txt dosyasını açın ve listelenen
   4 dosyayı indirerek ilgili klasörlere kopyalayın.

   En az şunlar gereklidir:
   - dotnet-sdk-10.exe  (zorunlu)
   - sqlexpress.exe     (zorunlu, SQL Server yoksa)
   - nssm.exe           (tools\ klasörüne, servis kurulumu için)
   - node-lts.msi       (Node.js yoksa)

2. YÖNETİCİ OLARAK KURULUM
   setup.bat dosyasına ÇİFT TIKLAYIN.
   "Yönetici olarak çalıştır" istemi çıkacak — Evet deyin.

   Kurulum yaklaşık 5-15 dakika sürer.

3. KURULUM SONRASI
   Tarayıcıdan açın: http://localhost:5173

   Ağdaki diğer bilgisayarlardan erişim için:
   http://[BU_BİLGİSAYARIN_IP_ADRESİ]:5173
   (IP: Komut satırında "ipconfig" yazarak öğrenin)

4. SERVİSLER
   Bilgisayar açıldığında otomatik başlar:
   - DemirbasTakipBackend  (http://localhost:5000)
   - DemirbasTakipFrontend (http://localhost:5173)

   Servis durumu için:
   services.msc → DemirbasTakip... aramak

SORUN GİDERME
=============
- "Yönetici değilsiniz" hatası → setup.bat'a sağ tık → Yönetici olarak çalıştır
- Servis başlamıyorsa → C:\DemirbasTakip\backend\logs\ klasörüne bakın
- Veritabanı bağlanamıyor → SQL Server Express servisinin çalıştığını kontrol edin
  (services.msc → MSSQL`$SQLEXPRESS)
- Port meşgul hatası → netstat -an | findstr 5000 veya 5173

PAKET İÇERİĞİ
=============
- app\backend\   : .NET uygulaması ($(Get-Date -Format "dd.MM.yyyy") tarihli)
- app\frontend\  : Web arayüzü
- database\      : Veritabanı yedeği
- uploads\       : Yüklenmiş fotoğraflar
- installers\    : Gerekli kurulum dosyaları (manuel indirilmeli)
- tools\         : Yardımcı araçlar (nssm.exe)

GİRİŞ BİLGİLERİ
===============
Kullanıcı adı ve şifreyi sistem yöneticisinden alın.
(Varsayılan admin hesabı veritabanında korunur)

================================================================
"@

Set-Content -Path (Join-Path $PaketDir "OKUBENI.txt") -Value $okuneniText -Encoding UTF8
Write-OK "OKUBENI.txt oluşturuldu"

# ─────────────────────────────────────────────────────────────
# Tamamlandı
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  PAKET HAZIR!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Konum: $PaketDir" -ForegroundColor Green
Write-Host ""
Write-Host "  Sonraki adımlar:" -ForegroundColor White
Write-Host "  1. paket\installers\README.txt'i okuyun ve dosyaları indirin"
Write-Host "  2. Tüm paket klasörünü yeni bilgisayara kopyalayın (USB/ağ)"
Write-Host "  3. Yeni bilgisayarda setup.bat'a çift tıklayın"
Write-Host ""

# Klasörü Explorer'da aç
Start-Process "explorer.exe" $PaketDir
