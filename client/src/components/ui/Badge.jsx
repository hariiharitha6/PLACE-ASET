import styles from './ui.module.css';

const VARIANT_MAP = {
  default: styles.badgeDefault,
  primary: styles.badgePrimary,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
};

export default function Badge({ variant = 'default', className = '', children }) {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.default;
  return (
    <span className={`${styles.badge} ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
