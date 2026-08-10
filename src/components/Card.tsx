import type { PropsWithChildren } from 'react'
import styles from './Card.module.css'

interface CardProps extends PropsWithChildren {
  title?: string
  subtitle?: string
  className?: string
}

function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  )
}

export default Card