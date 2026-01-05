
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { NewsItem } from '../../types';
import { formatTime } from '../../utils/helpers';

interface VideoCardProps {
  data: NewsItem;
}

const youtubeParser = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const id = match[2];
    const isShorts = url.includes('/shorts/');
    return {
      id,
      embed: `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0&mute=1&controls=0&rel=0&showinfo=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`,
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      isShorts
    };
  }
  return null;
};

const VideoCard: React.FC<VideoCardProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState(data.videoDuration || "00:00");

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const userHasPaused = useRef(false);

  // YouTube state tracking
  const ytDurationRef = useRef<number>(0);
  const ytCurrentTimeRef = useRef<number>(0);
  const ytPlayerReady = useRef<boolean>(false);
  const ytPlayerStateRef = useRef<number>(-1);

  const ytInfo = youtubeParser(data.mediaUrl);
  const isYoutube = !!ytInfo;

  const sendYoutubeCommand = (func: string, args: any = "") => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  // YouTube Listener Kaydı - iframe yüklendikten sonra çağrılacak
  const initYoutubeListeners = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // YouTube Player'a event listener kaydı yap
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "listening" }),
        "*"
      );

      // iframe yüklendi, şimdi görünürlük kontrolü yap ve videoyu başlat
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Duration bilgisini al
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "getDuration" }),
            "*"
          );

          // Video tamamen görünürse otomatik başlat
          if (videoContainerRef.current && !userHasPaused.current) {
            const rect = videoContainerRef.current.getBoundingClientRect();
            // Navbar yüksekliği hesaba katılıyor (72px)
            const navbarHeight = 72;
            const isFullyVisible =
              rect.top >= navbarHeight &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth);

            if (isFullyVisible) {
              // Video başlamadan önce duration'ı kontrol et ve timeDisplay'i güncelle
              if (ytDurationRef.current > 0) {
                setTimeDisplay(formatTime(ytDurationRef.current));
              } else if (data.videoDuration) {
                // data.videoDuration'dan parse et
                let parsedDuration = 0;
                const numeric = Number(data.videoDuration);
                if (!isNaN(numeric) && numeric > 0 && !String(data.videoDuration).includes(':')) {
                  parsedDuration = numeric;
                } else if (typeof data.videoDuration === 'string' && data.videoDuration.includes(':')) {
                  const parts = data.videoDuration.split(':').map(Number);
                  if (parts.length === 2) parsedDuration = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) parsedDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
                if (parsedDuration > 0) {
                  ytDurationRef.current = parsedDuration;
                  setTimeDisplay(formatTime(parsedDuration));
                }
              }

              sendYoutubeCommand("playVideo");
              setIsPlaying(true);
            }
          }
        }
      }, 800);
    }
  };

  // Robust Duration Parsing from data.videoDuration
  useEffect(() => {
    let duration = 0;
    if (data.videoDuration) {
      // 1. Try parsing as pure number (seconds)
      const numeric = Number(data.videoDuration);
      if (!isNaN(numeric) && numeric > 0 && !data.videoDuration.includes(':')) {
        duration = numeric;
      }
      // 2. Parse MM:SS or HH:MM:SS
      else if (typeof data.videoDuration === 'string' && data.videoDuration.includes(':')) {
        const parts = data.videoDuration.split(':').map(Number);
        if (parts.length === 2) duration = parts[0] * 60 + parts[1];
        else if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }

    if (duration > 0) {
      ytDurationRef.current = duration;
      // If stopped/initial, show total time immediately
      if (!isPlaying && progress === 0) {
        setTimeDisplay(formatTime(duration));
      }
    }
  }, [data.videoDuration, isPlaying, progress]);

  // Normal video için sayfa açılışında görünürlük kontrolü
  useEffect(() => {
    if (isYoutube) return; // YouTube için ayrı kontrol var

    const checkAndPlayVideo = () => {
      if (videoRef.current && videoContainerRef.current && !userHasPaused.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        // Navbar yüksekliği hesaba katılıyor (72px)
        const navbarHeight = 72;
        const isFullyVisible =
          rect.top >= navbarHeight &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (isFullyVisible && videoRef.current.paused) {
          videoRef.current.muted = true;
          videoRef.current.play()
            .then(() => { setIsPlaying(true); setIsMuted(true); })
            .catch(() => setIsPlaying(false));
        }
      }
    };

    // Video yüklendikten sonra kontrol et
    const timer = setTimeout(checkAndPlayVideo, 500);
    return () => clearTimeout(timer);
  }, [isYoutube]);

  // YouTube Message Listener
  useEffect(() => {
    if (!isYoutube) return;

    const handleMessage = (event: MessageEvent) => {
      // Allow youtube.com subdomains
      if (!event.origin.includes('youtube.com')) return;

      let msg;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }

      if (!msg) return;

      // Player hazır olduğunda listener başlat
      if (msg.event === 'onReady' || (msg.event === 'initialDelivery')) {
        ytPlayerReady.current = true;
      }

      // Info update'leri işle
      if (msg.event === 'infoDelivery' && msg.info) {
        const info = msg.info;

        // Player durumunu kaydet (1 = oynatılıyor, 2 = duraklatıldı)
        if (typeof info.playerState !== 'undefined') {
          ytPlayerStateRef.current = info.playerState;
        }

        // Duration bilgisini al
        if (info.duration) {
          const d = Number(info.duration);
          if (!isNaN(d) && d > 0) {
            ytDurationRef.current = d;
          }
        }

        // Current time bilgisini al ve UI'ı güncelle
        if (typeof info.currentTime !== 'undefined') {
          const c = Number(info.currentTime);
          if (!isNaN(c) && c >= 0) {
            ytCurrentTimeRef.current = c;

            const dur = ytDurationRef.current;
            if (dur > 0) {
              setProgress((c / dur) * 100);
              setTimeDisplay(formatTime(Math.max(0, dur - c)));
            }
          }
        }
      }

      // Eski format desteği (bazı YouTube embed'leri için)
      if (msg.info && !msg.event) {
        const info = msg.info;

        if (info.duration) {
          const d = Number(info.duration);
          if (!isNaN(d) && d > 0) ytDurationRef.current = d;
        }

        if (typeof info.currentTime !== 'undefined') {
          const c = Number(info.currentTime);
          if (!isNaN(c) && c >= 0) {
            ytCurrentTimeRef.current = c;

            const dur = ytDurationRef.current;
            if (dur > 0) {
              setProgress((c / dur) * 100);
              setTimeDisplay(formatTime(Math.max(0, dur - c)));
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYoutube]);

  // Timer interval for smooth playback steps
  useEffect(() => {
    if (!isYoutube || !isPlaying) return;

    const interval = setInterval(() => {
      // YouTube'dan güncel bilgileri talep et
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "getCurrentTime" }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "getDuration" }),
          "*"
        );
      }

      // Lokal tahmine dayalı increment (API gecikmelerinde yumuşak ilerleme için)
      ytCurrentTimeRef.current = (ytCurrentTimeRef.current || 0) + 0.25;

      const dur = ytDurationRef.current;
      const cur = ytCurrentTimeRef.current;

      if (dur > 0) {
        // Prevent visual overflow
        const visualCur = Math.min(cur, dur);

        // Progress %
        setProgress((visualCur / dur) * 100);

        // Countdown
        const remaining = Math.max(0, dur - visualCur);
        setTimeDisplay(formatTime(remaining));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isYoutube, isPlaying]);

  // Scroll Observer - Manuel görünürlük kontrolü (navbar hesaba katılıyor)
  useEffect(() => {
    const NAVBAR_HEIGHT = 72; // Navbar yüksekliği

    const checkVisibility = () => {
      if (!videoContainerRef.current) return;

      const rect = videoContainerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      // Video tamamen görünür mü? (navbar altında ve ekran içinde)
      const isFullyVisible =
        rect.top >= NAVBAR_HEIGHT &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth;

      if (isFullyVisible) {
        // Video tamamen görünür - oynat
        if (!userHasPaused.current && !isPlaying) {
          if (isYoutube) {
            // Video başlamadan önce duration'ı kontrol et ve timeDisplay'i güncelle
            if (ytDurationRef.current > 0) {
              setTimeDisplay(formatTime(ytDurationRef.current));
            } else if (data.videoDuration) {
              // data.videoDuration'dan parse et
              let parsedDuration = 0;
              const numeric = Number(data.videoDuration);
              if (!isNaN(numeric) && numeric > 0 && !String(data.videoDuration).includes(':')) {
                parsedDuration = numeric;
              } else if (typeof data.videoDuration === 'string' && data.videoDuration.includes(':')) {
                const parts = data.videoDuration.split(':').map(Number);
                if (parts.length === 2) parsedDuration = parts[0] * 60 + parts[1];
                else if (parts.length === 3) parsedDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }
              if (parsedDuration > 0) {
                ytDurationRef.current = parsedDuration;
                setTimeDisplay(formatTime(parsedDuration));
              }
            }

            sendYoutubeCommand("playVideo");
            setIsPlaying(true);
          } else if (videoRef.current && videoRef.current.paused) {
            videoRef.current.muted = true;
            videoRef.current.play()
              .then(() => { setIsPlaying(true); setIsMuted(true); })
              .catch(() => setIsPlaying(false));
          }
        }
      } else {
        // Video görünür değil - durdur
        if (isPlaying) {
          if (isYoutube) {
            sendYoutubeCommand("pauseVideo");
            setIsPlaying(false);
          } else if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
    };

    // Scroll ve resize event'lerini dinle
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });

    // İlk yüklemede kontrol et
    checkVisibility();

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, [isYoutube, isPlaying]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYoutube) {
      sendYoutubeCommand(isMuted ? "unMute" : "mute");
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYoutube) {
      if (isPlaying) { sendYoutubeCommand("pauseVideo"); setIsPlaying(false); userHasPaused.current = true; }
      else { sendYoutubeCommand("playVideo"); setIsPlaying(true); userHasPaused.current = false; }
    } else if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); userHasPaused.current = true; }
      else { videoRef.current.play(); setIsPlaying(true); userHasPaused.current = false; }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      const cur = videoRef.current.currentTime;
      if (dur > 0) {
        setProgress((cur / dur) * 100);
        setTimeDisplay(formatTime(Math.max(0, dur - cur)));
      }
    }
  };

  return (
    <div className="mt-1 space-y-3">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>

      <div
        ref={videoContainerRef}
        onClick={togglePlay}
        className="relative w-full bg-black shadow-lg border border-gray-100 group flex justify-center items-center overflow-hidden cursor-pointer rounded-[5px]"
      >
        {isYoutube ? (
          <div className={`w-full aspect-video ${ytInfo.isShorts ? 'max-w-[300px] aspect-[9/16]' : ''}`}>
            <iframe
              ref={iframeRef}
              src={ytInfo.embed}
              className="w-full h-full pointer-events-none scale-105"
              allow="autoplay; encrypted-media; fullscreen"
              title="YouTube video player"
              onLoad={initYoutubeListeners}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={data.mediaUrl}
            poster={data.thumbnail}
            className="w-auto h-auto max-h-[450px] object-contain mx-auto"
            muted={true}
            playsInline
            loop
            onLoadedMetadata={(e) => setTimeDisplay(formatTime(e.currentTarget.duration))}
            onTimeUpdate={handleTimeUpdate}
          />
        )}

        {/* Timer */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-[5px] border border-white/10 flex items-center gap-1.5 z-20 mb-1.5 pointer-events-none">
          <Clock size={12} className="text-white/80" />
          <span className="text-xs font-bold text-white tracking-wide font-mono min-w-[35px] text-center">{timeDisplay}</span>
        </div>

        {/* Overlay Controls */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-[5px] bg-black/50 backdrop-blur-md border border-white/20 text-white z-20"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>



          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`
              w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border-2 border-white/40 
              flex items-center justify-center transition-all duration-300
              group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white
            `}>
              <span className="material-symbols-rounded text-white" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/30 z-30">
          <div className="h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
