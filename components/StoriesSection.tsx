
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Play, Image as ImageIcon, Eye, ArrowLeft } from 'lucide-react';

interface StoryItem {
    id: string;
    title: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    sourceName?: string;
    viewCount?: number;
}

interface StoriesSectionProps {
    onBack?: () => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ onBack }) => {
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const { data, error } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    const mapped: StoryItem[] = data.map(s => ({
                        id: s.id,
                        title: s.title,
                        mediaUrl: s.media_url,
                        mediaType: s.media_type,
                        sourceName: s.source_name,
                        viewCount: s.view_count || 0
                    }));
                    setStories(mapped);
                }
            } catch (err) {
                console.error('Stories fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) return (
        <div className="flex gap-4 py-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="min-w-[120px] h-[200px] bg-gray-100 rounded-[5px] animate-pulse"></div>
            ))}
        </div>
    );

    if (stories.length === 0) return null;

    return (
        <div className="relative py-6 bg-white border-b border-gray-100 mb-8 overflow-hidden rounded-[5px] shadow-sm">
            {onBack && (
                <div className="px-6 mb-4 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-palette-red font-black text-[11px] uppercase tracking-widest transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>GERİ DÖN</span>
                    </button>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tüm Hikayeler</h2>
                </div>
            )}
            <Swiper
                modules={[FreeMode, Mousewheel]}
                spaceBetween={16}
                slidesPerView="auto"
                freeMode={true}
                mousewheel={{ forceToAxis: true }}
                className="px-6"
            >
                {stories.map((story) => (
                    <SwiperSlide key={story.id} style={{ width: '130px' }}>
                        <div className="relative group cursor-pointer h-[210px] rounded-[5px] overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-palette-red/20 active:scale-95">
                            {/* Media Background */}
                            <div className="absolute inset-0">
                                {story.mediaType === 'video' ? (
                                    <video
                                        src={story.mediaUrl}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={story.mediaUrl}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 "
                                        alt={story.title}
                                    />
                                )}
                                {/* Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                            </div>

                            {/* Story Info */}
                            <div className="absolute inset-x-0 bottom-0 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-[5px] bg-palette-red animate-pulse"></div>
                                    <span className="text-[9px] font-black text-white/70 uppercase tracking-widest truncate">
                                        {story.sourceName || 'Haber'}
                                    </span>
                                </div>
                                <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-palette-red transition-colors">
                                    {story.title}
                                </h3>
                            </div>

                            {/* Top Badge */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-[5px] border border-white/10">
                                {story.mediaType === 'video' ? (
                                    <Play size={10} className="text-white fill-white" />
                                ) : (
                                    <ImageIcon size={10} className="text-white" />
                                )}
                                <div className="flex items-center gap-1">
                                    <Eye size={10} className="text-white/70" />
                                    <span className="text-[9px] font-bold text-white">{(story.viewCount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default StoriesSection;
