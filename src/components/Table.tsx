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

interface ClickableRowProps extends PropsWithChildren {
  /** Se dispara con click y con Enter/Espacio. */
  onSelect: () => void
  /** Tooltip y pista de qué abre la fila. */
  label?: string
}

/** Fila cuyo click abre el detalle del registro.
 *
 * Las acciones que viven dentro de la fila tienen que cortar la propagación del
 * click, si no abren además el detalle.
 */
export function ClickableRow({ onSelect, label, children }: ClickableRowProps) {
  return (
    <tr
      className={styles.clickableRow}
      tabIndex={0}
      title={label}
      onClick={onSelect}
      onKeyDown={(event) => {
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