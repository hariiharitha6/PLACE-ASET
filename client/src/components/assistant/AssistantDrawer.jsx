'use client';

import React, { useEffect } from 'react';
import { useAssistant } from '../../context/AssistantContext';
import PlaceAssistant from './PlaceAssistant';

export default function AssistantDrawer() {
  const { isOpen, closeAssistant } = useAssistant();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAssistant]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={closeAssistant}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 450,
          transition: 'opacity var(--transition-fast)',
        }}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: '460px',
          zIndex: 460,
          boxShadow: 'var(--shadow-lg)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="PLACE Assistant Panel"
      >
        <PlaceAssistant isDrawer={true} onClose={closeAssistant} />

        <style jsx global>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
}
