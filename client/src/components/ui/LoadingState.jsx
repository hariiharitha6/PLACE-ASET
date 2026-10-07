import styles from './ui.module.css';

export default function LoadingState({ message = 'Loading…', minHeight }) {
  return (
    <div
      className={styles.loadingWrap}
      role="status"
      aria-live="polite"
      style={minHeight ? { minHeight } : undefined}
    >
      <div className={styles.spinner} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
