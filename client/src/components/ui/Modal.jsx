'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ui.module.css';

export default function Modal({
  open,
  onClose,
  title,
  children,
  ariaLabel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={styles.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
      >
        <div className={styles.modalHeader}>
          {title && <h2 className={styles.modalTitle}>{title}</h2>}
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
