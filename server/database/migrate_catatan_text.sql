-- Migrasi: Ubah kolom catatan ke LONGTEXT agar muat JSON payload + logo base64
ALTER TABLE `pcl_team_registrations` MODIFY COLUMN `catatan` LONGTEXT NULL;

