-- ============================================================
-- DOĞRULAMA SORGULARI
-- Migration tamamlandıktan sonra çalıştırın
-- Her sorgunun beklenen çıktısı yanında belirtilmiştir
-- ============================================================

USE DemirbasTakipDb;
GO

-- ─────────────────────────────────────────────
-- 1. Kayıt sayıları (eski DB ile karşılaştır)
-- ─────────────────────────────────────────────
PRINT '=== 1. Kayıt Sayıları ===';

SELECT TableName, OldCount, NewCount,
       CASE WHEN OldCount = NewCount THEN '✓ OK'
            WHEN NewCount > OldCount THEN '✓ OK (ek kayıt var)'
            ELSE '✗ FARK VAR!' END AS Durum
FROM (
    SELECT 'Departments'       AS TableName, (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Departments)       AS OldCount, (SELECT COUNT(*) FROM Departments)       AS NewCount UNION ALL
    SELECT 'Categories',                     (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Categories),                   (SELECT COUNT(*) FROM Categories)           UNION ALL
    SELECT 'CategoryQuestions',              (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.CategoryQuestions),            (SELECT COUNT(*) FROM CategoryQuestions)    UNION ALL
    SELECT 'Personnel',                      (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Personnel),                    (SELECT COUNT(*) FROM Personnel)            UNION ALL
    SELECT 'Assets',                         (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assets),                       (SELECT COUNT(*) FROM Assets)               UNION ALL
    SELECT 'AssetAnswers (min)',             (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.AssetAnswers),                 (SELECT COUNT(*) FROM AssetAnswers)         UNION ALL
    SELECT 'Assignments',                    (SELECT COUNT(*) FROM DemirbasTakipDB_OLD.dbo.Assignments),                  (SELECT COUNT(*) FROM Assignments)
) t;

-- Beklenen çıktı (eski DB'ye göre):
--   Departments       19   19   ✓ OK
--   Categories         7    7   ✓ OK
--   CategoryQuestions 39   39   ✓ OK
--   Personnel         52   52   ✓ OK
--   Assets           105  105   ✓ OK
--   AssetAnswers     741  741+  ✓ OK (eski + dönüştürülen sabit kolonlar)
--   Assignments       75   75   ✓ OK


-- ─────────────────────────────────────────────
-- 2. Örnek veri spot check — ilk 5 personel
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 2. Personel Spot Check ===';

SELECT TOP 5
    p.Id,
    p.FirstName + ' ' + p.LastName AS AdSoyad,
    d.Name AS Departman,
    c.Name AS Firma,
    p.Email,
    p.BirthDate,
    p.IsActive
FROM Personnel p
LEFT JOIN Departments d ON p.DepartmentId = d.Id
LEFT JOIN Companies c ON p.CompanyId = c.Id
ORDER BY p.Id;

-- Beklenen: Gerçek personel isimleri, test verisi olmamalı


-- ─────────────────────────────────────────────
-- 3. Örnek demirbaş ve cevapları
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 3. Demirbaş + Dinamik Cevaplar Spot Check ===';

SELECT TOP 10
    a.Id,
    a.Barcode,
    a.Name,
    cat.Name AS Kategori,
    a.Status,
    cq.QuestionText AS Soru,
    aa.AnswerValue AS Cevap
FROM Assets a
LEFT JOIN Categories cat ON a.CategoryId = cat.Id
LEFT JOIN AssetAnswers aa ON aa.AssetId = a.Id
LEFT JOIN CategoryQuestions cq ON cq.Id = aa.CategoryQuestionId
ORDER BY a.Id, cq.DisplayOrder;

-- Beklenen: IMEI, Marka, Model vb. değerler AssetAnswers'da görünmeli


-- ─────────────────────────────────────────────
-- 4. Aktif zimmetler tutarlı mı?
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 4. Zimmet Tutarlılık Kontrolü ===';

-- Aktif zimmet var ama demirbaş Status=Zimmetli(1) değil
SELECT
    'Zimmet var, Asset.Status yanlış' AS Sorun,
    COUNT(*) AS Adet
FROM Assignments asg
JOIN Assets a ON a.Id = asg.AssetId
WHERE asg.Status = 0 -- Aktif
  AND a.Status != 1  -- Zimmetli değil

UNION ALL

-- Demirbaş Zimmetli ama aktif zimmet kaydı yok
SELECT
    'Asset.Status=Zimmetli ama aktif zimmet yok',
    COUNT(*)
FROM Assets a
WHERE a.Status = 1 -- Zimmetli
  AND NOT EXISTS (
      SELECT 1 FROM Assignments asg
      WHERE asg.AssetId = a.Id AND asg.Status = 0 -- Aktif
  );

-- Beklenen: Her iki satır da 0 olmalı


-- ─────────────────────────────────────────────
-- 5. FK tutarlılığı — orphan kayıt var mı?
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 5. Foreign Key Tutarlılık ===';

SELECT 'Personnel.DepartmentId orphan'  AS Kontrol, COUNT(*) AS Adet FROM Personnel WHERE DepartmentId NOT IN (SELECT Id FROM Departments)
UNION ALL
SELECT 'Personnel.CompanyId orphan',                COUNT(*) FROM Personnel WHERE CompanyId NOT IN (SELECT Id FROM Companies)
UNION ALL
SELECT 'Assets.CategoryId orphan',                  COUNT(*) FROM Assets WHERE CategoryId NOT IN (SELECT Id FROM Categories)
UNION ALL
SELECT 'AssetAnswers.AssetId orphan',               COUNT(*) FROM AssetAnswers WHERE AssetId NOT IN (SELECT Id FROM Assets)
UNION ALL
SELECT 'AssetAnswers.QuestionId orphan',            COUNT(*) FROM AssetAnswers WHERE CategoryQuestionId NOT IN (SELECT Id FROM CategoryQuestions)
UNION ALL
SELECT 'Assignments.PersonnelId orphan',            COUNT(*) FROM Assignments WHERE PersonnelId NOT IN (SELECT Id FROM Personnel)
UNION ALL
SELECT 'Assignments.AssetId orphan',                COUNT(*) FROM Assignments WHERE AssetId NOT IN (SELECT Id FROM Assets);

-- Beklenen: Tüm adetler 0 olmalı


-- ─────────────────────────────────────────────
-- 6. AssetAnswers dönüşüm özeti
-- IMEI, Marka vb. kaç demirbaş için aktarıldı?
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 6. AssetAnswers Dönüşüm Özeti ===';

SELECT
    cq.QuestionText AS Soru,
    COUNT(aa.Id) AS AktarilanCevapSayisi
FROM AssetAnswers aa
JOIN CategoryQuestions cq ON cq.Id = aa.CategoryQuestionId
GROUP BY cq.QuestionText
ORDER BY AktarilanCevapSayisi DESC;

-- ─────────────────────────────────────────────
-- 7. Şüpheli veri temizlendi mi?
-- (Test verisinin kalıp kalmadığını kontrol)
-- ─────────────────────────────────────────────
PRINT '';
PRINT '=== 7. Test Verisi Kalıntısı Kontrolü ===';

SELECT 'Test personeli var mı?' AS Kontrol,
       COUNT(*) AS Adet
FROM Personnel
WHERE FirstName LIKE '%test%' OR LastName LIKE '%test%'
   OR FirstName LIKE '%Test%' OR Email LIKE '%test%'

UNION ALL

SELECT 'Test demirbaşı var mı?',
       COUNT(*)
FROM Assets
WHERE Name LIKE '%test%' OR Name LIKE '%Test%' OR Name LIKE '%demo%'

UNION ALL

SELECT 'Test zimmet var mı?',
       COUNT(*)
FROM Assignments
WHERE Notes LIKE '%test%';

-- Beklenen: Tümü 0 olmalı (gerçek veriden geldiyse)
GO
