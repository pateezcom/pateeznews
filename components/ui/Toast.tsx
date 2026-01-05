
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
            setTimeout(onClose, 300); // Wait for exit animation
        }, 3000);

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

    const getColors = () => {
        switch (type) {
            case 'success': return 'border-emerald-500/20 bg-emerald-50 text-emerald-700';
            case 'error': return 'border-red-500/20 bg-red-50 text-red-700';
            case 'warning': return 'border-amber-500/20 bg-amber-50 text-amber-700';
            default: return 'border-blue-500/20 bg-blue-50 text-blue-700';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return 'text-emerald-500';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[999999] transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            <div className={`flex items-center gap-4 px-6 py-4 rounded-[5px] border shadow-2xl backdrop-blur-md ${getColors()} min-w-[320px]`}>
                <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center bg-white shadow-sm ${getIconColor()}`}>
                    <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>{getIcon()}</span>
                </div>
                <div className="flex-1">
                    <p className="text-[14px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">{type}</p>
                    <p className="text-[15px] font-bold tracking-tight">{message}</p>
                </div>
                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="w-8 h-8 flex items-center justify-center rounded-[5px] hover:bg-black/5 transition-colors opacity-40 hover:opacity-100"
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
                </button>
            </div>
            {/* Soft progress bar at the bottom */}
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-10 rounded-[5px] transition-all duration-[3000ms] ease-linear ${isVisible ? 'w-full' : 'w-0'}`} />
        </div>
    );
};

export default Toast;
