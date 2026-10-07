import styles from './ui.module.css';

export default function Input({
  label,
  id,
  icon,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`${styles.field} ${wrapperClassName}`.trim()}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          id={inputId}
          className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${className}`.trim()}
          {...props}
        />
      </div>
    </div>
  );
}
