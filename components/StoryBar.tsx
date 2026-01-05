import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const StoryBar: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setStories(data);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
      }
    };
    fetchStories();
  }, []);

  if (stories.length === 0) return null;

  return (
    <div className="w-full pb-1 pt-2">
      {/* Scroll Container */}
      <div className="flex gap-2 overflow-x-auto px-1 pb-4 no-scrollbar items-start">

        {/* Story Item */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="group relative flex-shrink-0 w-[120px] h-[200px] rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
          >
            {/* Arka plan gölgesi - Glow Effect */}
            <div className="absolute inset-2 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main Card Container */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 bg-gray-900 transition-all duration-300 z-10">

              {/* Image */}
              <img
                src={story.media_url || story.image}
                alt={story.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-60" />

              {/* Top Badge: Source Avatar */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <div className="relative w-8 h-8 p-[1.5px] rounded-xl bg-gradient-to-tr from-blue-400 to-purple-500 shadow-lg">
                  <div className="w-full h-full rounded-[10px] overflow-hidden border border-black/20">
                    <img
                      src={`https://picsum.photos/seed/src${story.id}/100`}
                      alt="Source"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 w-full p-3.5 pt-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* Kategori Tag */}
                <div className="flex items-center gap-1 mb-1.5 opacity-80">
                  <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">{story.source_name || story.source || 'Buzz'}</span>
                </div>

                {/* Title */}
                <p className="text-[11px] font-bold text-white leading-snug line-clamp-3 drop-shadow-sm group-hover:text-blue-50 transition-colors">
                  {story.title}
                </p>
              </div>

              {/* Active Border Indicator (On Hover) */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-300 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryBar;