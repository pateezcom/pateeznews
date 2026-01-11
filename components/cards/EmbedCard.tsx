
import React, { useEffect } from 'react';
import { ExternalLink, Twitter, Facebook, Instagram } from 'lucide-react';
import { NewsItem } from '../../types';

interface EmbedCardProps {
  data: NewsItem;
}

const EmbedCard: React.FC<EmbedCardProps> = ({ data }) => {

  // EMBED SCRIPT YÖNETİMİ (Twitter)
  useEffect(() => {
    const isTwitter = data.mediaUrl.includes('twitter.com') || data.mediaUrl.includes('x.com');

    if (isTwitter) {
      const src = "https://platform.twitter.com/widgets.js";
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (!existing) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => (window as any).twttr?.widgets?.load();
        document.body.appendChild(script);
      } else if ((window as any).twttr?.widgets) {
        (window as any).twttr.widgets.load();
      }
    }

  }, [data.mediaUrl]);

  // Platform Tespiti
  let platform = 'unknown';
  let embedContent = null;
  let platformColor = 'bg-gray-100';
  let platformIcon = <ExternalLink size={16} className="text-gray-500" />;
  let platformName = 'Bağlantı';

  if (data.mediaUrl.includes('twitter.com') || data.mediaUrl.includes('x.com')) {
    platform = 'twitter';
    platformName = 'X (Twitter)';
    platformColor = 'bg-black text-white';
    platformIcon = <Twitter size={14} className="fill-current" />;

    embedContent = (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <blockquote className="twitter-tweet" data-dnt="true" data-theme="light">
          <a href={data.mediaUrl}></a>
        </blockquote>
      </div>
    );

  } else if (data.mediaUrl.includes('facebook.com')) {
    platform = 'facebook';
    platformName = 'Facebook';
    platformColor = 'bg-[#1877F2] text-white';
    platformIcon = <Facebook size={14} className="fill-current" />;
    const encodedUrl = encodeURIComponent(data.mediaUrl);
    embedContent = (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <iframe
          src={`https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`}
          width="100%"
          height="460"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          className="w-full max-w-[500px]"
        ></iframe>
      </div>
    );
  } else if (data.mediaUrl.includes('instagram.com')) {
    platform = 'instagram';
    platformName = 'Instagram';
    platformColor = 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white';
    platformIcon = <Instagram size={14} className="text-white" />;

    const instaMatch = data.mediaUrl.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
    const instaType = instaMatch?.[1] || 'p';
    const instaCode = instaMatch?.[2];
    const embedUrl = instaCode
      ? `https://www.instagram.com/${instaType}/${instaCode}/embed/captioned/?utm_source=ig_embed&captioned=1`
      : '';

    embedContent = embedUrl ? (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <iframe
          src={embedUrl}
          title="Instagram embed"
          width="100%"
          height="820"
          loading="eager"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          className="w-full max-w-[540px]"
        ></iframe>
      </div>
    ) : (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <a href={data.mediaUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ExternalLink size={12} />
          Instagram gönderisini aç
        </a>
      </div>
    );
  } else if (data.mediaUrl.includes('pinterest.com') || data.mediaUrl.includes('pin.it')) {
    platform = 'pinterest';
    platformName = 'Pinterest';
    platformColor = 'bg-[#E60023] text-white';
    platformIcon = <ExternalLink size={14} className="text-white" />;

    const pinId = data.mediaUrl.split('/').filter(Boolean).pop()?.split('?')[0];
    const isNumericId = !!pinId && /^\d+$/.test(pinId);

    embedContent = isNumericId ? (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <iframe
          src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
          width="100%"
          height="1000"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          className="w-full max-w-[500px]"
        ></iframe>
      </div>
    ) : (
      <div className="w-full flex justify-center bg-white overflow-hidden">
        <a href={data.mediaUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ExternalLink size={12} />
          Pinterest pini
        </a>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-3 overflow-hidden">
      {/* Başlık ve Alt Başlık (Summary) */}
      <div className="px-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-bold shadow-sm ${platformColor}`}>
            {platformIcon}
            <span>{platformName}</span>
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{data.title}</h3>
        <div
          className="rich-text-content text-gray-600/80 text-[16px] leading-relaxed font-medium text-left [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: data.summary }}
        />
      </div>

      {/* Embed Container */}
      <div className="w-full flex justify-center mt-2">
        {embedContent}
      </div>

      {/* Link Linki (Fallback) */}
      <div className="flex justify-start pt-2">
        <a href={data.mediaUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ExternalLink size={12} />
          Kaynağa Git
        </a>
      </div>
    </div>
  );
};

export default EmbedCard;
