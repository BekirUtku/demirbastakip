# =============================================================
# setup.ps1 — Demirbaş Takip Sistemi Yeni Bilgisayar Kurulumu
# YÖNETİCİ OLARAK çalıştırılmalıdır (setup.bat otomatik sağlar)
# =============================================================
$ErrorActionPreference = "Stop"

$ScriptDir  = $PSScriptRoot
$InstallDir = "C:\DemirbasTakip"
$DbName     = "DemirbasTakipDb"
$SqlInstance = "localhost\SQLEXPRESS"

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Skip($msg)  { Write-Host "    [ATLA] $msg" -ForegroundColor Yellow }
function Write-Warn($msg)  { Write-Host "    [UYARI] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)  { Write-Host "    [HATA] $msg" -ForegroundColor Red }

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DEMİRBAŞ TAKİP SİSTEMİ — KURULUM" -ForegroundColor Cyan
Write-Host "  Başlangıç: $(Get-Date -Format 'dd.MM.yyyy HH:mm')" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────
# Adım 1 — Yönetici kontrolü
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 1 — Yönetici yetkisi kontrol ediliyor"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Fail "Bu script yönetici olarak çalışmalıdır!"
    Write-Host "    setup.bat dosyasını kullanın (otomatik yönetici izni ister)." -ForegroundColor Red
    Read-Host "Çıkmak için ENTER'a basın"
    exit 1
}
Write-OK "Yönetici yetkisi mevcut"

# ─────────────────────────────────────────────────────────────
# Adım 2 — .NET 10 SDK
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 2 — .NET SDK kontrol ediliyor"

$dotnetOk = $false
try {
    $dotnetVer = (dotnet --version 2>$null)
    if ($dotnetVer -match "^10\.") {
        Write-OK ".NET $dotnetVer zaten kurulu — atlanıyor"
        $dotnetOk = $true
    } else {
        Write-Warn ".NET $dotnetVer bulundu ancak .NET 10 gerekiyor"
    }
} catch {
    Write-Warn ".NET bulunamadı"
}

if (-not $dotnetOk) {
    $installer = Join-Path $ScriptDir "installers\dotnet-sdk-10.exe"
    if (Test-Path $installer) {
        Write-Host "    .NET 10 SDK kuruluyor (birkaç dakika sürebilir)..." -ForegroundColor Gray
        Start-Process $installer -ArgumentList "/install /quiet /norestart" -Wait -NoNewWindow
        Refresh-Path
        $newVer = (dotnet --version 2>$null)
        if ($newVer -match "^10\.") {
            Write-OK ".NET $newVer kuruldu"
        } else {
            Write-Fail ".NET 10 kurulumu doğrulanamadı. Manuel kurun:"
            Write-Host "    https://dotnet.microsoft.com/download/dotnet/10.0" -ForegroundColor Yellow
            Read-Host "Kurulumu tamamladıktan sonra ENTER'a basın"
            Refresh-Path
        }
    } else {
        Write-Fail "installers\dotnet-sdk-10.exe bulunamadı!"
        Write-Host "    İndir: https://dotnet.microsoft.com/download/dotnet/10.0" -ForegroundColor Yellow
        Write-Host "    'dotnet-sdk-10.exe' adıyla installers\ klasörüne kaydet" -ForegroundColor Yellow
        Read-Host "Kurulumu tamamladıktan sonra ENTER'a basın"
        Refresh-Path
    }
}

# ─────────────────────────────────────────────────────────────
# Adım 3 — Node.js
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 3 — Node.js kontrol ediliyor"

$nodeOk = $false
try {
    $nodeVer = (node --version 2>$null)
    if ($nodeVer) {
        Write-OK "Node.js $nodeVer zaten kurulu — atlanıyor"
        $nodeOk = $true
    }
} catch { }

if (-not $nodeOk) {
    $installer = Join-Path $ScriptDir "installers\node-lts.msi"
    if (Test-Path $installer) {
        Write-Host "    Node.js kuruluyor..." -ForegroundColor Gray
        Start-Process "msiexec.exe" -ArgumentList "/i `"$installer`" /quiet /norestart" -Wait -NoNewWindow
        Refresh-Path
        $newVer = (node --version 2>$null)
        if ($newVer) { Write-OK "Node.js $newVer kuruldu" }
        else { Write-Warn "Node.js kurulumu doğrulanamadı — devam ediliyor" }
    } else {
        Write-Warn "installers\node-lts.msi bulunamadı!"
        Write-Host "    İndir: https://nodejs.org/en/download" -ForegroundColor Yellow
        Read-Host "Kurulumu tamamladıktan sonra ENTER'a basın"
        Refresh-Path
    }
}

# ─────────────────────────────────────────────────────────────
# Adım 4 — SQL Server Express
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 4 — SQL Server Express kontrol ediliyor"

$sqlOk = $false
$sqlService = Get-Service "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
if ($sqlService) {
    Write-OK "SQL Server Express zaten kurulu — atlanıyor"
    if ($sqlService.Status -ne "Running") {
        Start-Service "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
        Write-OK "SQL Server Express servisi başlatıldı"
    }
    $sqlOk = $true
}

if (-not $sqlOk) {
    $installer = Join-Path $ScriptDir "installers\sqlexpress.exe"
    if (Test-Path $installer) {
        Write-Host "    SQL Server Express kuruluyor (5-10 dakika sürebilir)..." -ForegroundColor Gray
        $sqlArgs = "/ACTION=Install /FEATURES=SQLEngine /INSTANCENAME=SQLEXPRESS " +
                   "/SQLSYSADMINACCOUNTS=`"BUILTIN\Administrators`" /TCPENABLED=1 " +
                   "/IACCEPTSQLSERVERLICENSETERMS /QUIET /INDICATEPROGRESS"
        $proc = Start-Process $installer -ArgumentList $sqlArgs -Wait -PassThru -NoNewWindow
        if ($proc.ExitCode -in @(0, 3010)) {
            # TCP/IP protokolünü etkinleştir
            try {
                Import-Module SqlServer -ErrorAction SilentlyContinue
                $smo = "Microsoft.SqlServer.Management.Smo"
                [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.SqlServer.SqlWmiManagement") | Out-Null
                $mc = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer
                $sqlInst = $mc.ServerInstances["SQLEXPRESS"]
                $np = $sqlInst.ServerProtocols["Tcp"]
                $np.IsEnabled = $true
                $np.Alter()
            } catch { }

            # SQL Server Browser servisi başlat
            Set-Service "SQLBrowser" -StartupType Automatic -ErrorAction SilentlyContinue
            Start-Service "SQLBrowser" -ErrorAction SilentlyContinue

            Start-Service "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
            Write-OK "SQL Server Express kuruldu ve başlatıldı"
        } else {
            Write-Fail "SQL Server kurulumu başarısız (exit: $($proc.ExitCode))"
            Write-Host "    Manuel kurulum: https://www.microsoft.com/sql-server/sql-server-downloads" -ForegroundColor Yellow
            Read-Host "Kurulumu tamamladıktan sonra ENTER'a basın"
        }
    } else {
        Write-Fail "installers\sqlexpress.exe bulunamadı!"
        Write-Host "    İndir: https://www.microsoft.com/sql-server/sql-server-downloads" -ForegroundColor Yellow
        Read-Host "Kurulumu tamamladıktan sonra ENTER'a basın"
    }
}

# ─────────────────────────────────────────────────────────────
# Adım 5 — Uygulama dosyalarını kopyala
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 5 — Uygulama dosyaları kopyalanıyor → $InstallDir"

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\backend\wwwroot\uploads" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\backend\wwwroot\logos" -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallDir\backend\logs" -Force | Out-Null

# Backend
$backendSrc = Join-Path $ScriptDir "app\backend"
if (Test-Path $backendSrc) {
    Copy-Item -Path "$backendSrc\*" -Destination "$InstallDir\backend\" -Recurse -Force
    Write-OK "Backend kopyalandı → $InstallDir\backend\"
} else {
    Write-Fail "app\backend\ bulunamadı!"
    throw "Backend dosyaları eksik"
}

# Frontend
$frontendSrc = Join-Path $ScriptDir "app\frontend"
if (Test-Path $frontendSrc) {
    Copy-Item -Path "$frontendSrc\*" -Destination "$InstallDir\frontend\" -Recurse -Force
    Write-OK "Frontend kopyalandı → $InstallDir\frontend\"
} else {
    Write-Fail "app\frontend\ bulunamadı!"
    throw "Frontend dosyaları eksik"
}

# Uploads
$uploadsSrc = Join-Path $ScriptDir "uploads"
if ((Test-Path $uploadsSrc) -and (Get-ChildItem $uploadsSrc -Recurse -File).Count -gt 0) {
    Copy-Item -Path "$uploadsSrc\*" -Destination "$InstallDir\backend\wwwroot\uploads\" -Recurse -Force -ErrorAction SilentlyContinue
    $count = (Get-ChildItem "$InstallDir\backend\wwwroot\uploads" -Recurse -File).Count
    Write-OK "$count yüklenmiş dosya kopyalandı"
} else {
    Write-Skip "Uploads klasörü boş — atlandı"
}

Write-OK "Dosyalar kopyalandı"

# ─────────────────────────────────────────────────────────────
# Adım 6 — appsettings.json güncelle
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 6 — Yapılandırma dosyası güncelleniyor"

$appSettingsPath = "$InstallDir\backend\appsettings.json"

try {
    $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json

    # Connection string'i SQLEXPRESS'e güncelle
    $newConn = "Server=localhost\SQLEXPRESS;Database=$DbName;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
    $json.ConnectionStrings.DefaultConnection  = $newConn
    $json.ConnectionStrings.HangfireConnection = $newConn

    # BirthdayImages yollarını yeni makineye göre güncelle
    if ($json.BirthdayImages) {
        $json.BirthdayImages.Default = "C:\DemirbasTakip\backend\wwwroot\logos\LA-Bday-Picture.png"
        $json.BirthdayImages.Ogas   = "C:\DemirbasTakip\backend\wwwroot\logos\O-Bday-Picture.png"
    }

    $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
    Write-OK "Connection string → $SqlInstance"
    Write-OK "BirthdayImages yolları güncellendi"
} catch {
    Write-Warn "appsettings.json güncellenemedi: $_"
    Write-Warn "Manuel güncelleme gerekebilir: $appSettingsPath"
}

# ─────────────────────────────────────────────────────────────
# Adım 7 — Veritabanını restore et
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 7 — Veritabanı yükleniyor"

$bakFile = Join-Path $ScriptDir "database\DemirbasTakipDb.bak"
$sqlcmdPath = $null

# sqlcmd'yi bul
@(
    "sqlcmd",
    "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\180\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\110\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\120\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\130\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\140\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\sqlcmd.exe",
    "C:\Program Files\Microsoft SQL Server\160\Tools\Binn\sqlcmd.exe"
) | ForEach-Object {
    if (-not $sqlcmdPath) {
        $cmd = Get-Command $_ -ErrorAction SilentlyContinue
        if ($cmd) { $sqlcmdPath = $cmd.Source }
        elseif (Test-Path $_) { $sqlcmdPath = $_ }
    }
}

# SQL Server DATA klasörünü otomatik bul
$dataPath = $null
@("MSSQL17","MSSQL16","MSSQL15","MSSQL14","MSSQL13") | ForEach-Object {
    $p = "C:\Program Files\Microsoft SQL Server\$_.SQLEXPRESS\MSSQL\DATA"
    if (-not $dataPath -and (Test-Path $p)) { $dataPath = $p }
}
if (-not $dataPath) {
    # Wildcard ile dene
    $found = Get-Item "C:\Program Files\Microsoft SQL Server\MSSQL*.SQLEXPRESS\MSSQL\DATA" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $dataPath = $found.FullName }
    else { $dataPath = "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA" }
}
Write-Host "    DATA klasörü: $dataPath" -ForegroundColor Gray

if (-not (Test-Path $bakFile)) {
    Write-Warn "Yedek dosyası bulunamadı: $bakFile"
    Write-Warn "Uygulama ilk çalıştırıldığında boş veritabanı oluşturulacak."
} elseif (-not $sqlcmdPath) {
    Write-Warn "sqlcmd bulunamadı — veritabanı restore edilemedi"
    Write-Warn "SSMS'te manuel restore yapın: $bakFile → $DbName"
} else {
    try {
        # Önce varsa bağlantıları kes
        $killQuery = @"
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = '$DbName')
BEGIN
    ALTER DATABASE [$DbName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
END
"@
        & $sqlcmdPath -S $SqlInstance -E -Q $killQuery 2>$null | Out-Null

        # Restore
        $restoreQuery = @"
RESTORE DATABASE [$DbName]
FROM DISK = N'$bakFile'
WITH
    MOVE '$DbName' TO '$dataPath\$DbName.mdf',
    MOVE '${DbName}_log' TO '$dataPath\${DbName}_log.ldf',
    REPLACE, RECOVERY, STATS = 10;
ALTER DATABASE [$DbName] SET MULTI_USER;
"@
        Write-Host "    Restore çalıştırılıyor (büyük veritabanları için birkaç dakika sürebilir)..." -ForegroundColor Gray
        & $sqlcmdPath -S $SqlInstance -E -Q $restoreQuery

        if ($LASTEXITCODE -eq 0) {
            Write-OK "Veritabanı restore edildi: $DbName"
        } else {
            # Logical name hatası olabilir — filelistonly ile öğren
            Write-Warn "İlk restore denemesi başarısız, dosya isimleri tespit ediliyor..."
            $fileList = & $sqlcmdPath -S $SqlInstance -E -Q "RESTORE FILELISTONLY FROM DISK = N'$bakFile'" 2>&1
            Write-Host "    $fileList" -ForegroundColor Gray
            Write-Warn "Lütfen SSMS'te manuel restore yapın: $bakFile → $DbName"
        }
    } catch {
        Write-Warn "Veritabanı restore hatası: $_"
        Write-Warn "SSMS'te manuel restore gerekli: $bakFile → $DbName"
    }
}

# ─────────────────────────────────────────────────────────────
# Adım 8 — serve paketi kur (frontend için)
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 8 — 'serve' npm paketi kuruluyor"

try {
    $serveCheck = npm list -g serve --depth=0 2>$null
    if ($serveCheck -match "serve") {
        Write-OK "serve zaten kurulu — atlandı"
    } else {
        Write-Host "    npm install -g serve çalıştırılıyor..." -ForegroundColor Gray
        npm install -g serve --silent 2>&1 | Out-Null
        Write-OK "serve paketi kuruldu"
    }
} catch {
    Write-Warn "serve kurulumu başarısız: $_ — frontend servisi npx ile denenecek"
}

Refresh-Path

# ─────────────────────────────────────────────────────────────
# Adım 9 — NSSM ile Windows servisleri kur
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 9 — Windows servisleri kuruluyor (NSSM)"

# nssm.exe'yi bul
$nssmPath = $null
@(
    (Join-Path $ScriptDir "tools\nssm.exe"),
    "C:\nssm\nssm.exe",
    (Join-Path $env:ProgramFiles "nssm\nssm.exe")
) | ForEach-Object {
    if (-not $nssmPath -and (Test-Path $_)) { $nssmPath = $_ }
}

if (-not $nssmPath) {
    # winget ile dene
    try {
        winget install NSSM.NSSM --silent 2>$null | Out-Null
        Refresh-Path
        $nssmPath = (Get-Command "nssm" -ErrorAction SilentlyContinue)?.Source
    } catch { }
}

# dotnet.exe yolunu bul
$dotnetExe = (Get-Command "dotnet" -ErrorAction SilentlyContinue)?.Source
if (-not $dotnetExe) { $dotnetExe = "C:\Program Files\dotnet\dotnet.exe" }

# serve.cmd yolunu bul
$serveCmd = $null
try {
    $npmPrefix = (npm prefix -g 2>$null).Trim()
    $serveCmd = Join-Path $npmPrefix "serve.cmd"
    if (-not (Test-Path $serveCmd)) { $serveCmd = $null }
} catch { }
if (-not $serveCmd) { $serveCmd = "serve" }

if ($nssmPath) {
    Write-Host "    NSSM: $nssmPath" -ForegroundColor Gray

    # Mevcut servisleri kaldır (yeniden kurulum için)
    foreach ($svc in @("DemirbasTakipBackend", "DemirbasTakipFrontend")) {
        $existing = Get-Service $svc -ErrorAction SilentlyContinue
        if ($existing) {
            if ($existing.Status -eq "Running") { Stop-Service $svc -Force -ErrorAction SilentlyContinue }
            & $nssmPath remove $svc confirm 2>$null | Out-Null
            Write-Host "    Mevcut '$svc' servisi kaldırıldı" -ForegroundColor Gray
        }
    }

    # Backend servisi
    & $nssmPath install DemirbasTakipBackend "$dotnetExe" "$InstallDir\backend\DemirbasTakip.Api.dll --urls http://0.0.0.0:5000"
    & $nssmPath set DemirbasTakipBackend AppDirectory "$InstallDir\backend"
    & $nssmPath set DemirbasTakipBackend DisplayName "Demirbaş Takip - Backend API"
    & $nssmPath set DemirbasTakipBackend Description "Demirbaş Takip Sistemi ASP.NET Core Backend"
    & $nssmPath set DemirbasTakipBackend Start SERVICE_AUTO_START
    & $nssmPath set DemirbasTakipBackend AppStdout "$InstallDir\backend\logs\backend-stdout.log"
    & $nssmPath set DemirbasTakipBackend AppStderr "$InstallDir\backend\logs\backend-stderr.log"
    & $nssmPath set DemirbasTakipBackend AppRotateFiles 1
    & $nssmPath set DemirbasTakipBackend AppRotateSeconds 86400
    Write-OK "Backend servisi kuruldu (DemirbasTakipBackend)"

    # Frontend servisi
    if ($serveCmd -ne "serve") {
        & $nssmPath install DemirbasTakipFrontend "$serveCmd" "-s `"$InstallDir\frontend`" -l 5173 --no-clipboard"
    } else {
        & $nssmPath install DemirbasTakipFrontend "cmd" "/c `"serve -s `"$InstallDir\frontend`" -l 5173 --no-clipboard`""
    }
    & $nssmPath set DemirbasTakipFrontend AppDirectory "$InstallDir\frontend"
    & $nssmPath set DemirbasTakipFrontend DisplayName "Demirbaş Takip - Frontend Web"
    & $nssmPath set DemirbasTakipFrontend Description "Demirbaş Takip Sistemi React Frontend"
    & $nssmPath set DemirbasTakipFrontend Start SERVICE_AUTO_START
    & $nssmPath set DemirbasTakipFrontend AppStdout "$InstallDir\backend\logs\frontend-stdout.log"
    & $nssmPath set DemirbasTakipFrontend AppStderr "$InstallDir\backend\logs\frontend-stderr.log"
    Write-OK "Frontend servisi kuruldu (DemirbasTakipFrontend)"
} else {
    Write-Warn "nssm.exe bulunamadı — servis kurulumu atlandı"
    Write-Warn "tools\nssm.exe'yi koyup setup.ps1'i yeniden çalıştırın"
    Write-Warn "Ya da Başlangıç klasörüne kısayol oluşturuluyor..."

    # Fallback: Başlangıç klasörüne .bat yaz
    $startupDir = [System.Environment]::GetFolderPath("CommonStartup")
    $backendBat = @"
@echo off
cd /d "$InstallDir\backend"
start /B "$dotnetExe" DemirbasTakip.Api.dll --urls http://0.0.0.0:5000
"@
    $frontendBat = @"
@echo off
start /B serve -s "$InstallDir\frontend" -l 5173
"@
    Set-Content "$startupDir\DemirbasTakipBackend.bat" $backendBat -Encoding ASCII
    Set-Content "$startupDir\DemirbasTakipFrontend.bat" $frontendBat -Encoding ASCII
    Write-Warn "Başlangıç .bat dosyaları oluşturuldu (servis değil, oturum gerektirir)"
}

# ─────────────────────────────────────────────────────────────
# Adım 10 — Firewall kuralları
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 10 — Güvenlik duvarı kuralları ekleniyor"

try {
    $existingRules = Get-NetFirewallRule -DisplayName "DemirbasTakip*" -ErrorAction SilentlyContinue
    if ($existingRules) {
        $existingRules | Remove-NetFirewallRule -ErrorAction SilentlyContinue
    }
    New-NetFirewallRule -DisplayName "DemirbasTakip Backend (5000)"  -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Any | Out-Null
    New-NetFirewallRule -DisplayName "DemirbasTakip Frontend (5173)" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any | Out-Null
    Write-OK "Firewall kuralları eklendi (5000, 5173)"
} catch {
    Write-Warn "Firewall kuralları eklenemedi: $_"
    Write-Warn "Ağdaki diğer bilgisayarlar erişemeyebilir — manuel ekleme gerekebilir"
}

# ─────────────────────────────────────────────────────────────
# Adım 11 — Servisleri başlat
# ─────────────────────────────────────────────────────────────
Write-Step "Adım 11 — Servisler başlatılıyor"

$backendStarted = $false
$frontendStarted = $false

# Backend servisi başlat
try {
    $svc = Get-Service "DemirbasTakipBackend" -ErrorAction Stop
    Start-Service "DemirbasTakipBackend"
    Start-Sleep -Seconds 3
    $svc.Refresh()
    if ($svc.Status -eq "Running") {
        Write-OK "Backend başlatıldı (http://localhost:5000)"
        $backendStarted = $true
    } else {
        Write-Warn "Backend servisi Running değil — durum: $($svc.Status)"
    }
} catch {
    Write-Warn "Backend servisi başlatılamadı: $_"
}

# Frontend servisi başlat
try {
    $svc = Get-Service "DemirbasTakipFrontend" -ErrorAction Stop
    Start-Service "DemirbasTakipFrontend"
    Start-Sleep -Seconds 2
    $svc.Refresh()
    if ($svc.Status -eq "Running") {
        Write-OK "Frontend başlatıldı (http://localhost:5173)"
        $frontendStarted = $true
    } else {
        Write-Warn "Frontend servisi Running değil — durum: $($svc.Status)"
    }
} catch {
    Write-Warn "Frontend servisi başlatılamadı: $_"
}

# ─────────────────────────────────────────────────────────────
# Tamamlandı
# ─────────────────────────────────────────────────────────────
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\." } | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  KURULUM TAMAMLANDI!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Bu bilgisayardan     : http://localhost:5173" -ForegroundColor White
if ($localIp) {
    Write-Host "  Ağdaki diğer PC'den : http://${localIp}:5173" -ForegroundColor White
}
Write-Host ""
Write-Host "  Kurulum dizini    : $InstallDir" -ForegroundColor Gray
Write-Host "  Loglar            : $InstallDir\backend\logs\" -ForegroundColor Gray
Write-Host ""

if (-not $backendStarted -or -not $frontendStarted) {
    Write-Host "  ⚠ Bazı servisler başlatılamadı." -ForegroundColor Yellow
    Write-Host "    services.msc'de DemirbasTakip servislerini kontrol edin." -ForegroundColor Yellow
    Write-Host "    Hata detayı: $InstallDir\backend\logs\" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "  Servisler bilgisayar açılışında otomatik başlar." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Çıkmak için ENTER'a basın"
