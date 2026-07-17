# DB Migration Analiz Raporu
**Tarih:** 2026-06-03  
**Kaynak:** DemirbasTakipDB_OLD (eski production)  
**Hedef:** DemirbasTakipDB (yeni şema, EF Core)

---

## ⚠️ Önemli Uyarı — Export Dosyaları

`01_old_schema.txt` → `07_old_data_samples.txt` dosyalarının **tamamı SQL Server bağlantı hatası** içeriyor.  
Şema export scriptleri çalıştırılırken `localhost\SQLEXPRESS`'e ulaşılamadı.

**Eski DB şeması bu raporda EF Core migration'larından çıkarılan bilgiye dayalı varsayımlarla üretilmiştir.**  
Migration öncesinde `00_discover_old_schema.sql` scriptini çalıştırarak gerçek eski şemayı doğrula.

---

## 1. Tablo Karşılaştırması

### Yeni DB'de var, Eski DB'de YOK (migration hedefi değil)

| Tablo | Açıklama |
|---|---|
| `AssetPhotos` | Yeni özellik — demirbaş fotoğrafları. Eski DB'de karşılık yok, boş kalacak. |
| `AssignmentPhotos` | Yeni özellik — zimmet fotoğrafları. Eski DB'de karşılık yok, boş kalacak. |

### Her iki DB'de de var (migration hedefi)

| Tablo | Kayıt Taşınacak mı? |
|---|---|
| `Companies` | ✅ Evet |
| `Departments` | ✅ Evet |
| `Categories` | ✅ Evet |
| `CategoryQuestions` | ✅ Evet |
| `Assets` | ✅ Evet |
| `AssetAnswers` | ✅ Evet |
| `Personnel` | ✅ Evet |
| `Assignments` | ✅ Evet |
| `MailLogs` | ✅ Evet (isteğe bağlı) |
| `MailSettings` | ⚠️ Kısmen — yeni DB'deki konfigürasyon korunacak, eski üzerine yazılmayacak |
| `AdminUsers` | ⚠️ Kısmen — mevcut admin korunacak, eski DB'deki ek kullanıcılar eklenecek |

---

## 2. Kolon Karşılaştırması

### 2.1 Yeni DB'de var, Eski DB'de MUHTEMELEN YOK — Audit Alanları

Aşağıdaki alanlar yeni şemada zorunlu (NOT NULL), eski DB'de büyük ihtimalle yok.  
Migration script'te `DEFAULT` değerler atanacak.

| Tablo | Yeni Kolon | NOT NULL | Default Değer |
|---|---|---|---|
| `Departments` | `CreatedAt` | ✅ | `GETDATE()` |
| `Departments` | `CreatedByUserId` | ✅ | `1` (admin) |
| `Departments` | `CreatedByUserName` | ✅ | `'migration'` |
| `Departments` | `UpdatedAt` | NULL | — |
| `Departments` | `UpdatedByUserId` | NULL | — |
| `Departments` | `UpdatedByUserName` | NULL | — |
| `Categories` | `CreatedAt` | ✅ | `GETDATE()` |
| `Categories` | `CreatedByUserId` | ✅ | `1` |
| `Categories` | `CreatedByUserName` | ✅ | `'migration'` |
| `Categories` | `UpdatedAt` | NULL | — |
| `Categories` | `UpdatedByUserId` | NULL | — |
| `Categories` | `UpdatedByUserName` | NULL | — |
| `CategoryQuestions` | `CreatedAt` | ✅ | `GETDATE()` |
| `CategoryQuestions` | `CreatedByUserId` | ✅ | `1` |
| `CategoryQuestions` | `CreatedByUserName` | ✅ | `'migration'` |
| `CategoryQuestions` | `UpdatedAt` | NULL | — |
| `CategoryQuestions` | `UpdatedByUserId` | NULL | — |
| `CategoryQuestions` | `UpdatedByUserName` | NULL | — |
| `Assets` | `CreatedAt` | ✅ | `GETDATE()` |
| `Assets` | `CreatedByUserId` | ✅ | `1` |
| `Assets` | `CreatedByUserName` | ✅ | `'migration'` |
| `Assets` | `UpdatedAt` | NULL | — |
| `Assets` | `UpdatedByUserId` | NULL | — |
| `Assets` | `UpdatedByUserName` | NULL | — |
| `Personnel` | `CreatedAt` | ✅ | `GETDATE()` |
| `Personnel` | `CreatedByUserId` | ✅ | `1` |
| `Personnel` | `CreatedByUserName` | ✅ | `'migration'` |
| `Personnel` | `UpdatedAt` | NULL | — |
| `Personnel` | `UpdatedByUserId` | NULL | — |
| `Personnel` | `UpdatedByUserName` | NULL | — |
| `Assignments` | `CreatedAt` | ✅ | `AssignedAt` değeri |
| `Assignments` | `CreatedByUserId` | ✅ | `1` |
| `Assignments` | `CreatedByUserName` | ✅ | `'migration'` |
| `Assignments` | `UpdatedAt` | NULL | — |
| `Assignments` | `UpdatedByUserId` | NULL | — |
| `Assignments` | `UpdatedByUserName` | NULL | — |
| `Assignments` | `ReturnedByUserId` | NULL | — |
| `Assignments` | `ReturnedByUserName` | NULL | — |

### 2.2 Eski DB'de var, Yeni DB'de YOK

Kesin bilinmiyor (eski şema verisi yok). `00_discover_old_schema.sql` çalıştırıldıktan sonra kontrol edilecek.

### 2.3 MailSettings — Yeni Kolon

| Kolon | Durum |
|---|---|
| `AdminNotificationEmail` | Yeni DB'de var (nullable), eski DB'de yok → NULL bırakılacak |

---

## 3. Veri Hacmi

Eski DB export dosyaları bağlantı hatası içerdiğinden kayıt sayıları bilinmiyor.  
Migration sonrası doğrulama sorguları `migration.sql` içinde mevcuttur.

---

## 4. Riskli Noktalar

### 🔴 Yüksek Risk

| Risk | Detay | Çözüm |
|---|---|---|
| Eski DB şeması bilinmiyor | Tüm export dosyaları hata içeriyor | `00_discover_old_schema.sql` önce çalıştırılmalı |
| IDENTITY çakışması | Eski DB'deki Id'ler yeni DB test verileriyle çakışabilir | Silme + RESEED + `SET IDENTITY_INSERT ON` |
| Companies tablosu — Id farkı | Eski Companies Id'leri ≠ yeni Companies Id'leri olabilir; Personnel FK bunlara bağlı | Companies önce, Personnel sonra aktarılmalı |
| Assets.Barcode UNIQUE constraint | Eski DB'de aynı barcode iki kez varsa insert hata verir | Önceden kontrol edilmeli |

### 🟡 Orta Risk

| Risk | Detay | Çözüm |
|---|---|---|
| MailSettings çakışması | Yeni DB'de zaten konfigüre SMTP ayarları var | MailSettings'e dokunulmayacak |
| AdminUsers şifre hash formatı | Eski DB BCrypt versiyonu farklı olabilir | Mevcut admin korunacak |
| CategoryQuestions audit alanları | Bu tablo eski DB'de audit alan taşıyıp taşımadığı belirsiz | Script dynamic SQL ile yönetiyor |

### 🟢 Düşük Risk

| Risk | Detay |
|---|---|
| AssetAnswers | Sade tablo, FK zinciri düzgün kurulursa sorun yok |
| MailLogs | Standalone, bağımlılık yok |

---

## 5. Migration Sırası

```
SİLME (child → parent):
AssignmentPhotos → AssetPhotos → AssetAnswers → MailLogs
→ Assignments → Assets → Personnel → CategoryQuestions
→ Categories → Departments
(AdminUsers, Companies, MailSettings'e dokunma)

YÜKLEME (parent → child):
Companies → Departments → Categories → CategoryQuestions
→ Assets → Personnel → AssetAnswers → Assignments → MailLogs
```

---

## 6. Migration Öncesi Yapılacaklar

1. `DemirbasTakipDB` yedeğini al (SSMS → Tasks → Back Up)
2. `DemirbasTakipDB_OLD`'un `localhost\SQLEXPRESS`'te restore edildiğini doğrula
3. `00_discover_old_schema.sql`'i çalıştır — eski şemayı gör
4. Rapordaki varsayımları gerçek şemayla karşılaştır
5. Gerekirse `migration.sql`'deki `-- [ESKI_KOLON_VAR]` satırlarını düzenle
6. `migration.sql`'i çalıştır
7. Doğrulama sorgularını incele
