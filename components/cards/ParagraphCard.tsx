
import React from 'react';
import { Quote } from 'lucide-react';
import { NewsItem } from '../../types';

interface ParagraphCardProps {
    data: NewsItem;
}

const ParagraphCard: React.FC<ParagraphCardProps> = ({ data }) => {
    const items = data.paragraphData?.items || [];
    const quoteAuthor = data.paragraphData?.quoteAuthor;

    return (
        <div className="mt-1 space-y-4">
            {/* SUBTITLE (SUMMARY) - Standard Card Style as Alt Başlık */}
            <div className="px-1 mb-2">
                <p className="text-palette-tan/60 text-[16px] font-medium leading-relaxed">
                    {data.summary}
                </p>
            </div>

            <div className="relative bg-palette-beige/20 rounded-[5px] border border-palette-beige/50 p-8 md:p-12 overflow-hidden shadow-sm group">
                {/* Background Decorative Quatation Mark */}
                <div className="absolute -top-4 -left-4 text-palette-red/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Quote size={200} />
                </div>

                {/* Content Section */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white p-4 rounded-full shadow-md border border-palette-beige/30 mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                        <Quote size={32} className="text-palette-red drop-shadow-sm" fill="currentColor" />
                    </div>

                    <div className="space-y-6 max-w-[90%] mx-auto">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="text-[22px] md:text-[26px] font-[800] text-palette-maroon/90 leading-snug tracking-tight italic flex flex-col items-center"
                                dangerouslySetInnerHTML={{ __html: item }}
                            />
                        ))}
                    </div>

                    {quoteAuthor && (
                        <div className="mt-10 flex items-center gap-3">
                            <div className="w-10 h-[2px] bg-palette-red/20 rounded-full" />
                            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-palette-tan/60">
                                {quoteAuthor}
                            </span>
                            <div className="w-10 h-[2px] bg-palette-red/20 rounded-full" />
                        </div>
                    )}
                </div>

                {/* Floating gradient effect */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-palette-red/5 rounded-full blur-[80px] pointer-events-none" />
            </div>
        </div>
    );
};

export default ParagraphCard;
