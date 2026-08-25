import styles from './Table.module.css'

/**
 * Clases del sistema de tablas que las páginas necesitan para sus celdas
 * y filas. Viven acá y no en `Table.tsx` porque un archivo que exporta un
 * componente no puede exportar además constantes sin romper fast refresh.
 */
export const cell = {
  /** Importes: mono, tabulares, alineados a la derecha. */
  money: styles.money,
  /** Fechas e identificadores. */
  dato: styles.dato,
  /** Filo naranja: requiere acción (vence, falta ajuste, hay saldo). */
  filoAccion: styles.filoAccion,
  /** Filo azul: en regla. */
  filoRegla: styles.filoRegla,
  /** Filo rojo: vencido o rechazado. */
  filoAlerta: styles.filoAlerta,
}
