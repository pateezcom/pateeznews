
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  Clock,
  ChevronRight,
  User,
  CheckCircle2,
  Calendar,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Home
} from 'lucide-react';
import { NewsItem, NewsType, NavigationItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Kart bileşenleri
import ReviewCard from './cards/ReviewCard';
import BeforeAfterCard from './cards/BeforeAfterCard';
import FlipCard from './cards/FlipCard';
import EmbedCard from './cards/EmbedCard';
import AudioCard from './cards/AudioCard';
import VideoCard from './cards/VideoCard';
import GalleryCard from './cards/GalleryCard';
import PollCard from './cards/PollCard';
import VSCard from './cards/VSCard';
import ParagraphCard from './cards/ParagraphCard';
import CommentSection from './CommentSection';

interface NewsDetailProps {
  data: NewsItem;
  onBack: () => void;
  navItems: NavigationItem[];
}

const NewsDetail: React.FC<NewsDetailProps> = ({ data, onBack, navItems }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const { t } = useLanguage();

  // Emoji Reactions Config
  const MAX_REACTIONS = 3;
  const emojis = [
    { id: 'bravo', emoji: '👏', label: 'Bravo', count: 3 },
    { id: 'dislike', emoji: '👎', label: 'Beğenmedim', count: 1 },
    { id: 'love', emoji: '😍', label: 'Aşık Oldum', count: 1 },
    { id: 'sad', emoji: '🥺', label: 'Üzgün', count: 0 },
    { id: 'great', emoji: '🙌', label: 'Harika', count: 0 },
    { id: 'laugh', emoji: '😂', label: 'Güldüm', count: 0 },
    { id: 'angry', emoji: '😡', label: 'Kızgın', count: 0 },
  ];

  const toggleEmoji = (id: string) => {
    if (selectedEmojis.includes(id)) {
      setSelectedEmojis(selectedEmojis.filter(e => e !== id));
    } else if (selectedEmojis.length < MAX_REACTIONS) {
      setSelectedEmojis([...selectedEmojis, id]);
    }
  };

  const getBreadcrumbs = () => {
    const crumbs: { label: string; value: string }[] = [];
    let currentCategory = data.category;

    const findItem = (val: string) => navItems.find(item => item.value === val || item.label === val);

    let item = findItem(currentCategory);
    while (item) {
      crumbs.unshift({ label: item.label, value: item.value });
      if (item.parent_id && item.parent_id !== 'root') {
        item = navItems.find(i => i.id === item?.parent_id);
      } else {
        item = undefined;
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderMedia = () => {
    const postType = String((data as any).postType || '').toLowerCase();
    const coverThumbnail = ((data as any).coverThumbnail as string) || data.thumbnail;

    // Eğer bu bir "article" haberi ise, ana medya her zaman haberin kapak görseli olmalı.
    if (postType === 'article') {
      return (
        <div className="rounded-[5px] overflow-hidden border border-gray-100 shadow-xl mt-4 mb-8">
          <img
            src={coverThumbnail}
            alt={data.seoTitle || data.title}
            title={data.seoTitle || data.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      );
    }

    switch (data.type) {
      case NewsType.REVIEW: return <ReviewCard data={data} />;
      case NewsType.BEFORE_AFTER: return <BeforeAfterCard data={data} />;
      case NewsType.FLIP_CARD: return <FlipCard data={data} />;
      case NewsType.EMBED: return <EmbedCard data={data} />;
      case NewsType.AUDIO: return <AudioCard data={data} />;
      case NewsType.VIDEO: return <VideoCard data={data} />;
      case NewsType.GALLERY: return <GalleryCard data={data} />;
      case NewsType.POLL: return <PollCard data={data} />;
      case NewsType.VS: return <VSCard data={data} />;
      case NewsType.PARAGRAPH: return <ParagraphCard data={data} />;
      default: return (
        <div className="rounded-[5px] overflow-hidden border border-gray-100 shadow-xl mt-4 mb-8">
          <img
            src={data.thumbnail}
            alt={data.seoTitle || data.title}
            title={data.seoTitle || data.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      );
    }
  };

  // 🚀 Dynamic Reading Time Engine
  const calculateReadingTime = () => {
    const wordsPerMinute = 200;
    const itemContent = data.items?.map(i => (i.title || '') + ' ' + (i.description || '')).join(' ') || '';
    const totalContent = (data.title || '') + ' ' + (data.summary || '') + ' ' + (data.content || '') + ' ' + itemContent;
    const words = totalContent.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const readingTime = calculateReadingTime();

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm relative min-h-screen mb-10 max-w-full mt-2 overflow-x-clip">

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-100/50 backdrop-blur-sm">
        <div
          className="h-full bg-blue-600 transition-all duration-100 shadow-md"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* TOP HEADER - FULL WIDTH AREA */}
      <div className="px-6 md:px-10 pt-8 pb-6 border-b border-gray-50 bg-gray-50/30 rounded-t-[5px]">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400 capitalize tracking-widest mb-6">
          <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Home size={12} />
            <span>Ana Sayfa</span>
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={10} />
              <span className="hover:text-gray-600 transition-colors cursor-default">
                {t(crumb.label).toLowerCase()}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Header Section */}
        <div className="w-full mb-10 overflow-hidden max-w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[900] text-gray-900 leading-[1.05] tracking-tighter mb-6">
            {data.title}
          </h1>
          <div
            dangerouslySetInnerHTML={{ __html: data.summary }}
            className="rich-text-content text-xl md:text-2xl font-bold text-gray-500 leading-relaxed max-w-full"
          />
        </div>

        {/* Meta Info Bar */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[5px] bg-gray-100 overflow-hidden shadow-sm">
              <img src={data.sourceAvatar || `https://picsum.photos/seed/auth${data.id}/100`} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-gray-900">{data.author}</span>
                <CheckCircle2 size={14} className="text-blue-500" />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={12} /> {data.timestamp}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {readingTime} Dakika Okuma</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-[5px] text-xs font-black transition-all hover:bg-gray-800 shadow-md">
              <Share2 size={14} />
              <span>Paylaş</span>
            </button>
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-[5px] hover:text-blue-600 transition-all">
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA WITH STICKY SIDEBAR */}
      <div className="flex flex-col md:flex-row relative">

        {/* LEFT STICKY SHARE BAR */}
        <aside className="hidden md:flex flex-col items-center gap-3 sticky top-24 p-6 border-r border-gray-50 z-10" style={{ height: 'fit-content', alignSelf: 'flex-start' }}>
          <div className="flex flex-col items-center mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 mb-2">PAYLAŞ</span>
            <div className="w-px h-8 bg-gray-100 mb-2"></div>
            <span className="text-xs font-black text-blue-600 mb-2">{data.shares.toLocaleString()}</span>
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-[#1DA1F2] text-white hover:scale-110 transition-all shadow-sm">
            <Twitter size={18} className="fill-current" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-[#4267B2] text-white hover:scale-110 transition-all shadow-sm">
            <Facebook size={18} className="fill-current" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-[#0077B5] text-white hover:scale-110 transition-all shadow-sm">
            <Linkedin size={18} className="fill-current" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-gray-100 text-gray-500 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
            <LinkIcon size={18} />
          </button>

          <div className="w-px h-6 bg-gray-100 my-1"></div>

          {/* Like Button with Count */}
          <div className="flex flex-col items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group">
              <Heart size={18} className="group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-[10px] font-black text-rose-500 mt-1">{data.likes.toLocaleString()}</span>
          </div>

          {/* Bookmark Button */}
          <button className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-gray-50 text-gray-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-gray-100">
            <Bookmark size={18} />
          </button>
        </aside>

        {/* MAIN BODY CONTENT */}
        <article className="flex-1 min-w-0 px-6 md:px-12 pt-6 pb-8 max-w-full md:mx-0 break-words overflow-hidden">

          {/* Main Media (Video, Poll, Gallery etc.) */}
          <div className="mb-10 overflow-hidden max-w-full">
            {renderMedia()}
          </div>

          {/* Body Items Rendering */}
          <div className="space-y-12 overflow-hidden">
            {data.items && data.items.length > 0 ? (
              data.items.map((item: any, index: number) => {
                const isLastItem = index === data.items.length - 1;
                switch (item.type) {
                  case 'text':
                    return (
                      <div key={item.id} className="rich-text-content prose prose-lg max-w-full text-gray-800">
                        {item.title && <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>}
                        <div dangerouslySetInnerHTML={{ __html: item.description }} className="leading-[1.85] font-medium text-gray-700" />
                        {item.source && <p className="text-xs text-gray-400 mt-2 italic flex items-center gap-1"><LinkIcon size={12} /> Kaynak: {item.source}</p>}
                      </div>
                    );
                  case 'image':
                    return (
                      <div key={item.id} className="space-y-4 max-w-full overflow-hidden">
                        {item.title && <h3 className="text-2xl font-black text-gray-900 break-normal">{item.title}</h3>}
                        <div className="relative w-full bg-gray-50 rounded-[5px] overflow-hidden border border-gray-100 shadow-lg flex items-center justify-center max-h-[600px]">
                          <div
                            className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-2xl opacity-10 scale-110"
                            style={{ backgroundImage: `url(${item.mediaUrl})` }}
                          />
                          <img
                            src={item.mediaUrl}
                            alt={item.altText || item.title || "Haber görseli"}
                            className="relative z-10 w-full h-auto max-h-[600px] object-contain"
                          />
                        </div>
                        {item.description && (
                          <div
                            dangerouslySetInnerHTML={{ __html: item.description }}
                            className="rich-text-content text-sm text-gray-500 font-medium italic text-left px-0 leading-relaxed"
                          />
                        )}
                      </div>
                    );
                  case 'paragraph':
                  case 'quote':
                    return (
                      <div key={item.id} className="py-4">
                        <ParagraphCard
                          data={{
                            ...data,
                            summary: '', // Ana özetle karışmasın
                            paragraphData: {
                              items: item.description ? [item.description] : (item.paragraphData?.items || []),
                              quoteAuthor: item.title || item.paragraphData?.quoteAuthor
                            }
                          } as any}
                        />
                      </div>
                    );
                  case 'slider':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <GalleryCard data={{ ...data, mediaList: item.mediaUrls } as any} />
                    </div>;
                  case 'poll':
                    return (
                      <div key={item.id} className="space-y-6 pt-12 border-t-2 border-palette-beige/30 mt-16 relative">
                        {/* News End Indicator / Poll Start */}
                        {isLastItem && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-palette-red" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-palette-tan">HABER SONU</span>
                            <div className="w-2 h-2 rounded-full bg-palette-red" />
                          </div>
                        )}

                        {item.title && (
                          <h3 className="text-3xl md:text-4xl font-[1000] text-gray-900 leading-tight tracking-tighter">
                            {item.title}
                            {(!item.title.trim().endsWith('?') && !item.title.trim().endsWith('!')) ? '?' : ''}
                          </h3>
                        )}
                        <PollCard data={{ ...data, title: item.title, summary: item.description, options: item.options, isImagePoll: item.isImagePoll, pollColumns: item.pollColumns } as any} />
                      </div>
                    );
                  case 'vs':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <VSCard data={{ ...data, title: item.title, options: item.options } as any} />
                    </div>;
                  case 'beforeafter':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <BeforeAfterCard data={{ ...data, beforeAfterData: item.beforeAfterData } as any} />
                    </div>;
                  case 'flipcard':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <FlipCard data={{ ...data, flipData: item.flipData } as any} />
                    </div>;
                  case 'review':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <ReviewCard data={{ ...data, reviewData: item.reviewData } as any} />
                    </div>;
                  case 'video':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <VideoCard data={{ ...data, mediaUrl: item.mediaUrl } as any} />
                    </div>;
                  case 'audio':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <AudioCard data={{ ...data, mediaUrl: item.mediaUrl } as any} />
                    </div>;
                  case 'social':
                  case 'iframe':
                    return <div key={item.id} className="space-y-4">
                      {item.title && <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>}
                      <EmbedCard data={{ ...data, mediaUrl: item.mediaUrl } as any} />
                    </div>;
                  default:
                    return null;
                }
              })
            ) : (
              <div
                className="rich-text-content prose prose-lg max-w-full text-gray-800"
                dangerouslySetInnerHTML={{ __html: data.content || "Bu haber için içerik bulunamadı." }}
              />
            )}
          </div>

          {/* FAQ Section */}
          {data.faqData && data.faqData.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-[5px] flex items-center justify-center text-blue-600">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Sıkça Sorulan Sorular</h3>
              </div>
              <div className="grid gap-4">
                {data.faqData.map((faq, idx) => (
                  <div key={idx} className="bg-gray-50/50 rounded-[10px] border border-gray-100/50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 group">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        ?
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-lg font-black text-gray-900 leading-tight">{faq.q}</h4>
                        <p className="text-gray-600 leading-relaxed font-medium">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords/Tags */}
          {data.keywords && (
            <div className="flex flex-wrap gap-2 mt-12 pb-6 border-b border-gray-50">
              {data.keywords.split(',').map((tag, idx) => (
                <button
                  key={idx}
                  className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-[5px] hover:bg-gray-200 transition-all"
                >
                  #{tag.trim()}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Reactions Section */}
          <div className="mt-10 pt-8 border-t-2 border-palette-beige/50">
            {/* Header - Küçültülmüş */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palette-beige to-transparent"></div>
              <div className="flex items-center gap-2 px-4 py-2 bg-palette-beige/30 rounded-full border border-palette-beige">
                <svg className="w-4 h-4 text-palette-tan" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                <span className="text-[11px] font-bold text-palette-tan uppercase tracking-widest">Bu Habere Tepki Ver</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palette-beige to-transparent"></div>
            </div>

            {/* Emoji Row - Tek Satır */}
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-nowrap overflow-visible pt-2 pb-2">
              {emojis.map((item) => {
                const isSelected = selectedEmojis.includes(item.id);
                const isDisabled = !isSelected && selectedEmojis.length >= MAX_REACTIONS;

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleEmoji(item.id)}
                    disabled={isDisabled}
                    className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 flex-shrink-0
                      ${isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 -translate-y-1'
                        : 'bg-white border-2 border-transparent hover:border-palette-beige hover:bg-palette-beige/20 hover:-translate-y-1 hover:shadow-lg'
                      }
                      ${isDisabled ? 'opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : 'cursor-pointer'}
                    `}
                  >
                    {/* Selected Check */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <span className={`text-3xl md:text-4xl transition-transform duration-300 select-none ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.emoji}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-emerald-600' : 'text-palette-tan/40 group-hover:text-palette-tan'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm font-black transition-colors ${isSelected ? 'text-emerald-600' : 'text-palette-tan'}`}>
                      {isSelected ? item.count + 1 : item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Info Message */}
            <p className={`text-center text-xs font-medium mt-4 transition-colors ${selectedEmojis.length >= MAX_REACTIONS ? 'text-palette-red' : 'text-palette-tan/40'}`}>
              {selectedEmojis.length >= MAX_REACTIONS
                ? 'En fazla 3 tepki verebilirsiniz.'
                : `${MAX_REACTIONS - selectedEmojis.length} tepki hakkınız kaldı.`
              }
            </p>
          </div>

          {/* Comments Section */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-palette-red rounded-full"></div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Fikirlerini Paylaş</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{data.comments} Yorum</span>
            </div>
            <CommentSection />
          </div>

        </article>
      </div>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 p-4 bg-white border border-gray-200 rounded-[5px] shadow-xl text-gray-400 hover:text-blue-600 transition-all z-50 ${scrollProgress > 20 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={20} className="-rotate-90" />
      </button>

    </div>
  );
};

export default NewsDetail;
