
import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
        }, 3500);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    return (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[999999] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}>
            <div className={`flex items-center gap-5 px-8 py-5 rounded-[5px] border border-palette-tan/20 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(24,37,64,0.15)] min-w-[360px] max-w-md overflow-hidden relative group`}>
                {/* Accent line on left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-palette-red' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                <div className={`w-12 h-12 rounded-[5px] flex items-center justify-center bg-palette-beige/20 shadow-inner ${type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-palette-red' : type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                    <span className="material-symbols-rounded" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>{getIcon()}</span>
                </div>

                <div className="flex-1 space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none">{type}</p>
                    <p className="text-[15px] font-bold text-palette-maroon tracking-tight leading-snug">{message}</p>
                </div>

                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 500); }}
                    className="w-10 h-10 flex items-center justify-center rounded-[5px] hover:bg-palette-red/5 text-palette-tan/40 hover:text-palette-red transition-all active:scale-90"
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>close</span>
                </button>

                {/* Animated progress bar at bottom */}
                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-palette-beige/10">
                    <div
                        className={`h-full transition-all duration-[3000ms] ease-linear rounded-r-full ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-palette-red' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: isVisible ? '100%' : '0%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Toast;
