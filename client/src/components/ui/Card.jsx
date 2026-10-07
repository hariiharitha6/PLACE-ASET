import styles from './ui.module.css';

export default function Card({
  children,
  className = '',
  padding = true,
  flat = false,
  as: Tag = 'div',
  ...props
}) {
  const cls = [
    styles.card,
    padding ? styles.cardPadding : '',
    flat ? styles.cardFlat : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
