import type { TextareaHTMLAttributes } from 'react'
// Comparte la chapa de Input: mismo rótulo, mismo relleno y el mismo foco.
import styles from './Input.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <label className={styles.field} htmlFor={textareaId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea id={textareaId} className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}

export default Textarea
