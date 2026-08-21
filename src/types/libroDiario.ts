export type TipoMovimiento = 'INGRESO' | 'DEPOSITO' | 'EGRESO' | 'RETIRO'
export type CuentaTransferencia = 'Kike' | 'Dai'

export interface MovimientoDiario {
  movimiento_id: number
  fecha: string
  /** Texto que se muestra en "A qué corresponde". Se arma al guardar y no cambia después. */
  concepto: string
  /** Solo los ingresos y depósitos apuntan a una propiedad. */
  propiedad_id: number | null
  /** Dirección actual de la propiedad; puede diferir del concepto si se editó después. */
  direccion: string | null
  piso: string | null
  depto: string | null
  monto: number
  tipo: TipoMovimiento
  /** A qué cuenta se transfirió. Siempre presente en los depósitos. */
  cuenta: CuentaTransferencia | null
}

export interface ResumenCaja {
  /** Cobrado en efectivo: lo único que entra a la caja. */
  total_efectivo: number
  /** Cobrado por transferencia. Va a una cuenta, no pasa por la caja. */
  total_transferencias: number
  total_egresos: number
  total_retiros: number
  /** efectivo - egresos - retiros: la plata que queda en la caja. */
  total_caja: number
}

/** Estado del formulario: todo string, se convierte al enviar. */
export interface MovimientoFormValues {
  fecha: string
  tipo: TipoMovimiento
  propiedadId: string
  concepto: string
  monto: string
  cuenta: string
}

/**
 * Fecha de hoy en horario local, formato YYYY-MM-DD.
 *
 * No sirve `toISOString()`: es UTC, y en Argentina (UTC-3) a partir de las 21:00
 * devolvería la fecha de mañana. Como la fecha ya no se puede corregir a mano,
 * ese desfasaje quedaría guardado sin que nadie lo note.
 */
export function hoy() {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

export function crearMovimientoVacio(tipo: TipoMovimiento): MovimientoFormValues {
  return {
    fecha: hoy(),
    tipo,
    propiedadId: '',
    concepto: '',
    monto: '',
    cuenta: '',
  }
}
