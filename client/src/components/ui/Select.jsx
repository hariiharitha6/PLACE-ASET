import styles from './ui.module.css';

export default function Select({ label, id, className = '', children, ...props }) {
  const selectId = id || props.name;

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${styles.select} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
