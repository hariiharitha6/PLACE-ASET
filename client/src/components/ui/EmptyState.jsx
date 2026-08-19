import React from 'react';
import Link from 'next/link';
import styles from './EmptyState.module.css';

export default function EmptyState({
  icon,
  title = 'No records available',
  description = 'There is currently no data to display for this section.',
  actionText,
  actionHref,
  onAction,
  secondaryText,
  secondaryHref,
}) {
  return (
    <div className={styles.emptyContainer} role="status">
      {icon && <div className={styles.iconBox}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {(actionText || secondaryText) && (
        <div className={styles.actions}>
          {actionText && (
            actionHref ? (
              <Link href={actionHref} className={styles.primaryBtn}>
                {actionText}
              </Link>
            ) : (
              <button onClick={onAction} className={styles.primaryBtn}>
                {actionText}
              </button>
            )
          )}

          {secondaryText && secondaryHref && (
            <Link href={secondaryHref} className={styles.secondaryBtn}>
              {secondaryText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
