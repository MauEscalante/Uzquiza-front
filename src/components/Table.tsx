import type { PropsWithChildren } from 'react'
import styles from './Table.module.css'

interface TableProps extends PropsWithChildren {
  headers: string[]
  className?: string
}

function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export default Table