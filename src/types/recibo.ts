/** Fila del historial de ingresos por mes (IngresoMensual en el back). */
export interface Recibo {
  id: string
  mes: string
  anio: string
  total: number
}

export interface ReciboFormValues {
  mes: string
  anio: string
}

/** Contrato al que le toca ajuste en el período pedido. */
export interface ContratoAAjustar {
  contrato_id: string
  propiedad: number
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
  periodicidad: string | null
  tipo_ajuste: string | null
}

export type AjusteEstado = 'pendiente' | 'en_proceso' | 'completado' | 'fallido'

/** Trabajo de ajuste de recibos y en qué estado está. */
export interface AjusteRead {
  ajuste_id: number
  mes: number
  anio: number
  estado: AjusteEstado
  contratos_ajustados: number | null
  propiedades_marcadas_adeuda: number | null
  error: string | null
  creado_en: string
  finalizado_en: string | null
}
