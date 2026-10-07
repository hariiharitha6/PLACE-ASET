'use client';

import styles from './ui.module.css';

export default function Tabs({ items = [], value, onChange, className = '', ariaLabel = 'Tabs' }) {
  return (
    <div className={`${styles.tabs} ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.tabActive : ''}`.trim()}
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
