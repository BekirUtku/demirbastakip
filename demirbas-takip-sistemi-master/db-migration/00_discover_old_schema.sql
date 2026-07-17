-- =============================================================
-- 00_discover_old_schema.sql
-- Eski DB'nin gerçek şemasını keşfeder.
-- migration.sql'i çalıştırmadan ÖNCE bu scripti çalıştır.
-- Hedef: DemirbasTakipDB_OLD
-- =============================================================

USE DemirbasTakipDB_OLD;
GO

PRINT '=== TABLO LİSTESİ ===';
SELECT
    t.TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c
     WHERE c.TABLE_NAME = t.TABLE_NAME AND c.TABLE_SCHEMA = 'dbo') AS KolonSayisi
FROM INFORMATION_SCHEMA.TABLES t
WHERE t.TABLE_SCHEMA = 'dbo' AND t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME;

PRINT '';
PRINT '=== TÜM KOLONLAR (tablo + kolon + tip + nullable) ===';
SELECT
    c.TABLE_NAME         AS Tablo,
    c.COLUMN_NAME        AS Kolon,
    c.DATA_TYPE          AS Tip,
    CASE WHEN c.CHARACTER_MAXIMUM_LENGTH IS NOT NULL
         THEN c.DATA_TYPE + '(' + CAST(c.CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
         ELSE c.DATA_TYPE END AS TipDetay,
    c.IS_NULLABLE        AS Nullable,
    c.COLUMN_DEFAULT     AS Default_Deger,
    c.ORDINAL_POSITION   AS Sira
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo'
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;

PRINT '';
PRINT '=== FOREIGN KEY LİSTESİ ===';
SELECT
    fk.name              AS FK_Adi,
    tp.name              AS Parent_Tablo,
    cp.name              AS Parent_Kolon,
    tr.name              AS Ref_Tablo,
    cr.name              AS Ref_Kolon
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
JOIN sys.tables tp               ON fkc.parent_object_id = tp.object_id
JOIN sys.columns cp              ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
JOIN sys.tables tr               ON fkc.referenced_object_id = tr.object_id
JOIN sys.columns cr              ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
ORDER BY tp.name;

PRINT '';
PRINT '=== KAYIT SAYILARI ===';
SELECT
    t.name AS Tablo,
    p.rows AS KayitSayisi
FROM sys.tables t
JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1) AND t.schema_id = SCHEMA_ID('dbo')
ORDER BY p.rows DESC;

PRINT '';
PRINT '=== KRİTİK KOLON VARLIK KONTROLLERI (migration için) ===';
SELECT
    'Companies'      AS Tablo, 'Name'             AS Kolon, CASE WHEN COL_LENGTH('dbo.Companies', 'Name')             IS NOT NULL THEN 'VAR' ELSE 'YOK' END AS Durum
UNION ALL SELECT 'Companies',      'CompanyName',       CASE WHEN COL_LENGTH('dbo.Companies', 'CompanyName')       IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Departments',    'CreatedAt',         CASE WHEN COL_LENGTH('dbo.Departments', 'CreatedAt')       IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Departments',    'CreatedByUserId',   CASE WHEN COL_LENGTH('dbo.Departments', 'CreatedByUserId') IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Categories',     'CreatedAt',         CASE WHEN COL_LENGTH('dbo.Categories', 'CreatedAt')        IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Categories',     'CreatedByUserId',   CASE WHEN COL_LENGTH('dbo.Categories', 'CreatedByUserId')  IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'CategoryQuestions', 'CreatedAt',      CASE WHEN COL_LENGTH('dbo.CategoryQuestions', 'CreatedAt') IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assets',         'CreatedAt',         CASE WHEN COL_LENGTH('dbo.Assets', 'CreatedAt')            IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assets',         'CreatedByUserId',   CASE WHEN COL_LENGTH('dbo.Assets', 'CreatedByUserId')      IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assets',         'Barcode',           CASE WHEN COL_LENGTH('dbo.Assets', 'Barcode')              IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Personnel',      'CreatedAt',         CASE WHEN COL_LENGTH('dbo.Personnel', 'CreatedAt')         IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Personnel',      'CreatedByUserId',   CASE WHEN COL_LENGTH('dbo.Personnel', 'CreatedByUserId')   IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Personnel',      'DismissalDate',     CASE WHEN COL_LENGTH('dbo.Personnel', 'DismissalDate')     IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assignments',    'CreatedAt',         CASE WHEN COL_LENGTH('dbo.Assignments', 'CreatedAt')       IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assignments',    'ReturnedByUserId',  CASE WHEN COL_LENGTH('dbo.Assignments', 'ReturnedByUserId')IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'Assignments',    'ReturnNotes',       CASE WHEN COL_LENGTH('dbo.Assignments', 'ReturnNotes')     IS NOT NULL THEN 'VAR' ELSE 'YOK' END
UNION ALL SELECT 'MailSettings',   'AdminNotificationEmail', CASE WHEN COL_LENGTH('dbo.MailSettings', 'AdminNotificationEmail') IS NOT NULL THEN 'VAR' ELSE 'YOK' END
ORDER BY Tablo, Kolon;

PRINT '';
PRINT '=== ÖRNEK VERİLER ===';

PRINT '-- Companies (ilk 5):';
SELECT TOP 5 * FROM Companies;

PRINT '-- Departments (ilk 5):';
SELECT TOP 5 * FROM Departments;

PRINT '-- Categories (ilk 5):';
SELECT TOP 5 * FROM Categories;

PRINT '-- Assets (ilk 5):';
SELECT TOP 5 * FROM Assets;

PRINT '-- Personnel (ilk 5):';
SELECT TOP 5 * FROM Personnel;

PRINT '-- Assignments (ilk 5):';
SELECT TOP 5 * FROM Assignments;

PRINT '-- AdminUsers (tümü — şifre hash dahil):';
SELECT Id, Username, FullName, Email, IsActive, CreatedAt FROM AdminUsers;

PRINT '';
PRINT '=== DUPLICATE BARCODE KONTROLÜ ===';
SELECT Barcode, COUNT(*) AS Adet
FROM Assets
GROUP BY Barcode
HAVING COUNT(*) > 1;
-- Bu sorgu sonuç döndürürse migration.sql çalışmadan önce düzeltilmeli!

PRINT '';
PRINT '=== KEŞIF TAMAMLANDI ===';
PRINT 'Sonuçları incele ve ANALIZ_RAPORU.md ile karşılaştır.';
