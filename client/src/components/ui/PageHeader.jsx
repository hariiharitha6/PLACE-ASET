import React from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  children,
  breadcrumbs = []
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className={styles.crumbItem}>
                {idx > 0 && <span className={styles.separator}>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className={styles.crumbLink}>{crumb.label}</a>
                ) : (
                  <span className={styles.crumbActive}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {badge && (
          <div className={styles.badge}>
            {badgeIcon && <span className={styles.badgeIcon}>{badgeIcon}</span>}
            <span>{badge}</span>
          </div>
        )}

        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}
