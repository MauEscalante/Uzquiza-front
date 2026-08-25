import type { PropsWithChildren, ReactNode } from 'react'
import styles from './Table.module.css'

/** Una columna de importes se marca acá y no en cada `<td>` de la página. */
export interface TableHeader {
  label: string
  money?: boolean
}

interface TableProps extends PropsWithChildren {
  headers: Array<string | TableHeader>
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
            {headers.map((header) => {
              const { label, money } = typeof header === 'string' ? { label: header, money: false } : header
              return (
                <th key={label} className={money ? styles.money : undefined} scope="col">
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
    </div>
  )
}

export default Table
