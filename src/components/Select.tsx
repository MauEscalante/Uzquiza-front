import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ label: string; value: string }>
}

function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className={styles.field} htmlFor={selectId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select id={selectId} className={[styles.select, className].filter(Boolean).join(' ')} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}

export default Select