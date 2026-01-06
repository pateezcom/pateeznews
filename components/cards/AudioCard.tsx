
import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Rewind, FastForward, Play, Pause, VolumeX, Volume1, Volume2 } from 'lucide-react';
import { NewsItem } from '../../types';
import { formatTime } from '../../utils/helpers';

interface AudioCardProps {
  data: NewsItem;
}

const youtubeParser = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const id = match[2];
    return {
      id,
      embed: `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0&mute=0&controls=0&rel=0&showinfo=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`,
    };
  }
  return null;
};

const AudioCard: React.FC<AudioCardProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState(data.videoDuration || "00:00");
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ytInfo = youtubeParser(data.mediaUrl);
  const isYoutube = !!ytInfo;

  // YouTube state tracking
  const ytDurationRef = useRef<number>(0);
  const ytCurrentTimeRef = useRef<number>(0);

  const sendYoutubeCommand = (func: string, args: any = "") => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  const toggleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYoutube) {
      if (isPlaying) {
        sendYoutubeCommand("pauseVideo");
        setIsPlaying(false);
      } else {
        sendYoutubeCommand("playVideo");
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
        const remaining = duration - currentTime;
        setTimeDisplay(formatTime(Math.max(0, remaining)));
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    if (isYoutube) {
      sendYoutubeCommand("seekTo", [newTime, true]);
      const dur = ytDurationRef.current;
      if (dur > 0) setProgress((newTime / dur) * 100);
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress((newTime / audioRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isYoutube) {
      sendYoutubeCommand("setVolume", newVolume * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const skipAudio = (seconds: number) => {
    if (isYoutube) {
      const newTime = ytCurrentTimeRef.current + seconds;
      sendYoutubeCommand("seekTo", [newTime, true]);
    } else if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // YouTube Message Listener
  useEffect(() => {
    if (!isYoutube) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      let msg;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }
      if (!msg) return;

      if (msg.event === 'infoDelivery' && msg.info) {
        const info = msg.info;
        if (info.duration) ytDurationRef.current = info.duration;
        if (typeof info.currentTime !== 'undefined') {
          ytCurrentTimeRef.current = info.currentTime;
          const dur = ytDurationRef.current;
          if (dur > 0) {
            setProgress((info.currentTime / dur) * 100);
            setTimeDisplay(formatTime(Math.max(0, dur - info.currentTime)));
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYoutube]);

  // YouTube Progress Interval
  useEffect(() => {
    if (!isYoutube || !isPlaying) return;
    const interval = setInterval(() => {
      sendYoutubeCommand("getCurrentTime");
      sendYoutubeCommand("getDuration");
    }, 500);
    return () => clearInterval(interval);
  }, [isYoutube, isPlaying]);

  // Video yüklendiğinde gerçek süreyi al
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const el = e.currentTarget;
    if (el) {
      setTimeDisplay(formatTime(el.duration));
    }
  };

  return (
    <div className="mt-1 space-y-3">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[5px] p-6 shadow-xl border border-slate-700/50 relative overflow-hidden group">

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-[5px] mix-blend-overlay filter blur-[64px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-[5px] mix-blend-overlay filter blur-[64px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <audio
          ref={audioRef}
          src={data.mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* MAIN CONTENT STACK - Vertical Layout */}
        <div className="relative z-10 flex flex-col items-center gap-6">

          {/* 1. Header & Text Info (En Üstte) */}
          <div className="w-full flex flex-col items-center text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-white/10 border border-white/5 backdrop-blur-sm shadow-sm">
              <Headphones size={12} className="text-blue-300" />
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">BuzzCast Özel</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">{data.title}</h3>
            <p className="text-sm text-slate-400 font-medium">{data.author}</p>
          </div>

          {/* 2. Cover Art & Vinyl Animation (Ortada) */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 my-2">

            {/* Hidden YouTube Iframe */}
            {isYoutube && (
              <div className="absolute inset-0 opacity-0 pointer-events-none">
                <iframe
                  ref={iframeRef}
                  src={ytInfo.embed}
                  allow="autoplay; encrypted-media"
                  title="YouTube Audio Player"
                />
              </div>
            )}

            {/* Vinyl Record Effect - Resmin ARKASINDA */}
            <div
              className={`absolute top-0 left-0 w-full h-full rounded-full bg-black border-4 border-gray-800 shadow-2xl flex items-center justify-center transition-all duration-700 ease-out z-0
                ${isPlaying ? 'translate-x-[35%] rotate-[360deg]' : 'translate-x-0 rotate-0'}
              `}
            >
              <div className="w-full h-full rounded-full border-[12px] border-gray-900/40 relative flex items-center justify-center">
                <div className="absolute inset-0 border border-white/5 rounded-full m-4"></div>
                <div className="absolute inset-0 border border-white/5 rounded-full m-8"></div>
                <div className="absolute inset-0 border border-white/5 rounded-full m-12"></div>

                <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-inner relative z-10">
                  <div className="w-4 h-4 bg-slate-900 rounded-full border-2 border-black/20"></div>
                </div>
              </div>
            </div>

            {/* Main Cover Image - Z-Index 10 */}
            <div className={`relative z-10 w-full h-full rounded-[5px] overflow-hidden shadow-2xl border-4 border-slate-700/50 bg-slate-800 transition-transform duration-700`}>
              <img src={data.thumbnail} alt="Cover" className="w-full h-full object-contain" />

              {/* Playing Overlay on Image */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex gap-1.5 items-end h-10">
                  <div className="w-1.5 bg-white rounded-[5px] animate-equalizer" style={{ animationDuration: '0.6s' }}></div>
                  <div className="w-1.5 bg-white rounded-[5px] animate-equalizer" style={{ animationDuration: '1.1s' }}></div>
                  <div className="w-1.5 bg-white rounded-[5px] animate-equalizer" style={{ animationDuration: '0.8s' }}></div>
                  <div className="w-1.5 bg-white rounded-[5px] animate-equalizer" style={{ animationDuration: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Player Controls & Progress (Altta) */}
          <div className="w-full space-y-4 px-2">

            {/* Progress Bar */}
            <div className="w-full group/seek">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                <span>{isYoutube ? formatTime(ytCurrentTimeRef.current) : (audioRef.current ? formatTime(audioRef.current.currentTime) : "00:00")}</span>
                <span>{timeDisplay}</span>
              </div>
              <div className="relative w-full h-2 bg-slate-700/50 rounded-[5px] overflow-hidden cursor-pointer">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-[5px] transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={isYoutube ? (ytDurationRef.current || 100) : (audioRef.current?.duration || 100)}
                  value={isYoutube ? (ytCurrentTimeRef.current || 0) : (audioRef.current?.currentTime || 0)}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Main Buttons */}
            <div className="flex items-center justify-center gap-8">
              <button onClick={() => skipAudio(-15)} className="text-slate-400 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-[5px]">
                <Rewind size={24} className="fill-current" />
              </button>

              <button
                onClick={toggleAudioPlay}
                className="w-16 h-16 bg-white text-slate-900 rounded-[5px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? (
                  <Pause size={28} className="fill-slate-900 ml-0.5" />
                ) : (
                  <Play size={28} className="fill-slate-900 ml-1" />
                )}
              </button>

              <button onClick={() => skipAudio(15)} className="text-slate-400 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-[5px]">
                <FastForward size={24} className="fill-current" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => {
                const newVol = volume === 0 ? 1 : 0;
                setVolume(newVol);
                if (isYoutube) {
                  sendYoutubeCommand("setVolume", newVol * 100);
                } else if (audioRef.current) {
                  audioRef.current.volume = newVol;
                }
              }} className="text-slate-400 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX size={18} /> : (volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />)}
              </button>
              <div className="w-32 relative h-1.5 bg-slate-700 rounded-[5px] cursor-pointer group/vol">
                <div
                  className="absolute top-0 left-0 h-full bg-slate-400 group-hover/vol:bg-blue-400 rounded-[5px] transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioCard;
