'use client';

import Link from 'next/link';
import styles from './ui.module.css';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  fullWidth = false,
  children,
  ...props
}) {
  const variantClass = VARIANTS.includes(variant) ? styles[variant] : styles.primary;
  const sizeClass = size === 'sm' ? styles.btnSm : size === 'lg' ? styles.btnLg : '';
  const cls = [styles.btn, variantClass, sizeClass, fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
