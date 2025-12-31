
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { StoryItem } from '../types';
import { Zap, Clock, Eye, ChevronLeft, Play, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StoriesSectionProps {
    onBack: () => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveStories();
    }, []);

    const fetchActiveStories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedStories: StoryItem[] = (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                mediaUrl: item.media_url,
                mediaType: item.media_type,
                sourceName: item.source_name,
                publisherId: item.publisher_id,
                createdAt: item.created_at,
                expiresAt: item.expires_at,
                isActive: item.is_active,
                viewCount: item.view_count || 0
            }));

            setStories(mappedStories);
        } catch (err) {
            console.error("Stories fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-palette-beige border-t-palette-red rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em]">{t('feed.status.loading') || 'Yükleniyor...'}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-palette-beige flex items-center justify-center text-palette-tan hover:text-palette-red hover:border-palette-red transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-palette-maroon tracking-tighter leading-none mb-1">
                            Buzz <span className="text-palette-red">Hikayeler</span>
                        </h2>
                        <p className="text-[10px] font-bold text-palette-tan/50 uppercase tracking-widest">Günün en önemli gelişmeleri 24 saatliğine burada.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stories.map((story) => (
                    <div
                        key={story.id}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-palette-beige/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-palette-beige/50"
                    >
                        {/* Background Media */}
                        <div className="absolute inset-0">
                            {story.mediaType === 'video' ? (
                                <video
                                    src={story.mediaUrl}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={story.mediaUrl}
                                    alt={story.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            )}
                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                        </div>

                        {/* Story Info */}
                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-palette-red animate-pulse"></div>
                                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest truncate">
                                    {story.sourceName || 'Buzz Haber'}
                                </span>
                            </div>
                            <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-palette-red transition-colors">
                                {story.title}
                            </h3>
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
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
                ))}

                {stories.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-palette-beige">
                        <Zap size={40} className="mx-auto mb-4 text-palette-tan/20" />
                        <p className="text-[11px] font-black text-palette-tan/40 uppercase tracking-[0.2em]">{t('feed.empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoriesSection;
