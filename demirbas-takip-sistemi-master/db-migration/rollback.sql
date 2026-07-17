-- ============================================================
-- ROLLBACK SCRIPT
-- Migration başarısız olursa veya sonuç beğenilmezse çalıştırın
-- ============================================================
-- BU SCRIPT:
--   DemirbasTakipDb'deki TÜM VERİYİ SİLER
--   ve .bak dosyasından geri yükler
--
-- ÇALIŞTIRMADAN ÖNCE:
--   Backup dosyanızın yolunu aşağıda güncelleyin
-- ============================================================

USE master;
GO

DECLARE @BackupFile nvarchar(500) = N'C:\Backups\pre-migration.bak';
-- ↑ Migration öncesi aldığınız backup dosyasının tam yolu

-- Dosyanın var olduğunu kontrol et
IF NOT EXISTS (
    SELECT 1 FROM sys.master_files
    WHERE physical_name = @BackupFile
)
BEGIN
    -- Alternatif kontrol: xp_fileexist
    DECLARE @exists int;
    EXEC xp_fileexist @BackupFile, @exists OUTPUT;
    IF @exists = 0
    BEGIN
        RAISERROR('HATA: Backup dosyası bulunamadı! Yolu kontrol edin: %s', 16, 1, @BackupFile);
        RETURN;
    END
END

PRINT 'Rollback başlatılıyor...';
PRINT 'Backup: ' + @BackupFile;

-- Tüm bağlantıları kes
ALTER DATABASE [DemirbasTakipDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

-- Geri yükle
RESTORE DATABASE [DemirbasTakipDb]
FROM DISK = @BackupFile
WITH REPLACE, RECOVERY, STATS = 10;

-- Çok kullanıcılı moda geri al
ALTER DATABASE [DemirbasTakipDb] SET MULTI_USER;

PRINT 'Rollback tamamlandı. Veritabanı migration öncesi haline döndü.';
GO
