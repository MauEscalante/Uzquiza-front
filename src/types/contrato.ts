export type ContratoEstado = 'Activo' | 'Inactivo' | 'Rescindido'
export type TipoAjuste = 'IPC' | 'ICL'
export type PeriodicidadLabel = 'Trimestral' | 'Cuatrimestral' | 'Semestral'
export type TipoGarantia = 'GPremier' | 'Garantia Propietaria' | 'Garantes'

export interface Contrato {
  contrato_id: string
  propiedad: number
  fecha_inicio: string
  fecha_fin: string
  fechaFin: string
  importe_inicial: number
  deposito: number | null
  tipo_ajuste: TipoAjuste
  periodicidad: PeriodicidadLabel
  estado: ContratoEstado
  fecha_rescision: string | null
  fecha_entrega_llaves: string | null
  penalidad: number | null
}

export interface ContratoPropietario {
  cliente_num: number
  nombre: string
  apellido: string
  porcentaje: number
}

export interface ContratoInquilino {
  cliente_num: number
  nombre: string
  apellido: string
  dni: string
}

export interface ContratoGarante {
  garante_id: number
  nombre: string
  apellido: string
  telefono: string
  dni: string | null
  sueldo: number | null
  email: string | null
}

export interface ContratoDetalle {
  contrato_id: string
  propiedad: {
    propiedad_id: number
    direccion: string
  }
  propietarios: ContratoPropietario[]
  inquilinos: ContratoInquilino[]
  garantia: TipoGarantia
  direccion_garantia: string | null
  garantes: ContratoGarante[]
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
  deposito: number | null
  tipo_ajuste: TipoAjuste
  periodicidad: PeriodicidadLabel
  estado: ContratoEstado
  fecha_rescision: string | null
  fecha_entrega_llaves: string | null
  penalidad: number | null
}

export interface ContratoInquilinoInput {
  nombre: string
  apellido: string
  telefono: string
  dni: string
  cuil: string
  nacionalidad: string
  direccion: string
  email: string
}

export interface GaranteInput {
  nombre: string
  apellido: string
  telefono: string
  dni?: string
  sueldo?: number | null
  email?: string
}

export interface ContratoFormValues {
  propiedad: number
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
  deposito: number | null
  tipo_ajuste: TipoAjuste
  periodicidad: PeriodicidadLabel
  estado: ContratoEstado
  inquilinos: ContratoInquilinoInput[]
  garantia: TipoGarantia
  direccion_garantia: string | null
  garantes: GaranteInput[]
}

export interface InquilinoFormValue {
  nombre: string
  apellido: string
  telefono: string
  nacionalidad: string
  dni: string
  cuil: string
  domicilioLegal: string
  domicilioElectronico: string
}

export interface GarantePropietarioFormValue {
  nombre: string
  apellido: string
  dni: string
  telefono: string
}

export const emptyGarantePropietario: GarantePropietarioFormValue = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
}

export const emptyInquilino: InquilinoFormValue = {
  nombre: '',
  apellido: '',
  telefono: '',
  nacionalidad: '',
  dni: '',
  cuil: '',
  domicilioLegal: '',
  domicilioElectronico: '',
}

/**
 * Lo que cuesta rescindir.
 *
 * Sale igual del preview, del aviso y del cierre por entrega de llaves. En los dos
 * primeros la penalidad puede ser una estimación (ver `importe_estimado`); en el
 * cierre es el número que quedó guardado.
 */
export interface RescisionCalculo {
  contrato_id: string
  direccion: string
  /** El plazo pactado, que la rescisión no pisa: contra esto se contaron los meses. */
  fecha_fin_original: string
  /** Siempre el último día del mes elegido: el día de salida es indistinto. */
  fecha_salida: string
  meses_restantes: number
  /** False cuando el contrato llega a término: no hay penalidad que cobrar. */
  anticipada: boolean
  importe_vigente: number
  /** Inicio del tramo del que salió el importe. */
  importe_vigente_desde: string
  /**
   * True cuando ese tramo no cubre el mes de salida: el ajuste del mes no se cargó
   * y el importe es el último conocido, así que la penalidad es una estimación.
   */
  importe_estimado: boolean
  porcentaje_penalidad: number
  penalidad: number
}
