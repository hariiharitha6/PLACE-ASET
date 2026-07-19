'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLORS = {
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    accent: '#10b981',
    text: '#ecfdf5',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    accent: '#ef4444',
    text: '#fef2f2',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    accent: '#f59e0b',
    text: '#fffbeb',
  },
  info: {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    accent: '#6366f1',
    text: '#eef2ff',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type, duration, entering: true }]);

    // Mark entering state done
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, entering: false } : t))
      );
    }, 20);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const color = COLORS[t.type] || COLORS.info;
          const isVisible = !t.entering && !t.exiting;
          const isExiting = t.exiting;

          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: color.bg,
                border: `1px solid ${color.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                maxWidth: '380px',
                minWidth: '280px',
                pointerEvents: 'all',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isExiting
                  ? 'translateX(120%) scale(0.95)'
                  : isVisible
                  ? 'translateX(0) scale(1)'
                  : 'translateX(120%) scale(0.95)',
                opacity: isExiting ? 0 : isVisible ? 1 : 0,
              }}
              onClick={() => dismiss(t.id)}
              title="Click to dismiss"
            >
              {/* Icon */}
              <span style={{ fontSize: '18px', lineHeight: '1.4', flexShrink: 0 }}>
                {ICONS[t.type]}
              </span>

              {/* Message */}
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0,
                  fontSize: '13.5px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                }}>
                  {t.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '16px',
                  lineHeight: '1',
                  flexShrink: 0,
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
                aria-label="Dismiss notification"
              >
                ×
              </button>

              {/* Progress bar */}
              {t.duration > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    width: '100%',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    background: color.border,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: color.accent,
                      animation: `toastProgress ${t.duration}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
