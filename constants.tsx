
import { NewsType, NewsItem, StoryItem } from './types';

export const STORIES: StoryItem[] = [
  { id: '1', title: 'Mars\'ta Yeni Yaşam İzi!', mediaUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=400', mediaType: 'image', sourceName: 'Teknoloji', isActive: true },
  { id: '2', title: 'Şampiyonlar Ligi Kuraları Çekildi', mediaUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400', mediaType: 'image', sourceName: 'Spor', isActive: true },
  { id: '3', title: 'Haftanın En İyi Filmleri', mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400', mediaType: 'image', sourceName: 'Kültür', isActive: true },
  { id: '4', title: 'Yeni iPhone Modeli Sızdırıldı', mediaUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400', mediaType: 'image', sourceName: 'Teknoloji', isActive: true },
  { id: '5', title: 'İstanbul\'da Dev Konser', mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', mediaType: 'image', sourceName: 'Magazin', isActive: true },
];

export const NEWS_FEED: NewsItem[] = [
  {
    id: 'n_review_1',
    type: NewsType.REVIEW,
    title: 'iPhone 15 Pro Max İncelemesi: Titanyum Devrimi mi?',
    summary: 'Apple\'ın en yeni amiral gemisini 2 hafta boyunca test ettik. Hafifleyen gövdesi, Type-C portu ve 5x zoom kamerası ile yükseltmeye değer mi? İşte detaylı incelememiz.',
    category: 'Teknoloji / İnceleme',
    source: 'Buzz Tech',
    author: 'Tekno Editör',
    timestamp: '2 saat önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000',
    likes: 18500,
    comments: 940,
    shares: 2300,
    reviewData: {
      productName: 'iPhone 15 Pro Max',
      productImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
      score: 92,
      verdict: "Piyasadaki en iyi akıllı telefonlardan biri. Özellikle video çekimi ve performans konusunda rakipsiz, ancak şarj hızı hala rakiplerinin gerisinde.",
      pros: [
        'Titanyum kasa ile çok daha hafif',
        'Type-C portu nihayet geldi',
        'A17 Pro çip performansı inanılmaz',
        '5x Telefoto kamera çok başarılı'
      ],
      cons: [
        'Şarj hızı hala yavaş (20W-27W)',
        'Kutu içeriği zayıf',
        'Yüksek fiyat etiketi'
      ],
      breakdown: [
        { label: 'Tasarım & Malzeme', score: 95 },
        { label: 'Ekran & Görüntü', score: 98 },
        { label: 'Kamera Performansı', score: 94 },
        { label: 'Pil Ömrü', score: 85 },
        { label: 'Fiyat / Performans', score: 75 }
      ]
    }
  },
  {
    id: 'n_ba_1',
    type: NewsType.BEFORE_AFTER,
    title: 'Büyük Restorasyon Tamamlandı: Tarihin Renkleri Geri Döndü',
    summary: 'Yıllara meydan okuyan tarihi kütüphane binası, 5 yıl süren titiz restorasyonun ardından eski ihtişamına kavuştu. Değişimi görmek için çubuğu kaydırın.',
    category: 'Mimari / Sanat',
    source: 'Buzz Culture',
    author: 'Sanat Ekibi',
    timestamp: 'Şimdi',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000',
    likes: 34500,
    comments: 2100,
    shares: 8700,
    beforeAfterData: {
      // Before: Siyah Beyaz ve biraz daha kontrastlı (Eski havası)
      beforeImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000&sat=-100&bri=-10&con=20',
      // After: Orijinal canlı renkler
      afterImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1000',
      beforeLabel: '1920 (ARŞİV)',
      afterLabel: '2024 (GÜNCEL)'
    }
  },
  {
    id: 'n_flip_1',
    type: NewsType.FLIP_CARD,
    title: 'Tarihin Sıfır Noktası: Göbeklitepe\'nin Gerçek Yüzü',
    summary: 'Arkeolojik kazılar sonucu ortaya çıkan gerçekler bildiğimiz tarihi değiştiriyor. Kartı çevir ve 12.000 yıl öncesine tanıklık et.',
    category: 'Tarih / Gizem',
    source: 'Buzz History',
    author: 'Prof. Dr. Arkeo',
    timestamp: 'Şimdi',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1574515546176-7c93c1a3579b?auto=format&fit=crop&q=80&w=1000',
    likes: 24500,
    comments: 1890,
    shares: 5600,
    flipData: {
      frontImage: 'https://images.unsplash.com/photo-1599739291060-4578e77dac5d?auto=format&fit=crop&q=80&w=1000', // Güncel çalışan görsel
      frontTitle: 'Günümüz: Kazı Alanı',
      backImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000', // Temsili antik dönem (atmosferik)
      backTitle: 'M.Ö. 10.000: Tapınaklar',
      backDescription: 'Burası sadece bir yerleşim yeri değil, insanlık tarihinin ilk inanç merkeziydi. Sütunların üzerindeki hayvan figürleri, o dönemin mitolojisini anlatıyor.'
    }
  },
  {
    id: 'n_embed_twitter_1',
    type: NewsType.EMBED,
    title: 'Gündemi Sarsan Açıklama Geldi',
    summary: 'Sosyal medya bu paylaşımı konuşuyor. Binlerce etkileşim alan o tweet gündeme bomba gibi düştü.',
    category: 'Gündem / Sosyal Medya',
    source: 'X (Twitter)',
    author: 'Erdogan Ozegen',
    timestamp: 'Az önce',
    mediaUrl: 'https://x.com/erdoganozegenn/status/2004226044140659051?s=20',
    thumbnail: '', // Embed için kullanılmıyor
    likes: 15420,
    comments: 2300,
    shares: 4500
  },
  {
    id: 'n_audio_podcast_1',
    type: NewsType.AUDIO,
    title: 'Geleceğin Teknolojisi: Yapay Zeka ve Biz',
    summary: 'Bu hafta BuzzCast\'te yapay zekanın gündelik hayatımızı nasıl değiştirdiğini ve gelecekte bizi nelerin beklediğini konuşuyoruz. Kulaklıklarınızı takın!',
    category: 'Podcast / Teknoloji',
    source: 'BuzzCast',
    author: 'Teknoloji Masası',
    timestamp: 'Yeni Bölüm',
    // Gerçek bir ses dosyası örneği (Telif hakkı olmayan bir sample)
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&q=80&w=1000',
    videoDuration: '06:12', // Podcast süresi
    likes: 3420,
    comments: 156,
    shares: 890
  },
  {
    id: 'n_embed_facebook_1',
    type: NewsType.EMBED,
    title: 'Facebook\'ta Paylaşım Rekoru Kıran Haber',
    summary: 'DMC Haber tarafından paylaşılan ve binlerce yorum alan o gönderi, sosyal medyanın en çok konuşulanları arasına girdi.',
    category: 'Gündem / Haber',
    source: 'Facebook',
    author: 'DMC Haber',
    timestamp: '2 saat önce',
    // Kullanıcının verdiği iframe içindeki link
    mediaUrl: 'https://www.facebook.com/dmchaber/posts/pfbid02HduSa4swGEhqa2Powbbwo2r6UDfuij8VrYuR6WpRkHx8peqCmKzDPW1DZ83J4psxl',
    thumbnail: '',
    likes: 8500,
    comments: 450,
    shares: 12000
  },
  {
    id: 'n_video_landscape',
    type: NewsType.VIDEO,
    title: 'Şehrin Altında Gizli Bir Dünya: İstanbul Sarnıçları',
    summary: 'Yerebatan Sarnıcı\'nın ötesinde, binlerce yıllık tarihin izini süren gizemli bir yolculuğa çıkıyoruz. Restorasyonu tamamlanan bu yeni yapı görenleri büyülüyor.',
    category: 'Tarih / Seyahat',
    source: 'Buzz History',
    author: 'İlber O.',
    timestamp: 'Şimdi',
    // Yatay Video (16:9)
    // Yatay Video (16:9) - Yanlış Pexels linki Unsplash ile değiştirildi (403 fix)
    mediaUrl: 'https://images.unsplash.com/photo-1628108427771-46da5252b47f?auto=format&fit=crop&q=80&w=1000',
    thumbnail: 'https://images.unsplash.com/photo-1628108427771-46da5252b47f?auto=format&fit=crop&q=80&w=1000',
    videoDuration: '12:45',
    likes: 15400,
    comments: 890,
    shares: 3200
  },
  {
    id: 'n_embed_instagram_1',
    type: NewsType.EMBED,
    title: 'Instagram\'da Günün En Çok Beğenilen Karesi',
    summary: 'Fotoğrafçılık tutkunlarını mest eden o kare. Işık, kompozisyon ve anın büyüsü bir arada.',
    category: 'Sanat / Fotoğraf',
    source: 'Instagram',
    author: 'Lens Master',
    timestamp: '45 dk önce',
    mediaUrl: 'https://www.instagram.com/p/DSsRKqRiH6z/?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    thumbnail: '',
    likes: 42300,
    comments: 120,
    shares: 560
  },
  {
    id: 'n_video_portrait',
    type: NewsType.VIDEO,
    title: 'Doğanın Kalbinde: Nehir ve Ormanın Dansı',
    summary: 'Şehrin gürültüsünden uzaklaşın ve doğanın dinginliğine kendinizi bırakın. İşte huzurun sesi.',
    category: 'Doğa / Yaşam',
    source: 'Buzz Nature',
    author: 'Seda G.',
    timestamp: '1 saat önce',
    // Dikey Video (Gerçek Vertical Video - Nehir/Orman Temalı)
    // Dikey Video - Yanlış Pexels linki Unsplash ile değiştirildi (403 fix)
    mediaUrl: 'https://images.unsplash.com/photo-1574515546176-7c93c1a3579b?auto=format&fit=crop&q=80&w=1000',
    // Thumbnail boş bırakıldı, böylece video yüklenince kendi karesi görünür, eski resim görünmez.
    thumbnail: '',
    videoDuration: '00:15', // Placeholder, gerçek süre yüklenince güncellenir
    likes: 22100,
    comments: 1200,
    shares: 5600
  },
  {
    id: 'n_image_1',
    type: NewsType.IMAGE,
    title: 'James Webb Uzay Teleskobu\'ndan Büyüleyici Yeni Kare!',
    summary: 'Derin uzayın en net görüntüsü paylaşıldı. Bilim dünyası bu keşifle heyecan içerisinde.',
    category: 'Bilim / Uzay',
    source: 'Buzz Space',
    author: 'Aylin Yıldız',
    timestamp: 'Yeni',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1000',
    likes: 12500,
    comments: 230,
    shares: 4500
  },
  {
    id: 'n_gallery_1',
    type: NewsType.GALLERY,
    title: 'Doğanın En Büyüleyici Anları: Haftanın Seçkisi',
    summary: 'National Geographic fotoğrafçılarının dünyanın dört bir yanından yakaladığı, nefes kesen doğa manzaraları ve vahşi yaşam kareleri. Hem zirvelerin soğuğu hem de tropik ormanların canlılığı bu galeride.',
    category: 'Doğa / Seyahat',
    source: 'Buzz Nature',
    author: 'Cem Doğa',
    timestamp: '1 saat önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1000',
    mediaList: [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1000', // Landscape - Mountain
      'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=600&h=800', // Portrait - Bird
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', // Landscape - Beach
      'https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?auto=format&fit=crop&q=80&w=600&h=800', // Portrait - Architecture/Nature Mix
      'https://images.unsplash.com/photo-1501854140884-074cf2b2c3af?auto=format&fit=crop&q=80&w=1000'  // Landscape - Forest
    ],
    likes: 8900,
    comments: 450,
    shares: 1200
  },
  {
    id: 'n_vs_pro',
    type: NewsType.VS,
    title: 'Hangi Konsol Senin Favorin?',
    summary: 'Oyun dünyasının devleri karşı karşıya. Sen hangi taraftasın?',
    category: 'Oyun / Teknoloji',
    source: 'Buzz Gaming',
    author: 'Efe Yılmaz',
    timestamp: '2 dk önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=800',
    likes: 4200,
    comments: 890,
    shares: 340,
    totalVotes: 52000,
    options: [
      { id: 'vs_ps', text: 'PlayStation 5', votes: 28500, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800' },
      { id: 'vs_xbox', text: 'Xbox Series X', votes: 23500, image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'n_text_poll_1',
    type: NewsType.POLL,
    isImagePoll: false,
    title: 'Haftanın En Çok Tartışılan Konusu: Yapay Zeka',
    summary: 'Yapay zekanın sanat dünyasındaki yerini nasıl görüyorsun? Gelecek bizi korkutmalı mı?',
    category: 'Teknoloji / Sanat',
    source: 'Buzz Art',
    author: 'Selin Su',
    timestamp: '15 dk önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    likes: 1200,
    comments: 45,
    shares: 88,
    totalVotes: 3200,
    options: [
      { id: 'tp1', text: 'İnsan yaratıcılığını asla geçemez', votes: 1400 },
      { id: 'tp2', text: 'Yeni bir sanat devriminin kapısıdır', votes: 1200 },
      { id: 'tp3', text: 'Sanatçıların emeğini sömürüyor', votes: 600 }
    ]
  },
  {
    id: 'n1_3col_poll',
    type: NewsType.POLL,
    isImagePoll: true,
    pollColumns: 3,
    title: 'Hafta Sonu İçin En İyi Rota Sence Hangisi?',
    summary: 'Şehrin gürültüsünden kaçmak için sabırsızlananlar burada mı? Senin hayalindeki kaçamak hangisi?',
    category: 'Yaşam / Gezi',
    source: 'Buzz Gezi',
    author: 'Caner Öz',
    timestamp: '12 dk önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    likes: 5600,
    comments: 420,
    shares: 890,
    totalVotes: 24500,
    options: [
      { id: 'v1', text: 'Doğa & Kamp', votes: 12500, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400' },
      { id: 'v2', text: 'Şehir & Kültür', votes: 8200, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=400' },
      { id: 'v3', text: 'Lüks & Otel', votes: 3800, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  {
    id: 'n1_2col_poll',
    type: NewsType.POLL,
    isImagePoll: true,
    pollColumns: 2,
    title: 'Geleceğin Otomobili Sence Hangisi Olacak?',
    summary: 'Otomobil dünyasında devrim kapıda. Sen hangi teknolojiye yatırım yapardın?',
    category: 'Otomobil / Teknoloji',
    source: 'Buzz Auto',
    author: 'Murat Aras',
    timestamp: '45 dk önce',
    mediaUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    likes: 3100,
    comments: 156,
    shares: 230,
    totalVotes: 18200,
    options: [
      { id: 'c1', text: 'Tamamen Elektrikli', votes: 11000, image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400' },
      { id: 'c2', text: 'Hidrojen Yakıtlı', votes: 7200, image: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&q=80&w=400' },
    ]
  }
];