
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock } from 'lucide-react';
import { NewsItem } from '../../types';
import { formatTime } from '../../utils/helpers';

interface VideoCardProps {
  data: NewsItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState(data.videoDuration || "00:00");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const userHasPaused = useRef(false);

  // SCROLL OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          if (videoRef.current && videoRef.current.paused && !userHasPaused.current) {
            videoRef.current.muted = true; 
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setIsMuted(true);
                })
                .catch((e) => {
                  console.warn("Otomatik oynatma hatası:", e);
                  setIsPlaying(false);
                });
            }
          }
        } else {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.55, rootMargin: '-85px 0px 0px 0px' }
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => {
      if (videoContainerRef.current) observer.unobserve(videoContainerRef.current);
      observer.disconnect();
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        userHasPaused.current = true;
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        userHasPaused.current = false;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
        const remaining = duration - currentTime;
        setTimeDisplay(formatTime(Math.max(0, remaining)));
      }
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const el = e.currentTarget;
    if (el) {
      setTimeDisplay(formatTime(el.duration));
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="px-1 mb-2">
         <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
      </div>
      
      <div 
        ref={videoContainerRef} 
        onClick={togglePlay}
        className="relative w-full bg-black shadow-lg border border-gray-100 group flex justify-center items-center overflow-hidden cursor-pointer"
      >
        <video 
            ref={videoRef}
            src={data.mediaUrl}
            poster={data.thumbnail}
            className="w-auto h-auto max-h-[450px] object-contain mx-auto"
            muted={true}
            playsInline
            loop
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
        />
        
        {/* Timer */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 z-20 mb-1.5 pointer-events-none">
            <Clock size={12} className="text-white/80" />
            <span className="text-xs font-bold text-white tracking-wide font-mono min-w-[35px] text-center">
                {timeDisplay}
            </span>
        </div>

        {/* Overlay Controls */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            <button 
              onClick={toggleMute}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all z-20"
            >
               {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <div className="absolute top-4 left-4 bg-red-600 text-white px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 z-20">
                <div className={`w-1.5 h-1.5 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? 'Oynatılıyor' : 'Video'}</span>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {isPlaying ? (
                      <Pause size={24} className="fill-white text-white" />
                    ) : (
                      <Play size={24} className="fill-white text-white ml-1" />
                    )}
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/30 z-30">
           <div
             className="h-full bg-red-600 transition-all duration-100 ease-linear"
             style={{ width: `${progress}%` }}
           />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
