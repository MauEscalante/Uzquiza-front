import styles from './StatusBadge.module.css'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  variant: BadgeVariant
  children: string
}

function StatusBadge({ variant, children }: StatusBadgeProps) {
  return <span className={[styles.badge, styles[variant]].join(' ')}>{children}</span>
}

export default StatusBadge