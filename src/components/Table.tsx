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

interface ClickableRowProps extends PropsWithChildren {
  /** Se dispara con click y con Enter/Espacio. */
  onSelect: () => void
  /** Tooltip y pista de qué abre la fila. */
  label?: string
  className?: string
}

/** Fila cuyo click abre el detalle del registro.
 *
 * Las acciones que viven dentro de la fila tienen que cortar la propagación del
 * click, si no abren además el detalle. El teclado ya está cubierto acá: el
 * Enter/Espacio que sale de un control hijo no dispara `onSelect`.
 */
export function ClickableRow({ onSelect, label, className = '', children }: ClickableRowProps) {
  return (
    <tr
      className={[styles.clickableRow, className].filter(Boolean).join(' ')}
      tabIndex={0}
      title={label}
      onClick={onSelect}
      onKeyDown={(event) => {
        // Enter/Espacio sobre un botón de la fila lo activa a él, no al detalle.
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      {children}
    </tr>
  )
}

export default Table
