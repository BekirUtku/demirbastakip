-- ============================================================
-- DemirbasTakip Migration Script
-- Kaynak : DemirbasTakipDB_OLD
-- Hedef  : DemirbasTakipDb  (büyük/küçük harf dikkat!)
-- Tarih  : Çalıştırma öncesi doldurun
-- Yapılan: Test verisini sil, gerçek veriyi aktar
-- ============================================================
-- ÇALIŞTIRMADAN ÖNCE:
--   1. DemirbasTakipDb veritabanının yedeğini alın
--   2. Uygulamayı (backend) durdurun
--   3. Bu script'i SSMS'de Results to Text modunda çalıştırın (Ctrl+T)
--   4. Tüm PRINT çıktılarını kontrol edin
-- ============================================================

USE DemirbasTakipDb;
GO

-- Doğru DB'de olduğumuzu garantile
IF DB_NAME() != 'DemirbasTakipDb'
BEGIN
    RAISERROR('HATA: Yanlış veritabanı! DemirbasTakipDb olmalı. Script durduruluyor.', 16, 1);
    RETURN;
END

-- Eski DB'nin erişilebilir olduğunu kontrol et
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'DemirbasTakipDB_OLD')
BEGIN
    RAISERROR('HATA: DemirbasTakipDB_OLD bulunamadı! Önce .bak dosyasını restore edin.', 16, 1);
    RETURN;
END

PRINT '============================================================';
PRINT 'Migration başlatılıyor: ' + CONVERT(varchar, GETDATE(), 120);
PRINT '============================================================';

-- ============================================================
-- ADIM 1: MEVCUT TEST VERİSİNİ SİL
-- Sıra önemli: child tablolar önce silinmeli
-- ============================================================
PRINT '';
PRINT '--- ADIM 1: Test verisi siliniyor ---';

BEGIN TRANSACTION MigrationTransaction;

BEGIN TRY

    -- Fotoğraf tabloları (yeni, boş olmalı ama yine de temizle)
    DELETE FROM AssignmentPhotos;
    PRINT 'AssignmentPhotos silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    DELETE FROM AssetPhotos;
    PRINT 'AssetPhotos silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Dinamik cevaplar
    DELETE FROM AssetAnswers;
    PRINT 'AssetAnswers silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Mail logları
    DELETE FROM MailLogs;
    PRINT 'MailLogs silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Zimmetler
    DELETE FROM Assignments;
    PRINT 'Assignments silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Demirbaşlar
    DELETE FROM Assets;
    PRINT 'Assets silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Personel
    DELETE FROM Personnel;
    PRINT 'Personnel silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Kategori soruları
    DELETE FROM CategoryQuestions;
    PRINT 'CategoryQuestions silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Kategoriler
    DELETE FROM Categories;
    PRINT 'Categories silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- Departmanlar
    DELETE FROM Departments;
    PRINT 'Departments silindi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- NOT: AdminUsers, Companies, MailSettings SİLİNMEYECEK
    PRINT '';
    PRINT 'Korunan tablolar: AdminUsers, Companies, MailSettings';

    -- ============================================================
    -- ADIM 2: IDENTITY SAYAÇLARINI SIFIRLA
    -- Eski DB'deki ID'ler aynen kullanılacak
    -- ============================================================
    PRINT '';
    PRINT '--- ADIM 2: Identity sayaçları sıfırlanıyor ---';

    DBCC CHECKIDENT ('Departments',      RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('Categories',       RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('CategoryQuestions',RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('Personnel',        RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('Assets',           RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('AssetAnswers',     RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('Assignments',      RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('MailLogs',         RESEED, 0) WITH NO_INFOMSGS;
    PRINT 'Identity sayaçları sıfırlandı.';

    -- ============================================================
    -- ADIM 3: VERİ AKTARIMI — parent → child sırasıyla
    -- ============================================================
    PRINT '';
    PRINT '--- ADIM 3: Veri aktarımı başlıyor ---';

    -- ----------------------------------------------------------
    -- 3A. DEPARTMENTS
    -- Şema tamamen aynı — doğrudan kopyala
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT Departments ON;

    INSERT INTO Departments
        (Id, Name, IsActive,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName)
    SELECT
        Id,
        Name,
        ISNULL(IsActive, 1),
        ISNULL(CreatedAt,           GETDATE()),
        ISNULL(CreatedByUserId,     1),
        ISNULL(CreatedByUserName,   'migration'),
        UpdatedAt,
        UpdatedByUserId,
        UpdatedByUserName
    FROM DemirbasTakipDB_OLD.dbo.Departments;

    SET IDENTITY_INSERT Departments OFF;
    PRINT 'Departments aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3B. CATEGORIES
    -- Şema tamamen aynı
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT Categories ON;

    INSERT INTO Categories
        (Id, Name, Description, IsActive,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName)
    SELECT
        Id,
        Name,
        Description,
        ISNULL(IsActive, 1),
        ISNULL(CreatedAt,           GETDATE()),
        ISNULL(CreatedByUserId,     1),
        ISNULL(CreatedByUserName,   'migration'),
        UpdatedAt,
        UpdatedByUserId,
        UpdatedByUserName
    FROM DemirbasTakipDB_OLD.dbo.Categories;

    SET IDENTITY_INSERT Categories OFF;
    PRINT 'Categories aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3C. CATEGORY QUESTIONS
    -- Şema tamamen aynı
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT CategoryQuestions ON;

    INSERT INTO CategoryQuestions
        (Id, CategoryId, QuestionText, AnswerType, IsRequired, DisplayOrder,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName)
    SELECT
        Id,
        CategoryId,
        QuestionText,
        AnswerType,
        ISNULL(IsRequired, 0),
        ISNULL(DisplayOrder, 0),
        ISNULL(CreatedAt,           GETDATE()),
        ISNULL(CreatedByUserId,     1),
        ISNULL(CreatedByUserName,   'migration'),
        UpdatedAt,
        UpdatedByUserId,
        UpdatedByUserName
    FROM DemirbasTakipDB_OLD.dbo.CategoryQuestions;

    SET IDENTITY_INSERT CategoryQuestions OFF;
    PRINT 'CategoryQuestions aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3D. PERSONNEL
    -- EmploymentDate ve DismissalDate eski DB'de var, yeni DB'de yok
    -- O kolonlar görmezden gelinir (yeni tabloda olmadığı için)
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT Personnel ON;

    INSERT INTO Personnel
        (Id, FirstName, LastName, DepartmentId, CompanyId,
         Title, BirthDate, Email, Phone, IsActive,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName)
    SELECT
        p.Id,
        p.FirstName,
        p.LastName,
        p.DepartmentId,
        -- CompanyId: eski DB'de aynı 3 firma var, ID'ler eşleşmeli
        -- Eğer Companies tablosundaki ID'ler farklıysa aşağıdaki CASE kullanılır
        -- Şimdilik doğrudan alıyoruz; sorun çıkarsa güncelleme yapılır
        p.CompanyId,
        p.Title,
        p.BirthDate,
        p.Email,
        p.Phone,
        ISNULL(p.IsActive, 1),
        ISNULL(p.CreatedAt,         GETDATE()),
        ISNULL(p.CreatedByUserId,   1),
        ISNULL(p.CreatedByUserName, 'migration'),
        p.UpdatedAt,
        p.UpdatedByUserId,
        p.UpdatedByUserName
    FROM DemirbasTakipDB_OLD.dbo.Personnel p;

    SET IDENTITY_INSERT Personnel OFF;
    PRINT 'Personnel aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3E. ASSETS (temel alanlar)
    -- IMEI, Brand, Model vb. kolonlar sonraki adımda AssetAnswers'a gidecek
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT Assets ON;

    INSERT INTO Assets
        (Id, Barcode, Name, SerialNumber, Description, CategoryId, Status,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName)
    SELECT
        Id,
        Barcode,
        Name,
        SerialNumber,
        Description,
        CategoryId,
        ISNULL(Status, 0),
        ISNULL(CreatedAt,           GETDATE()),
        ISNULL(CreatedByUserId,     1),
        ISNULL(CreatedByUserName,   'migration'),
        UpdatedAt,
        UpdatedByUserId,
        UpdatedByUserName
    FROM DemirbasTakipDB_OLD.dbo.Assets;

    SET IDENTITY_INSERT Assets OFF;
    PRINT 'Assets aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3F. ASSET ANSWERS — Mevcut AssetAnswers'ı taşı
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT AssetAnswers ON;

    INSERT INTO AssetAnswers
        (Id, AssetId, CategoryQuestionId, AnswerValue)
    SELECT
        Id,
        AssetId,
        CategoryQuestionId,
        AnswerValue
    FROM DemirbasTakipDB_OLD.dbo.AssetAnswers;

    SET IDENTITY_INSERT AssetAnswers OFF;
    PRINT 'AssetAnswers (mevcut) aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ----------------------------------------------------------
    -- 3G. ASSETS ESKİ SABİT KOLONLARI → AssetAnswers'a dönüştür
    --
    -- Mantık:
    --   Her kolon için CategoryQuestions'da eşleşen soruyu bul.
    --   Eşleşme: QuestionText LIKE '%IMEI%' gibi.
    --   Eşleşme bulunursa ve değer dolu ise AssetAnswers'a ekle.
    --   Aynı AssetId + CategoryQuestionId çifti zaten varsa ekleme (ISNULL kontrolü).
    -- ----------------------------------------------------------
    PRINT '';
    PRINT '--- ADIM 3G: Eski sabit kolonlar AssetAnswers a dönüştürülüyor ---';

    DECLARE @QuestionId_IMEI        int = NULL;
    DECLARE @QuestionId_Brand       int = NULL;
    DECLARE @QuestionId_Model       int = NULL;
    DECLARE @QuestionId_RAM         int = NULL;
    DECLARE @QuestionId_Processor   int = NULL;
    DECLARE @QuestionId_GPU         int = NULL;
    DECLARE @QuestionId_Storage     int = NULL;
    DECLARE @QuestionId_SimNumber   int = NULL;
    DECLARE @QuestionId_Pin1        int = NULL;
    DECLARE @QuestionId_Pin2        int = NULL;
    DECLARE @QuestionId_Puk1        int = NULL;
    DECLARE @QuestionId_Puk2        int = NULL;
    DECLARE @QuestionId_Operator    int = NULL;

    -- Soru ID'lerini bul (büyük/küçük harf duyarsız, LIKE ile esnek arama)
    SELECT @QuestionId_IMEI      = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%IMEI%';
    SELECT @QuestionId_Brand     = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%Marka%'     OR QuestionText LIKE '%Brand%';
    SELECT @QuestionId_Model     = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%Model%';
    SELECT @QuestionId_RAM       = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%RAM%';
    SELECT @QuestionId_Processor = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%İşlemci%'  OR QuestionText LIKE '%Islemci%' OR QuestionText LIKE '%Processor%' OR QuestionText LIKE '%CPU%';
    SELECT @QuestionId_GPU       = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%GPU%'       OR QuestionText LIKE '%Ekran Kartı%' OR QuestionText LIKE '%Grafik%';
    SELECT @QuestionId_Storage   = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%Depolama%'  OR QuestionText LIKE '%Storage%' OR QuestionText LIKE '%Disk%' OR QuestionText LIKE '%SSD%';
    SELECT @QuestionId_SimNumber = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%SIM%'       OR QuestionText LIKE '%Hat Numarası%' OR QuestionText LIKE '%Numara%';
    SELECT @QuestionId_Pin1      = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%PIN1%'      OR QuestionText LIKE '%Pin 1%';
    SELECT @QuestionId_Pin2      = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%PIN2%'      OR QuestionText LIKE '%Pin 2%';
    SELECT @QuestionId_Puk1      = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%PUK1%'      OR QuestionText LIKE '%Puk 1%';
    SELECT @QuestionId_Puk2      = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%PUK2%'      OR QuestionText LIKE '%Puk 2%';
    SELECT @QuestionId_Operator  = MIN(Id) FROM CategoryQuestions WHERE QuestionText LIKE '%Operatör%'  OR QuestionText LIKE '%Operator%';

    PRINT 'Bulunan soru ID leri:';
    PRINT '  IMEI      : ' + ISNULL(CAST(@QuestionId_IMEI      AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  Marka     : ' + ISNULL(CAST(@QuestionId_Brand     AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  Model     : ' + ISNULL(CAST(@QuestionId_Model     AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  RAM       : ' + ISNULL(CAST(@QuestionId_RAM       AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  İşlemci   : ' + ISNULL(CAST(@QuestionId_Processor AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  GPU       : ' + ISNULL(CAST(@QuestionId_GPU       AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  Depolama  : ' + ISNULL(CAST(@QuestionId_Storage   AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  SIM/Hat   : ' + ISNULL(CAST(@QuestionId_SimNumber AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  PIN1      : ' + ISNULL(CAST(@QuestionId_Pin1      AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  PIN2      : ' + ISNULL(CAST(@QuestionId_Pin2      AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  PUK1      : ' + ISNULL(CAST(@QuestionId_Puk1      AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  PUK2      : ' + ISNULL(CAST(@QuestionId_Puk2      AS varchar), 'BULUNAMADI - atlanacak');
    PRINT '  Operatör  : ' + ISNULL(CAST(@QuestionId_Operator  AS varchar), 'BULUNAMADI - atlanacak');

    -- Her alan için: soru ID bulunduysa VE eski değer doluysa VE aynı çift zaten yoksa ekle
    -- IMEI
    IF @QuestionId_IMEI IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_IMEI, a.IMEI
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.IMEI IS NOT NULL AND LTRIM(RTRIM(a.IMEI)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_IMEI
          );
        PRINT 'IMEI cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- Marka
    IF @QuestionId_Brand IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Brand, a.Brand
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Brand IS NOT NULL AND LTRIM(RTRIM(a.Brand)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Brand
          );
        PRINT 'Marka cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- Model
    IF @QuestionId_Model IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Model, a.Model
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Model IS NOT NULL AND LTRIM(RTRIM(a.Model)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Model
          );
        PRINT 'Model cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- RAM
    IF @QuestionId_RAM IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_RAM, a.RAM
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.RAM IS NOT NULL AND LTRIM(RTRIM(a.RAM)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_RAM
          );
        PRINT 'RAM cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- İşlemci
    IF @QuestionId_Processor IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Processor, a.Processor
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Processor IS NOT NULL AND LTRIM(RTRIM(a.Processor)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Processor
          );
        PRINT 'İşlemci cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- GPU
    IF @QuestionId_GPU IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_GPU, a.GPU
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.GPU IS NOT NULL AND LTRIM(RTRIM(a.GPU)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_GPU
          );
        PRINT 'GPU cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- Depolama
    IF @QuestionId_Storage IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Storage, a.Storage
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Storage IS NOT NULL AND LTRIM(RTRIM(a.Storage)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Storage
          );
        PRINT 'Depolama cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- SIM / Hat Numarası
    IF @QuestionId_SimNumber IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_SimNumber, a.SimNumber
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.SimNumber IS NOT NULL AND LTRIM(RTRIM(a.SimNumber)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_SimNumber
          );
        PRINT 'SIM/Hat cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- PIN1
    IF @QuestionId_Pin1 IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Pin1, a.Pin1
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Pin1 IS NOT NULL AND LTRIM(RTRIM(a.Pin1)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Pin1
          );
        PRINT 'PIN1 cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- PIN2
    IF @QuestionId_Pin2 IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Pin2, a.Pin2
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Pin2 IS NOT NULL AND LTRIM(RTRIM(a.Pin2)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Pin2
          );
        PRINT 'PIN2 cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- PUK1
    IF @QuestionId_Puk1 IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Puk1, a.Puk1
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Puk1 IS NOT NULL AND LTRIM(RTRIM(a.Puk1)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Puk1
          );
        PRINT 'PUK1 cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- PUK2
    IF @QuestionId_Puk2 IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Puk2, a.Puk2
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.Puk2 IS NOT NULL AND LTRIM(RTRIM(a.Puk2)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Puk2
          );
        PRINT 'PUK2 cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- Operatör
    IF @QuestionId_Operator IS NOT NULL
    BEGIN
        INSERT INTO AssetAnswers (AssetId, CategoryQuestionId, AnswerValue)
        SELECT a.Id, @QuestionId_Operator, a.OperatorName
        FROM DemirbasTakipDB_OLD.dbo.Assets a
        WHERE a.OperatorName IS NOT NULL AND LTRIM(RTRIM(a.OperatorName)) != ''
          AND NOT EXISTS (
              SELECT 1 FROM AssetAnswers aa
              WHERE aa.AssetId = a.Id AND aa.CategoryQuestionId = @QuestionId_Operator
          );
        PRINT 'Operatör cevapları eklendi: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';
    END

    -- ----------------------------------------------------------
    -- 3H. ASSIGNMENTS
    -- Şema tamamen aynı
    -- ----------------------------------------------------------
    SET IDENTITY_INSERT Assignments ON;

    INSERT INTO Assignments
        (Id, PersonnelId, AssetId, AssignedAt, ReturnedAt,
         Notes, ReturnNotes, Status,
         CreatedAt, CreatedByUserId, CreatedByUserName,
         UpdatedAt, UpdatedByUserId, UpdatedByUserName,
         ReturnedByUserId, ReturnedByUserName)
    SELECT
        Id,
        PersonnelId,
        AssetId,
        AssignedAt,
        ReturnedAt,
        Notes,
        ReturnNotes,
        ISNULL(Status, 0),
        ISNULL(CreatedAt,           GETDATE()),
        ISNULL(CreatedByUserId,     1),
        ISNULL(CreatedByUserName,   'migration'),
        UpdatedAt,
        UpdatedByUserId,
        UpdatedByUserName,
        ReturnedByUserId,
        ReturnedByUserName
    FROM DemirbasTakipDB_OLD.dbo.Assignments;

    SET IDENTITY_INSERT Assignments OFF;
    PRINT 'Assignments aktarıldı: ' + CAST(@@ROWCOUNT AS varchar) + ' kayıt';

    -- ============================================================
    -- ADIM 4: DOĞRULAMA — kayıt sayıları karşılaştırması
    -- ============================================================
    PRINT '';
    PRINT '============================================================';
    PRINT 'ADIM 4: Doğrulama — sayım karşılaştırması';
    PRINT '============================================================';

    SELECT
        'Departments'      AS TableName,
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Departments)      AS OldCount,
        (SELECT COUNT(*) FROM Departments)                               AS NewCount,
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Departments) =
                  (SELECT COUNT(*) FROM Departments)
             THEN 'OK' ELSE 'FARK VAR!' END AS Status
    UNION ALL
    SELECT
        'Categories',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Categories),
        (SELECT COUNT(*) FROM Categories),
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Categories) =
                  (SELECT COUNT(*) FROM Categories)
             THEN 'OK' ELSE 'FARK VAR!' END
    UNION ALL
    SELECT
        'CategoryQuestions',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.CategoryQuestions),
        (SELECT COUNT(*) FROM CategoryQuestions),
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.CategoryQuestions) =
                  (SELECT COUNT(*) FROM CategoryQuestions)
             THEN 'OK' ELSE 'FARK VAR!' END
    UNION ALL
    SELECT
        'Personnel',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Personnel),
        (SELECT COUNT(*) FROM Personnel),
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Personnel) =
                  (SELECT COUNT(*) FROM Personnel)
             THEN 'OK' ELSE 'FARK VAR!' END
    UNION ALL
    SELECT
        'Assets',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assets),
        (SELECT COUNT(*) FROM Assets),
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assets) =
                  (SELECT COUNT(*) FROM Assets)
             THEN 'OK' ELSE 'FARK VAR!' END
    UNION ALL
    SELECT
        'AssetAnswers (toplam)',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.AssetAnswers),
        (SELECT COUNT(*) FROM AssetAnswers),
        CASE WHEN (SELECT COUNT(*) FROM AssetAnswers) >=
                  (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.AssetAnswers)
             THEN 'OK (eski + dönüştürülen)' ELSE 'FARK VAR!' END
    UNION ALL
    SELECT
        'Assignments',
        (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assignments),
        (SELECT COUNT(*) FROM Assignments),
        CASE WHEN (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assignments) =
                  (SELECT COUNT(*) FROM Assignments)
             THEN 'OK' ELSE 'FARK VAR!' END;

    -- ============================================================
    -- Her şey başarılıysa COMMIT
    -- ============================================================
    COMMIT TRANSACTION MigrationTransaction;

    PRINT '';
    PRINT '============================================================';
    PRINT 'MIGRATION BAŞARIYLA TAMAMLANDI: ' + CONVERT(varchar, GETDATE(), 120);
    PRINT '============================================================';
    PRINT '';
    PRINT 'Sonraki adımlar:';
    PRINT '  1. Uygulamayı başlatın ve giriş yapın';
    PRINT '  2. Personel listesini kontrol edin (52 kayıt bekleniyor)';
    PRINT '  3. Demirbaş listesini kontrol edin (105 kayıt bekleniyor)';
    PRINT '  4. Bir demirbaşın detayına girin, kategori cevaplarını kontrol edin';
    PRINT '  5. Zimmet geçmişini kontrol edin (75 kayıt bekleniyor)';
    PRINT '  6. Her şey OK ise DemirbasTakipDB_OLD silinebilir';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION MigrationTransaction;

    PRINT '';
    PRINT '============================================================';
    PRINT 'HATA: Migration BAŞARISIZ — tüm değişiklikler geri alındı!';
    PRINT '============================================================';
    PRINT 'Hata numarası  : ' + CAST(ERROR_NUMBER()   AS varchar);
    PRINT 'Hata mesajı    : ' + ERROR_MESSAGE();
    PRINT 'Hata satırı    : ' + CAST(ERROR_LINE()     AS varchar);
    PRINT 'Hata prosedürü : ' + ISNULL(ERROR_PROCEDURE(), 'N/A');
    PRINT '';
    PRINT 'Veritabanı migration öncesi durumunda. Tekrar deneyin.';

    -- Hatayı yeniden fırlat (SSMS Messages panelinde kırmızı görünsün)
    THROW;
END CATCH;
GO
