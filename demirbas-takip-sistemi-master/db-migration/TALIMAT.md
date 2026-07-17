# Migration Çalıştırma Talimatı

## Ön Bilgi

| Kaynak DB  | `DemirbasTakipDB_OLD` — eski gerçek veriler |
|---|---|
| Hedef DB   | `DemirbasTakipDb` — yeni versiyon (test verili) |
| Taşınacak  | 52 personel, 105 demirbaş, 741+ cevap, 75 zimmet |
| Korunanlar | AdminUsers, Companies, MailSettings |

## Adım 1 — Backup Al (ZORUNLU)

SSMS'de `master` veritabanına bağlıyken:

```sql
BACKUP DATABASE [DemirbasTakipDb]
TO DISK = N'C:\Backups\pre-migration.bak'
WITH INIT, STATS = 10;
```

`C:\Backups\` klasörü yoksa önce oluştur:
```powershell
New-Item -ItemType Directory -Force -Path "C:\Backups"
```

Backup tamamlanınca `.bak` dosyasının oluştuğunu kontrol et.

---

## Adım 2 — Uygulamayı Durdur

Backend (dotnet run çalışıyorsa terminalde `Ctrl+C`) durdur.
Frontend de durabilir veya açık kalabilir (DB'ye bağlanmayacak).

---

## Adım 3 — SSMS Ayarları

SSMS'de:
1. `Ctrl+T` → **Results to Text** modu (çıktılar daha okunabilir)
2. `DemirbasTakipDb` veritabanına bağlan

---

## Adım 4 — Test DB'sinde Dene (Tavsiye)

Doğrudan production'a uygulamadan önce bir kopya üzerinde test et:

```sql
-- DemirbasTakipDb'nin test kopyasını oluştur
RESTORE DATABASE [DemirbasTakipDb_TEST]
FROM DISK = N'C:\Backups\pre-migration.bak'
WITH 
    MOVE 'DemirbasTakipDb'     TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\DemirbasTakipDb_TEST.mdf',
    MOVE 'DemirbasTakipDb_log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\DemirbasTakipDb_TEST_log.ldf',
    REPLACE, RECOVERY;
```

`migration.sql` dosyasının başındaki şu satırı geçici olarak değiştir:
```sql
-- ORJINAL:
USE DemirbasTakipDb;
-- TEST İÇİN:
USE DemirbasTakipDb_TEST;
```

SSMS'de `migration.sql`'i aç ve `F5` ile çalıştır.

**Tüm PRINT çıktıları OK geliyorsa** → asıl migration'a geç.
**Hata varsa** → bu dokümandaki "Sorun Giderme" bölümüne bak.

Test DB'yi temizle:
```sql
USE master;
DROP DATABASE [DemirbasTakipDb_TEST];
```

---

## Adım 5 — Asıl Migration'ı Çalıştır

1. `migration.sql` başındaki `USE` satırının `DemirbasTakipDb` olduğundan emin ol
2. SSMS'de `migration.sql`'i aç
3. `F5` ile çalıştır
4. Messages panelini izle

**Başarılı çıktı şöyle görünmeli:**
```
Migration başlatılıyor: 2026-06-03 22:00:00
--- ADIM 1: Test verisi siliniyor ---
AssignmentPhotos silindi: 0 kayıt
AssetPhotos silindi: 0 kayıt
...
--- ADIM 2: Identity sayaçları sıfırlandı ---
--- ADIM 3: Veri aktarımı başlıyor ---
Departments aktarıldı: 19 kayıt
Categories aktarıldı: 7 kayıt
CategoryQuestions aktarıldı: 39 kayıt
Personnel aktarıldı: 52 kayıt
Assets aktarıldı: 105 kayıt
AssetAnswers (mevcut) aktarıldı: 741 kayıt
Bulunan soru ID leri:
  IMEI      : 3
  Marka     : 1
  ...
IMEI cevapları eklendi: XX kayıt
...
Assignments aktarıldı: 75 kayıt
TableName              OldCount  NewCount  Status
Departments            19        19        OK
...
============================================================
MIGRATION BAŞARIYLA TAMAMLANDI: 2026-06-03 22:01:30
============================================================
```

---

## Adım 6 — Doğrulama Sorgularını Çalıştır

SSMS'de `dogrulama.sql`'i aç ve `F5` ile çalıştır.

**Dikkat edilecekler:**
- Tüm kayıt sayıları eşleşmeli
- FK tutarlılık kontrolünde tüm adetler 0 olmalı
- Zimmet tutarlılık kontrolünde tüm adetler 0 olmalı
- Test verisi kalıntısı kontrolünde tüm adetler 0 olmalı

---

## Adım 7 — Uygulamayı Başlat

Backend'i başlat:
```powershell
cd "C:\Users\VICTUSS\Desktop\Proje - Kopya\DemirbasTakipSistemi\backend\DemirbasTakip.Api"
dotnet run
```

Frontend:
```powershell
cd "C:\Users\VICTUSS\Desktop\Proje - Kopya\DemirbasTakipSistemi\frontend\demirbas-takip-ui"
npm run dev
```

Tarayıcıda kontrol:
- [ ] Giriş yapılabiliyor mu?
- [ ] Personel listesinde 52 gerçek kayıt var mı?
- [ ] Demirbaş listesinde 105 kayıt var mı?
- [ ] Bir demirbaşın detayında IMEI/Marka/Model görünüyor mu?
- [ ] Zimmet geçmişi 75 kayıt içeriyor mu?
- [ ] Aktif zimmetlerin durumu "Zimmetli" mi?

---

## Adım 8 — Temizlik (Her Şey OK İse)

```sql
-- Eski DB'yi sil (backup'ı saklamaya devam et)
USE master;
ALTER DATABASE [DemirbasTakipDB_OLD] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [DemirbasTakipDB_OLD];
```

`.bak` dosyasını güvenli bir yerde sakla. En az 1 ay beklet.

---

## Sorun Giderme

### "HATA: Migration BAŞARISIZ — tüm değişiklikler geri alındı!"
Transaction rollback oldu, DB migration öncesi durumda. Hata mesajını oku ve bu dokümandaki ilgili bölüme bak.

### "CompanyId FK hatası" (Personnel insert sırasında)
Eski DB'deki Companies ID'leri ile yeni DB'deki ID'ler farklı olabilir.

```sql
-- Karşılaştır
SELECT 'OLD' AS DB, Id, Name FROM DemirbasTakipDB_OLD.dbo.Companies
UNION ALL
SELECT 'NEW', Id, Name FROM DemirbasTakipDb.dbo.Companies
ORDER BY Name;
```

ID'ler farklıysa `migration.sql`'deki Personnel insert bölümünü bul ve CompanyId'yi şöyle map'le:

```sql
-- CompanyId yerine şunu koy:
(SELECT Id FROM Companies WHERE Name = 
    (SELECT Name FROM DemirbasTakipDB_OLD.dbo.Companies 
     WHERE Id = p.CompanyId)),
```

### Soru ID'leri "BULUNAMADI" çıkıyorsa
CategoryQuestions tablosundaki gerçek soru metinlerini gör:

```sql
SELECT Id, CategoryId, QuestionText FROM CategoryQuestions ORDER BY CategoryId, Id;
```

`migration.sql`'deki LIKE sorgularını gerçek soru metinlerine göre güncelle.

### "IDENTITY_INSERT zaten açık" hatası
Bir önceki çalıştırmada hata oldu ve transaction temiz kapanmadı. SSMS'yi kapat, yeniden aç, tekrar dene.

---

## Rollback (Geri Alma)

Herhangi bir sorun varsa:

1. Uygulamayı durdur
2. `rollback.sql`'i aç
3. `@BackupFile` değişkenini güncelle
4. `F5` ile çalıştır
5. Uygulamayı tekrar başlat

Rollback 1-2 dakika sürer. Verilen son `pre-migration.bak` yedeğine döner.
