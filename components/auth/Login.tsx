
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('demo.user@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    // Prevent scrolling when modal is open
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const navbar = document.querySelector('header');

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (navbar) {
        navbar.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (navbar) {
        navbar.style.paddingRight = '';
      }
    };
  }, [handleKeyDown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) onSuccess();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onSuccess();
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* 1. BACKDROP: Darker & Sharper focus */}
      <div
        className="absolute inset-0 bg-palette-tan/95 backdrop-blur-[2px] animate-backdrop-entry cursor-pointer"
        onClick={onClose}
      />

      {/* 2. MODAL CONTAINER: No Bottom Border, Clean Radius */}
      <div
        className="relative w-full max-w-[380px] bg-white rounded-[3px] shadow-2xl overflow-hidden animate-modal-entry flex flex-col transform-gpu ring-1 ring-white/10"
        style={{ willChange: 'transform, opacity' }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[3px] text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="p-8 pb-10">

          {/* Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-palette-red rounded-[3px] flex items-center justify-center shadow-xl shadow-palette-red/20 mb-4 transform -rotate-3">
              <span className="material-symbols-rounded text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <h2 className="text-2xl font-[900] text-gray-900 tracking-tighter font-display">
              Buzz<span className="text-palette-tan font-medium">Panel</span>
            </h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {isSignUp ? 'Hesap Oluştur' : 'Güvenli Giriş'}
            </p>
          </div>

          {/* Modern Segmented Control (Tabs) */}
          <div className="flex p-1.5 bg-gray-50 border border-gray-100 rounded-[3px] mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all duration-200 ${!isSignUp
                  ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all duration-200 ${isSignUp
                  ? 'bg-white text-palette-red shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Üye Ol
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold flex items-center gap-2 rounded-[3px] animate-in slide-in-from-top-1 fade-in duration-200">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border-2 border-transparent rounded-[3px] text-sm font-bold text-gray-900 focus:bg-white focus:border-palette-tan/20 outline-none transition-all placeholder:text-gray-400"
                  placeholder="E-Posta Adresi"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 bg-gray-50 border-2 border-transparent rounded-[3px] text-sm font-bold text-gray-900 focus:bg-white focus:border-palette-tan/20 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Şifre"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-palette-red transition-colors">Şifremi Unuttum?</button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 bg-gray-900 text-white rounded-[3px] font-black text-xs uppercase tracking-[0.15em] hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-900/20"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  <span>{isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
                  {!loading && <ArrowRight size={16} strokeWidth={3} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed px-4">
              Devam ederek <span className="text-gray-900 font-bold cursor-pointer hover:underline">Hizmet Şartları</span>'nı kabul etmiş sayılırsınız.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
