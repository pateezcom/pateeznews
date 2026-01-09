
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

const MainLoading: React.FC = () => {
    const { currentLang } = useLanguage();

    // Performance Cache Engine
    const getImmediateCache = () => {
        try {
            const langCode = localStorage.getItem('pateez_lang') || 'tr';
            const cacheKey = `pateez_v2025_settings_${langCode}_default`;
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached).data : null;
        } catch (e) { return null; }
    };

    const [settings, setSettings] = useState<SiteSettings | null>(getImmediateCache);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('language_code', currentLang.code)
                    .maybeSingle();

                if (!error && data) {
                    setSettings(data);
                    if (data.home_title || data.site_name) {
                        document.title = data.home_title || data.site_name;
                    }
                }
            } catch (e) {
                console.error("MainLoading error:", e);
            }
        };

        fetchSettings();
    }, [currentLang.code]);

    const logoUrl = settings?.logo_url;
    const siteName = settings?.site_name || '';

    return (
        <div className="fixed inset-0 z-[1000] bg-[#fcfcfb] flex flex-col items-center justify-center">
            {/* High-End Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-palette-red/[0.01] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-[#182540]/[0.01] rounded-full blur-[120px]"></div>
            </div>

            <div className="relative flex flex-col items-center w-full max-w-[220px]">

                {/* 🎯 LOGO AREA - Optimized for high-definition clarity */}
                <div className="h-16 flex items-center justify-center mb-10 overflow-visible">
                    {logoUrl ? (
                        <div className="animate-reveal-instant">
                            <img
                                src={logoUrl}
                                alt={siteName}
                                className="h-10 md:h-11 w-auto object-contain transition-all duration-300"
                                style={{
                                    imageRendering: 'auto', // Browser handles antialiasing for smoothness
                                    transform: 'translateZ(0) scale(1.0)',
                                    backfaceVisibility: 'hidden',
                                    WebkitFontSmoothing: 'antialiased',
                                    // Remove sharp rendering filters that cause "jagged" (kırık) edges
                                }}
                            />
                        </div>
                    ) : settings ? (
                        <div className="animate-reveal-instant">
                            <span className="text-xl font-[900] tracking-tighter text-[#182540] uppercase">
                                {siteName}
                            </span>
                        </div>
                    ) : (
                        <div className="h-10" />
                    )}
                </div>

                {/* Micro Loader */}
                <div className="w-full space-y-5">
                    <div className="w-full h-[1.5px] bg-[#182540]/[0.02] relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-palette-red/30 w-full animate-fast-shimmer"></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes reveal-instant {
                    0% { opacity: 0; transform: translateY(2px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fast-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-reveal-instant {
                    animation: reveal-instant 0.5s ease-out forwards;
                }
                .animate-fast-shimmer {
                    animation: fast-shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default MainLoading;
