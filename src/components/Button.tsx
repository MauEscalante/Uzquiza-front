import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

function Button({ children, variant = 'primary', fullWidth = false, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={[styles.button, styles[variant], fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button