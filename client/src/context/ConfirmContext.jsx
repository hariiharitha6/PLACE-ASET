'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning', // 'warning' | 'danger' | 'info'
    showInput: false,
    inputPlaceholder: '',
    defaultValue: '',
  });
  
  const [inputValue, setInputValue] = useState('');
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    setInputValue(options.defaultValue || '');
    setModalState({
      isOpen: true,
      title: options.title || 'Are you sure?',
      message: options.message || 'This action cannot be undone.',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'warning',
      showInput: !!options.showInput,
      inputPlaceholder: options.inputPlaceholder || '',
      defaultValue: options.defaultValue || '',
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleCancel = () => {
    if (resolverRef.current) resolverRef.current(modalState.showInput ? null : false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(modalState.showInput ? inputValue : true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const typeColors = {
    warning: {
      accent: 'var(--accent-warning, #f59e0b)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
      accent: 'var(--accent-danger, #ef4444)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
    },
    info: {
      accent: 'var(--accent-primary, #6366f1)',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
  };

  const activeColors = typeColors[modalState.type] || typeColors.warning;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              background: 'var(--bg-secondary, #1e1e2e)',
              border: `1px solid var(--border-color, rgba(255, 255, 255, 0.08))`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
              transform: 'scale(0.95)',
              animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Title */}
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: activeColors.bg,
                  border: `1px solid ${activeColors.border}`,
                  color: activeColors.accent,
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {modalState.type === 'danger' ? '!' : modalState.type === 'warning' ? '⚠️' : 'i'}
              </span>
              {modalState.title}
            </h3>

            {/* Message Body */}
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: 'var(--text-secondary, #a0aec0)',
                lineHeight: '1.6',
              }}
            >
              {modalState.message}
            </p>

            {modalState.showInput && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={modalState.inputPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    color: 'var(--text-primary, #ffffff)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = activeColors.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))'; }}
                  autoFocus
                />
              </div>
            )}

            {/* Actions Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary, #ffffff)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              >
                {modalState.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: modalState.type === 'danger' ? 'var(--accent-danger, #ef4444)' : 'var(--accent-primary, #6366f1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
