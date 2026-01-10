
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NavigationItem, SiteSettings } from '../types';

interface NavbarProps {
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  isLoggedIn?: boolean;
  navItems?: NavigationItem[];
  siteSettings?: SiteSettings | null;
}

const Navbar: React.FC<NavbarProps> = ({ onHomeClick, onProfileClick, isLoggedIn, navItems = [], siteSettings }) => {
  const { currentLang, availableLanguages, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const headerItems = React.useMemo(() =>
    navItems.filter(item => item.type === 'header'),
    [navItems]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLangMenu]);

  return (
    <header className="fixed top-0 left-0 w-full z-[100]">
      <div className="h-[64px] bg-white/80 backdrop-blur-2xl border-b border-palette-beige/20 shadow-sm relative z-[101]">
        <div className="max-w-[1280px] mx-auto h-full flex items-center px-4">

	          {/* LOGO */}
	          <div
	            onClick={onHomeClick}
	            className="flex items-center gap-3 cursor-pointer group select-none z-20 flex-shrink-0 lg:w-[260px] pl-5"
	          >
	            {siteSettings?.logo_url ? (
	              <div className="h-[42px] transition-opacity duration-200 group-hover:opacity-95">
	                <img
	                  src={siteSettings.logo_url}
	                  alt={siteSettings?.site_name || "Site Logo"}
	                  className="h-full w-auto object-contain select-none"
	                />
	              </div>
	            ) : (
	              <div className="w-[42px] h-[42px] bg-palette-red rounded-[5px] flex items-center justify-center shadow-lg shadow-palette-red/10 group-hover:scale-105 transition-all duration-500">
	                <span className="material-symbols-rounded text-white" style={{ fontSize: '26px', fontVariationSettings: "'FILL' 1, 'wght' 600" }}>bolt</span>
	              </div>
	            )}
            {!siteSettings?.logo_url && (
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none font-display">
                  {siteSettings?.site_name ? (
                    <>
                      {siteSettings.site_name.split(' ')[0].toUpperCase()}
                      {siteSettings.site_name.split(' ').slice(1).length > 0 && (
                        <span className="text-palette-tan font-medium">
                          {siteSettings.site_name.split(' ').slice(1).join(' ').toUpperCase()}
                        </span>
                      )}
                    </>
                  ) : (
                    <>PATEEZ<span className="text-palette-tan font-medium">NEWS</span></>
                  )}
                </h1>
              </div>
            )}
          </div>

          {/* NAV */}
          <nav className="hidden lg:flex items-center gap-8 h-full px-10 flex-1">
            <button
              onClick={onHomeClick}
              className="relative h-full flex items-center gap-2.5 px-1 text-[12px] font-bold tracking-widest transition-all group text-palette-red"
            >
              <span className="material-symbols-rounded transition-all duration-500 scale-110"
                style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                home
              </span>
              <span>{t('nav.home')}</span>
            </button>

            {headerItems.map((item) => (
              <button
                key={item.id}
                className="relative h-full flex items-center gap-2.5 px-1 text-[12px] font-bold tracking-widest transition-all group text-palette-tan/60 hover:text-palette-red"
              >
                {item.icon && (
                  <span className="material-symbols-rounded transition-all duration-500 group-hover:-translate-y-0.5 opacity-60 group-hover:opacity-100"
                    style={{ fontSize: '22px', fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                    {item.icon.toLowerCase()}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto z-20">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-colors duration-100 ${isSearchOpen
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-palette-tan hover:bg-palette-beige/10'
                }`}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '22px', fontVariationSettings: isSearchOpen ? "'FILL' 1" : "'FILL' 0" }}>
                {isSearchOpen ? 'close' : 'search'}
              </span>
            </button>

            <div className="relative" ref={langMenuRef}>
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="h-10 flex items-center gap-0.5 px-2 rounded-[5px] text-palette-tan hover:bg-palette-beige/10 transition-colors font-bold text-[10px] uppercase">
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>public</span>
                <span className={`material-symbols-rounded transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} style={{ fontSize: '16px' }}>expand_more</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-[5px] shadow-2xl border border-palette-beige/10 py-1 overflow-hidden animate-in">
                  {availableLanguages.map((lang) => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold transition-all ${currentLang.code === lang.code ? 'bg-palette-beige/10 text-palette-red' : 'text-palette-tan hover:bg-palette-beige/5'}`}>
                      <span className="uppercase">{lang.code}</span>
                      <span className="opacity-60">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onProfileClick}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-[5px] transition-all duration-200 group/profile active:scale-95 ${isLoggedIn
                ? 'bg-palette-beige/5 border border-palette-beige/20 hover:border-palette-tan/30'
                : 'hover:bg-palette-beige/10'
                }`}
            >
              <div className={`flex items-center justify-center transition-all duration-300 ${isLoggedIn
                ? 'w-7 h-7 rounded-[5px] border border-palette-tan/20 overflow-hidden shadow-sm'
                : 'w-6 h-6'
                }`}>
                {isLoggedIn ? (
                  <img src="https://picsum.photos/seed/admin/200" className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1, 'wght' 600" }}>login</span>
                )}
              </div>
              {!isLoggedIn && (
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight group-hover/profile:text-black transition-colors">
                  {t('nav.login')}
                </span>
              )}
            </button>

            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[5px] bg-palette-beige/10 text-gray-900 ml-1">
              <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div
        className={`absolute top-[64px] left-0 w-full bg-white border-b border-palette-beige shadow-2xl transition-all duration-75 ease-linear overflow-hidden z-[100] ${isSearchOpen ? 'max-h-[80px] opacity-100 py-3.5' : 'max-h-0 opacity-0 py-0'
          }`}
      >
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center z-10">
              <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '22px' }}>
                search
              </span>
            </div>
            <input
              type="text"
              autoFocus={isSearchOpen}
              placeholder={t('nav.search')}
              className="w-full h-11 bg-palette-beige/10 rounded-[5px] border border-palette-beige focus:border-palette-tan/30 text-sm font-bold text-gray-900 placeholder:text-palette-tan/20 outline-none pl-11 pr-11 transition-none"
            />
            <div className="absolute right-3.5 flex items-center gap-2 z-10">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-palette-tan/30 hover:text-palette-red"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-gray-900/5 backdrop-blur-[1px] z-[99]"
        />
      )}
    </header>
  );
};

export default Navbar;
