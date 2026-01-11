-- Demo seed: 5 Türkçe örnek haber (tüm bloklar dahil).
-- Yayıncı alanı kullanılmaz; kategori navigation_items üzerinden seçilir.
-- Slug üzerinden ON CONFLICT ile tekrar çalıştırılabilir.

WITH cat_list AS (
  SELECT array_agg(label ORDER BY order_index, created_at) AS labels
  FROM public.navigation_items
  WHERE is_active = true AND type <> 'header'
),
seed_items AS (
  SELECT $json$[
    {
      "id": "seed-item-text",
      "type": "text",
      "title": "Haberin arka planı",
      "description": "<p>Bu örnek haber, tüm içerik bloklarını tek akışta gösterir.</p><p>Metin bloğu zengin HTML destekler.</p>",
      "source": "Buzz Haber Editörü",
      "orderNumber": 1
    },
    {
      "id": "seed-item-image",
      "type": "image",
      "title": "Saha toplantısından kare",
      "description": "<p>Bu görsel ana sayfada vitrine alınabilir.</p>",
      "mediaUrl": "/api/storage/file/image/2026-01-06/iste-bakan-fidan-konusurken-mkyk-uyelerinin_18816901_5135_xl.webp",
      "altText": "Toplantı fotoğrafı",
      "showOnHomepage": true,
      "orderNumber": 2
    },
    {
      "id": "seed-item-slider",
      "type": "slider",
      "title": "Proje galerisi",
      "description": "<p>Galeri bloğu birden çok görsel gösterir.</p>",
      "mediaUrls": [
        "/api/storage/file/image/2025-12-31/76148374-cgabebcyxvo6j7s2d0lwdq_xl.webp",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1000",
        "/api/storage/file/image/2026-01-06/nigdenewslogo_xl.webp"
      ],
      "altTexts": [
        "Proje genel görünüm",
        "Kurulum detayı",
        "Saha çalışması"
      ],
      "orderNumber": 3
    },
    {
      "id": "seed-item-video",
      "type": "video",
      "title": "Kısa tanıtım videosu",
      "description": "<p>Video bloğu MP4 veya YouTube bağlantısı destekler.</p>",
      "mediaUrl": "/api/storage/file/video/2026-01-06/sample-1.mp4",
      "orderNumber": 4
    },
    {
      "id": "seed-item-audio",
      "type": "audio",
      "title": "Podcast: Proje sohbeti",
      "description": "<p>Sesli içeriklerle farklı bir deneyim sunun.</p>",
      "mediaUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "orderNumber": 5
    },
    {
      "id": "seed-item-file",
      "type": "file",
      "title": "Proje raporu (PDF)",
      "description": "<p>Detaylı raporu indirebilirsiniz.</p>",
      "mediaUrl": "/api/storage/file/file/2026-01-06/sample1.pdf",
      "source": "Belediye Raporu",
      "orderNumber": 6
    },
    {
      "id": "seed-item-flip",
      "type": "flipcard",
      "title": "Bilgi kartı",
      "description": "",
      "orderNumber": 7,
      "flipData": {
        "frontImage": "/api/storage/file/image/2026-01-06/nigdenewslogo_xl.webp",
        "backImage": "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&q=80&w=1000",
        "frontTitle": "Projenin amacı",
        "backTitle": "Beklenen etki",
        "frontDescription": "<p>Şehir enerji ihtiyacını yenilenebilir kaynaktan karşılamak.</p>",
        "backDescription": "<p>Karbon ayak izini azaltmak ve verimlilik sağlamak.</p>",
        "frontLink": "https://www.nigde.bel.tr",
        "backLink": "https://www.nigde.bel.tr"
      }
    },
    {
      "id": "seed-item-beforeafter",
      "type": "beforeafter",
      "title": "Önce / sonra karşılaştırma",
      "description": "",
      "orderNumber": 8,
      "beforeAfterData": {
        "beforeImage": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000&sat=-100&bri=-10&con=20",
        "afterImage": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000",
        "beforeLabel": "ÖNCE",
        "afterLabel": "SONRA"
      }
    },
    {
      "id": "seed-item-review",
      "type": "review",
      "title": "Ürün incelemesi: Taşınabilir güneş paneli",
      "description": "",
      "orderNumber": 9,
      "reviewData": {
        "productName": "SolarGo 220W",
        "productImage": "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&q=80&w=1000",
        "score": 88,
        "pros": [
          "Kurulum kolaylığı",
          "Taşınabilir ve hafif",
          "Sağlam gövde"
        ],
        "cons": [
          "Bulutlu havada verim düşüyor",
          "Kablo kısa"
        ],
        "breakdown": [
          { "label": "Tasarım", "score": 85 },
          { "label": "Performans", "score": 90 },
          { "label": "Dayanıklılık", "score": 88 },
          { "label": "Fiyat / performans", "score": 80 }
        ],
        "verdict": "<p>Genel performans güçlü, sahada kısa süreli kullanım için uygun.</p>"
      }
    },
    {
      "id": "seed-item-poll",
      "type": "poll",
      "title": "Bu projede en önemli öncelik ne?",
      "description": "<p>Oylamaya katıl ve fikrini paylaş.</p>",
      "orderNumber": 10,
      "options": [
        { "id": "seed-poll-opt-1", "text": "Enerji verimliliği", "votes": 420, "image": "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&q=80&w=600" },
        { "id": "seed-poll-opt-2", "text": "Maliyet", "votes": 280, "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600" },
        { "id": "seed-poll-opt-3", "text": "Sürdürülebilirlik", "votes": 610, "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=600" }
      ],
      "isImagePoll": true,
      "pollColumns": 3
    },
    {
      "id": "seed-item-vs",
      "type": "vs",
      "title": "Şehir içi ulaşım tercihi",
      "description": "<p>Hangi taraf sana daha yakın?</p>",
      "mediaUrl": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000",
      "orderNumber": 11,
      "options": [
        { "id": "seed-vs-left", "text": "Toplu taşıma", "votes": 320, "image": "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&q=80&w=800" },
        { "id": "seed-vs-right", "text": "Bisiklet", "votes": 280, "image": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800" }
      ],
      "isImagePoll": true,
      "pollColumns": 2
    },
    {
      "id": "seed-item-quote",
      "type": "quote",
      "title": "Prof. Dr. Hasan Uslu",
      "description": "<p>Yerel projeler sahadaki doğru iletişimle başarı kazanır.</p>",
      "source": "https://www.instagram.com/p/DTQc-yRDTVP/",
      "orderNumber": 12
    },
    {
      "id": "seed-item-social-twitter",
      "type": "social",
      "title": "X (Twitter) paylaşımı",
      "description": "<p>Sosyal medya gündeminden örnek.</p>",
      "mediaUrl": "https://twitter.com/Serdarosloo/status/2009910270693384265",
      "orderNumber": 13
    },
    {
      "id": "seed-item-social-instagram",
      "type": "social",
      "title": "Instagram gönderisi",
      "description": "<p>Günün popüler paylaşımı.</p>",
      "mediaUrl": "https://www.instagram.com/p/DTQc-yRDTVP/",
      "orderNumber": 14
    },
    {
      "id": "seed-item-social-pinterest",
      "type": "social",
      "title": "Pinterest pini",
      "description": "<p>İlham panosundan örnek.</p>",
      "mediaUrl": "https://tr.pinterest.com/pin/768708230190507550/",
      "orderNumber": 15
    },
    {
      "id": "seed-item-iframe-facebook",
      "type": "iframe",
      "title": "Facebook gönderisi",
      "description": "<iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fdmchaber%2Fposts%2Fpfbid0NwZMESP32QsNwXrRPvMrNr8GzHawYyMR8JLDB6FM7kLNrhkFRx67WEoudt3bJRK5l&show_text=true&width=500' width='500' height='392' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowfullscreen='true' allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'></iframe>",
      "mediaUrl": "https://www.facebook.com/dmchaber/posts/pfbid0NwZMESP32QsNwXrRPvMrNr8GzHawYyMR8JLDB6FM7kLNrhkFRx67WEoudt3bJRK5l",
      "orderNumber": 16
    },
    {
      "id": "seed-item-quiz",
      "type": "quiz",
      "title": "Hangi haber okuyucususun?",
      "description": "<p>Kısa test ile okur profilini bul.</p>",
      "orderNumber": 17,
      "quizData": {
        "quizType": "personality",
        "results": [
          {
            "id": "seed-quiz-res-1",
            "title": "Analitik okur",
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
            "description": "Detay ve verilere odaklanırsın."
          },
          {
            "id": "seed-quiz-res-2",
            "title": "Hızlı tüketici",
            "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
            "description": "Özet ve başlıklara bakarsın."
          }
        ],
        "questions": [
          {
            "id": "seed-quiz-q-1",
            "title": "Haberde ilk neye bakarsın?",
            "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
            "description": "Kendine uygun seçeneği işaretle.",
            "showOnCover": true,
            "layout": "list",
            "answers": [
              { "id": "seed-quiz-q1-a1", "text": "Detaylı analiz ve tablo", "resultId": "seed-quiz-res-1" },
              { "id": "seed-quiz-q1-a2", "text": "Kısa özet ve başlık", "resultId": "seed-quiz-res-2" }
            ]
          },
          {
            "id": "seed-quiz-q-2",
            "title": "Hangi format seni daha çok çeker?",
            "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
            "description": "Birini seç.",
            "showOnCover": false,
            "layout": "list",
            "answers": [
              { "id": "seed-quiz-q2-a1", "text": "Rapor ve veri", "resultId": "seed-quiz-res-1" },
              { "id": "seed-quiz-q2-a2", "text": "Görsel ve kısa video", "resultId": "seed-quiz-res-2" }
            ]
          }
        ],
        "questionSorting": "asc",
        "allowMultiple": false,
        "showResults": true,
        "endDate": ""
      }
    }
  ]$json$::jsonb AS items
)
INSERT INTO public.posts (
  title,
  summary,
  content,
  category,
  type,
  thumbnail_url,
  media_url,
  likes_count,
  comments_count,
  shares_count,
  dislikes_count,
  card_data,
  slug,
  items,
  status,
  seo_title,
  seo_description,
  keywords,
  language_code,
  published_at,
  updated_at,
  is_pinned
)
VALUES
  (
    'Demo Haber: Tüm İçerik Blokları',
    'Tek haberde tüm editör blokları ve sosyal medya örnekleri yer alır.',
    'Bu demo haber, tüm blok tiplerini sisteminde denemen için hazırlandı.',
    COALESCE((SELECT labels[1] FROM cat_list), 'Genel'),
    'article',
    '/api/storage/file/image/2026-01-06/iste-bakan-fidan-konusurken-mkyk-uyelerinin_18816901_5135_xl.webp',
    NULL,
    0,
    0,
    0,
    0,
    '{"seed":"örnek-1"}'::jsonb,
    'demo-haber-tum-icerik-bloklari',
    (SELECT items FROM seed_items),
    'published',
    'Demo Haber: Tüm İçerik Blokları',
    'Tüm editör bloklarını içeren örnek haber.',
    'demo,örnek,editör,haber',
    'tr',
    NOW() - interval '4 days',
    NOW(),
    false
  ),
  (
    'Haftalık Enerji Güncellemesi',
    'Proje takviminde bu hafta özet ve yeni hedefler.',
    'Kısa güncelleme haberi; görsel, video ve sosyal bloklarla desteklendi.',
    COALESCE((SELECT labels[2] FROM cat_list), (SELECT labels[1] FROM cat_list), 'Genel'),
    'article',
    '/api/storage/file/image/2025-12-31/76148374-cgabebcyxvo6j7s2d0lwdq_xl.webp',
    NULL,
    0,
    0,
    0,
    0,
    '{"seed":"örnek-2"}'::jsonb,
    'haftalik-enerji-guncellemesi',
    (SELECT items FROM seed_items),
    'published',
    'Haftalık Enerji Güncellemesi',
    'Haftalık özet ve görseller içeren haber.',
    'enerji,haftalık,güncelleme',
    'tr',
    NOW() - interval '3 days',
    NOW(),
    false
  ),
  (
    'Kısa Video Brifingi',
    'Haftanın kısa video özetini izleyin.',
    'Video brifingi, ana başlıkları 90 saniyede aktarır.',
    COALESCE((SELECT labels[3] FROM cat_list), (SELECT labels[1] FROM cat_list), 'Genel'),
    'article',
    '/api/storage/file/image/2026-01-06/nigdenewslogo_xl.webp',
    NULL,
    0,
    0,
    0,
    0,
    '{"seed":"örnek-3"}'::jsonb,
    'kisa-video-brifingi',
    (SELECT items FROM seed_items),
    'published',
    'Kısa Video Brifingi',
    'Video brifingi içeren örnek haber.',
    'video,brifing,hafta',
    'tr',
    NOW() - interval '2 days',
    NOW(),
    false
  ),
  (
    'Topluluk Anketi Özeti',
    'Ulaşım değişiklikleri için kamuoyu nabzı.',
    'Anket, alıntı ve sosyal bağlantılarla desteklenen kısa haber.',
    COALESCE((SELECT labels[4] FROM cat_list), (SELECT labels[1] FROM cat_list), 'Genel'),
    'article',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000',
    NULL,
    0,
    0,
    0,
    0,
    '{"seed":"örnek-4"}'::jsonb,
    'topluluk-anketi-ozeti',
    (SELECT items FROM seed_items),
    'published',
    'Topluluk Anketi Özeti',
    'Anket odaklı örnek haber.',
    'anket,topluluk,geri bildirim',
    'tr',
    NOW() - interval '1 day',
    NOW(),
    false
  ),
  (
    'Sesli Röportaj Paketi',
    'Röportaj kaydı ve indirilebilir kısa doküman.',
    'Sesli içerik ve ek dosyalarla hazırlanan örnek haber.',
    COALESCE((SELECT labels[5] FROM cat_list), (SELECT labels[1] FROM cat_list), 'Genel'),
    'article',
    '/api/storage/file/image/2026-01-06/iste-bakan-fidan-konusurken-mkyk-uyelerinin_18816901_5135_xl.webp',
    NULL,
    0,
    0,
    0,
    0,
    '{"seed":"örnek-5"}'::jsonb,
    'sesli-roportaj-paketi',
    (SELECT items FROM seed_items),
    'published',
    'Sesli Röportaj Paketi',
    'Sesli röportaj ve PDF içeren örnek.',
    'ses,röportaj,dosya',
    'tr',
    NOW(),
    NOW(),
    false
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  thumbnail_url = EXCLUDED.thumbnail_url,
  media_url = EXCLUDED.media_url,
  likes_count = EXCLUDED.likes_count,
  comments_count = EXCLUDED.comments_count,
  shares_count = EXCLUDED.shares_count,
  dislikes_count = EXCLUDED.dislikes_count,
  card_data = EXCLUDED.card_data,
  items = EXCLUDED.items,
  status = EXCLUDED.status,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  keywords = EXCLUDED.keywords,
  language_code = EXCLUDED.language_code,
  published_at = EXCLUDED.published_at,
  updated_at = EXCLUDED.updated_at,
  is_pinned = EXCLUDED.is_pinned;
