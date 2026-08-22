import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: 260,
                            padding: '12px 18px',
                            borderRadius: 8,
                            color: '#fff',
                            backgroundColor: toast.type === 'error' ? '#e50914' : toast.type === 'success' ? '#1db954' : '#333',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            fontSize: 14,
                            fontWeight: 500,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span>{toast.message}</span>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 10 }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};