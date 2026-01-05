
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-palette-beige flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-palette-red rounded-[5px] flex items-center justify-center text-white shadow-xl mb-6">
                        <span className="material-symbols-rounded text-3xl font-bold">error</span>
                    </div>
                    <h1 className="text-2xl font-bold text-palette-tan mb-4">Bir şeyler yanlış gitti</h1>
                    <p className="text-palette-tan/60 mb-8 max-w-md">Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-palette-red text-white rounded-[5px] font-bold hover:bg-red-700 transition-colors"
                    >
                        Sayfayı Yenile
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 p-4 bg-black/5 rounded-[5px] text-left text-xs overflow-auto max-w-full">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
