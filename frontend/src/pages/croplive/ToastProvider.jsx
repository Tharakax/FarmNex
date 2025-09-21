import React, { createContext, useContext, useCallback, useState } from 'react';

const ToastContext = createContext(null);

const variantClasses = {
  created: 'bg-green-600 text-white',
  updated: 'bg-yellow-300 text-black',
  deleted: 'bg-red-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Top-center toast container: spans full width up to small breakpoint and centers toasts */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-screen-sm px-4 pointer-events-none"
      >
        <div className="flex flex-col items-center gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="alert"
              className={`w-full max-w-md pointer-events-auto px-5 py-3 rounded-xl shadow-xl flex justify-between items-center text-sm ${variantClasses[t.variant] || variantClasses.info}`}
            >
              <div className="flex-1 text-center">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="ml-3 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
