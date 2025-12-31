
-- PROFESYONEL DEPOLAMA (STORAGE) YAPILANDIRMASI
-- Bu script 'media' bucket'ını oluşturur ve gerekli erişim izinlerini ayarlar.

-- 1. 'media' bucket'ını oluştur (Eğer yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Mevcut politikaları temizle (Hata almamak için)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update" ON storage.objects;

-- 3. Yepyeni ve güvenli politikaları tanımla
-- Resimleri herkesin görebilmesi için (SELECT)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );

-- Resim yüklemek için (INSERT)
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'media' );

-- Resim silmek için (DELETE)
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'media' );

-- Resim güncellemek için (UPDATE)
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'media' );
