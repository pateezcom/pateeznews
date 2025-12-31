
import React from 'react';

const MainLoading: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[1000] bg-palette-beige flex flex-col items-center justify-center">
            {/* 2025 Premium Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-palette-red/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-palette-tan/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative scale-150 mb-12">
                    <div className="w-16 h-16 bg-palette-red rounded-2xl flex items-center justify-center shadow-2xl shadow-palette-red/30 animate-bounce-subtle">
                        <span className="material-symbols-rounded text-white" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1, 'wght' 600" }}>bolt</span>
                    </div>
                </div>

                {/* Text Branding */}
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tighter text-gray-900 flex items-center gap-0.5">
                        BUZZ<span className="text-palette-tan/40 font-bold">HABER</span>
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-palette-red rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.3em] font-display">BAĞLANILIYOR</span>
                    </div>
                </div>

                {/* Performance Optimized Loading Bar */}
                <div className="mt-12 w-48 h-[3px] bg-palette-tan/5 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-palette-red to-transparent w-full animate-shimmer"></div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-12 flex flex-col items-center gap-1">
                <span className="text-[9px] font-black text-palette-tan/20 uppercase tracking-[0.2em]">2025 Buzz Media Group</span>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default MainLoading;
