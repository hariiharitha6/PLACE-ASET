import React from 'react';
import Link from 'next/link';
import styles from './PageHeader.module.css';

export default function PageHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  children,
  breadcrumbs = [],
  nextAction,
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
                  <Link href={crumb.href} className={styles.crumbLink}>{crumb.label}</Link>
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

        {nextAction && (
          <div className={styles.nextAction}>
            <span className={styles.nextActionLabel}>Recommended Next Step</span>
            {nextAction.description && (
              <span className={styles.nextActionDesc}>{nextAction.description}</span>
            )}
            {nextAction.href && nextAction.text && (
              <Link href={nextAction.href} className={styles.nextActionLink}>
                {nextAction.text} &rarr;
              </Link>
            )}
          </div>
        )}
      </div>

      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}
