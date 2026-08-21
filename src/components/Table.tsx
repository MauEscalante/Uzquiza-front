import type { PropsWithChildren, ReactNode } from 'react'
import styles from './Table.module.css'

interface TableProps extends PropsWithChildren {
  headers: string[]
  /** Fila(s) de cierre, por ejemplo los totales de una columna. */
  footer?: ReactNode
  className?: string
}

function Table({ headers, children, footer, className = '' }: TableProps) {
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
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
    </div>
  )
}

export default Table