import styles from './ui.module.css';

export default function Progress({
  value = 0,
  max = 100,
  label,
  showValue = false,
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className={styles.progressLabelRow}>
          {label && <span>{label}</span>}
          {showValue && <span>{pct}%</span>}
        </div>
      )}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
