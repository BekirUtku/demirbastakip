# DEMİRBAŞ TAKİP SİSTEMİ

Kurumsal demirbaş, zimmet ve personel yönetim sistemi. Personel doğum günü otomasyonu, zimmet tutanağı üretimi ve barkod/etiket baskısı içerir.

---

## TEKNİK YIĞIN

| Katman | Teknoloji |
|--------|-----------|
| Backend | ASP.NET Core 10 Web API (C#) |
| ORM | Entity Framework Core 8 (Code-First) |
| Veritabanı | Microsoft SQL Server (LocalDB veya Express) |
| Kimlik Doğrulama | JWT Bearer Token |
| Frontend | React 18 + Vite + TypeScript + Bootstrap 5 |
| Mail | MailKit (SMTP) |
| Zamanlama | Hangfire |
| PDF | QuestPDF |
| Word | DocumentFormat.OpenXml |
| Barkod | ZXing.Net (backend) + JsBarcode (frontend) |
| Etiket Baskı | QZ Tray |

---

## GEREKSİNİMLER

Aşağıdaki yazılımların kurulu olması gerekir:

### 1. .NET 10 SDK
- İndir: https://dotnet.microsoft.com/download/dotnet/10.0
- `dotnet --version` komutuyla kurulumu doğrulayın (10.x.x çıktısı beklenir)

### 2. Node.js (18 veya üstü)
- İndir: https://nodejs.org/
- `node --version` ile doğrulayın (v18.x.x veya üstü beklenir)

### 3. SQL Server
Aşağıdakilerden **biri** yeterlidir:

- **SQL Server LocalDB** *(önerilen, ücretsiz)*
  - Visual Studio 2022 ile birlikte otomatik gelir
  - Veya ayrıca indir: https://www.microsoft.com/sql-server/sql-server-downloads → "Developer" sürümü
  - Kurulum sonrası `sqllocaldb info` ile çalıştığını doğrulayın

- **SQL Server Express** *(alternatif)*
  - İndir: https://www.microsoft.com/sql-server/sql-server-downloads → "Express" sürümü
  - Kurulum sonrası `appsettings.json` içindeki connection string'i güncelleyin (aşağıya bakın)

### 4. dotnet-ef aracı (migration için)
```bash
dotnet tool install --global dotnet-ef
```

---

## KURULUM VE ÇALIŞTIRMA

Projeyi başlatmak için **iki terminal** açın: biri backend, diğeri frontend için.

### ADIM 1 — Projeyi İndirin

```bash
# ZIP olarak indirdiyseniz, bir klasöre çıkarın.
# Git ile indirdiyseniz:
git clone <repo-url>
cd DemirbasTakipSistemi
```

---

### ADIM 2 — Backend

```bash
# Backend dizinine gidin
cd backend/DemirbasTakip.Api

# NuGet paketlerini yükleyin
dotnet restore

# Veritabanını oluşturun (ilk çalıştırmada zorunlu)
dotnet ef database update

# Backend'i başlatın
dotnet run
```

> Backend `http://localhost:5000` adresinde çalışır.
> **İlk çalıştırmada** migration otomatik uygulanır ve örnek veriler eklenir.

Ek adresler:
- Swagger (API Belgesi): `http://localhost:5000/swagger`
- Hangfire (Zamanlama): `http://localhost:5000/hangfire`

---

### ADIM 3 — Frontend

```bash
# Yeni bir terminal açın, frontend dizinine gidin
cd frontend/demirbas-takip-ui

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

> Uygulama `http://localhost:5173` adresinde çalışır.
> Frontend, `/api` isteklerini otomatik olarak `http://localhost:5000` backend adresine yönlendirir.

---

## VARSAYILAN GİRİŞ BİLGİLERİ

| Alan | Değer |
|------|-------|
| Kullanıcı Adı | `admin` |
| Şifre | `Admin123!` |

---

## YAPILANDIRMA

### Veritabanı Bağlantısı

`backend/DemirbasTakip.Api/appsettings.json` dosyasını düzenleyin:

**LocalDB (varsayılan):**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DemirbasTakipDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True",
  "HangfireConnection": "Server=(localdb)\\mssqllocaldb;Database=DemirbasTakipDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

**SQL Server Express:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.\\SQLEXPRESS;Database=DemirbasTakipDb;Trusted_Connection=True;TrustServerCertificate=True",
  "HangfireConnection": "Server=.\\SQLEXPRESS;Database=DemirbasTakipDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

**Uzak SQL Server:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=SUNUCU_ADI;Database=DemirbasTakipDb;User Id=sa;Password=SIFRE;TrustServerCertificate=True",
  "HangfireConnection": "Server=SUNUCU_ADI;Database=DemirbasTakipDb;User Id=sa;Password=SIFRE;TrustServerCertificate=True"
}
```

---

### Mail Logosu

Mail gönderimlerinde görünecek logo dosyasını şu konuma koyun:

```
backend/DemirbasTakip.Api/wwwroot/images/mail-logo.jpg
```

Logo yoksa mail, logosuz gönderilir — hata oluşmaz.

---

### Firma Logoları (Giriş Ekranı)

```
frontend/demirbas-takip-ui/public/logos/
  ├── lokum_atolyesi.png
  ├── ogas.png
  └── yes_investment.png
```

Logo dosyası bulunamazsa firma adı metin olarak gösterilir.

---

## ÖZELLIKLER

### Personel Yönetimi
- Personel ekleme, düzenleme
- Departman ve firma bazlı listeleme
- İşten ayrılış tarihi kaydetme (pasife alma)
- Aktif / Pasif / Tümü filtresi

### Demirbaş Yönetimi
- Barkod otomatik üretimi (`B000001`, `B000002`, ...)
- Kategori bazlı dinamik özellik alanları
- Barkod PNG indirme, ZPL/etiket baskısı (QZ Tray)

### Zimmet Takibi
- Personele demirbaş zimmetleme
- İade kayıt etme
- Word formatında zimmet tutanağı indirme

### Doğum Günü Mail Otomasyonu
- Hangfire her dakika çalışır
- Mail Ayarları sayfasından SMTP ve gönderim saati ayarlanır
- Belirlenen saatte yalnızca **aktif** personele otomatik mail gönderilir
- Manuel "Şimdi Gönder" butonu
- Yöneticiye PDF rapor eki ile özet mail

**Mail şablonu placeholder'ları:**

| Placeholder | Açıklama |
|-------------|----------|
| `{PersonelAdSoyad}` | Personelin tam adı |
| `{PersonelAd}` | Personelin adı |
| `{PersonelFirma}` | Personelin firmasi |

---

## PROJE YAPISI

```
DemirbasTakipSistemi/
├── backend/
│   └── DemirbasTakip.Api/
│       ├── Controllers/          → API endpoint'leri
│       ├── Data/                 → DbContext, SeedData, Migrations
│       ├── Models/
│       │   ├── Entities/         → EF Core entity'leri
│       │   ├── DTOs/             → Veri transfer nesneleri
│       │   └── Enums/            → Enum tanımları
│       ├── Services/             → İş mantığı servisleri
│       ├── Middleware/           → Global exception handler
│       ├── wwwroot/images/       → mail-logo.jpg buraya
│       ├── Properties/
│       │   └── launchSettings.json  → Port: 5000
│       ├── Program.cs            → Uygulama konfigürasyonu
│       └── appsettings.json      → Ayarlar (DB, JWT, Serilog)
│
└── frontend/
    └── demirbas-takip-ui/
        ├── src/
        │   ├── pages/            → Sayfa bileşenleri
        │   ├── components/       → Yeniden kullanılabilir bileşenler
        │   ├── services/api.ts   → Axios (JWT interceptor)
        │   ├── contexts/         → Auth Context
        │   ├── types/            → TypeScript tip tanımları
        │   └── styles/           → CSS tema
        ├── public/logos/         → Firma logoları
        ├── vite.config.ts        → Proxy: /api → localhost:5000
        └── .env.example          → Ortam değişkeni şablonu
```

---

## QZ TRAY (ETİKET BASKISI)

QZ Tray, barkod etiketlerini ağ yazıcılarına ve etiket makinelerine (ZPL) gönderir.

1. https://qz.io/download/ adresinden indirin ve kurun
2. QZ Tray'i arka planda çalıştırın
3. Demirbaşlar sayfasından "Yazdır" butonuna tıklayın → "ETİKET YAZICISI (ZPL)" seçeneği aktif olur

> QZ Tray çalışmıyorsa "TARAYICIDA YAZDIR / PDF KAYDET" seçeneği kullanılabilir.

---

## SORUN GİDERME

### `dotnet ef` komutu bulunamıyor
```bash
dotnet tool install --global dotnet-ef
```

### LocalDB bulunamıyor hatası
```
A network-related or instance-specific error...
```
LocalDB servisini başlatın:
```bash
sqllocaldb start mssqllocaldb
```
Çalışmıyorsa Visual Studio Installer'dan "SQL Server Express LocalDB" bileşenini yükleyin.

### Migration hatası — tablo zaten mevcut
Veritabanını silip yeniden oluşturun:
```bash
dotnet ef database drop --force
dotnet ef database update
```

### CORS hatası (frontend API'ye ulaşamıyor)
- Backend `http://localhost:5000` adresinde çalışıyor olmalı
- Frontend `http://localhost:5173` adresinde çalışıyor olmalı
- İkisi de aynı anda açık olmalı

### Port 5000 kullanımda
`backend/DemirbasTakip.Api/Properties/launchSettings.json` dosyasında portu değiştirin:
```json
"applicationUrl": "http://localhost:5001"
```
Ardından `frontend/demirbas-takip-ui/vite.config.ts` içinde de güncellemeniz gerekir:
```ts
target: 'http://localhost:5001'
```

### Gmail ile mail gönderilemedi
Gmail, normal şifre yerine "Uygulama Şifresi" (App Password) gerektirir:
1. Google Hesabı → Güvenlik → 2 Adımlı Doğrulama açık olmalı
2. Güvenlik → Uygulama Şifreleri → Yeni oluşturun
3. Oluşturulan 16 haneli şifreyi Mail Ayarları'na girin
4. Port: `587`, SSL: Açık

### Outlook ile mail gönderilemedi
- Host: `smtp.office365.com`, Port: `587`, SSL: Açık
- Kullanıcı adı olarak tam e-posta adresinizi girin

---

## MİGRASYON KOMUTLARI

```bash
# Yeni migration oluştur
dotnet ef migrations add MigrationAdi

# Migration uygula
dotnet ef database update

# Son migration'ı geri al
dotnet ef migrations remove

# Belirli bir migration'a dön
dotnet ef database update OncekiMigrationAdi
```
