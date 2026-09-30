/**
 * Qué le toca al contrato este mes.
 *
 * 'Ajuste' cuando le cierra el período. 'Re Ajuste' cuando el mes pasado ajustó con
 * un índice de IPC repetido —el del último mes del período todavía no estaba
 * publicado— y ahora se rehace el mismo cálculo con el índice real.
 */
export type AjusteTipo = 'Ajuste' | 'Re Ajuste'

/** Contrato al que le toca ajuste en el período, tal como lo lista el backend. */
export interface AjustePendiente {
  contrato_id: string
  propiedad: number
  direccion: string
  tipo: AjusteTipo
  /** Los co-inquilinos vienen concatenados: la grilla es una fila por contrato. */
  inquilino: string | null
  fecha_inicio: string
  fecha_fin: string
  periodicidad: string | null
  tipo_ajuste: string | null
  /** El alquiler que rige hoy, del tramo vigente. Null si el contrato no tiene ninguno. */
  importe_vigente: number | null
  importe_vigente_desde: string | null
}

/** Resultado de apretar Ajustar. */
export interface AjusteAplicado {
  mes: number
  anio: number
  contratos_pendientes: number
  /**
   * Menos que los pendientes cuando alguno ya tenía el tramo del período: el
   * ajuste es idempotente y no vuelve a aumentar.
   */
  contratos_ajustados: number
  reajustes_pendientes: number
  /** Menos que los pendientes si a alguno todavía le falta el índice que esperaba. */
  contratos_reajustados: number
}

/** Un tramo de alquiler. El historial del contrato es la lista de todos. */
export interface TramoHistorial {
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
  /** Se calculó con un índice repetido; el mes siguiente se rehizo. */
  provisorio: boolean
}
