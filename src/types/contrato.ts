export type ContratoEstado = 'Activo' | 'Inactivo'
export type TipoAjuste = 'IPC' | 'ICL'
export type PeriodicidadLabel = 'Trimestral' | 'Cuatrimestral' | 'Semestral'
export type TipoGarantia = 'GPremier' | 'Garantia Propietaria' | 'Garantes'

export interface Contrato {
  contrato_id: string
  propiedad: string
  fecha_inicio: string
  fecha_fin: string
  fechaFin: string
  importe_inicial: number
  deposito: number | null
  tipo_ajuste: TipoAjuste
  periodicidad: number
  estado: ContratoEstado
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
  periodicidad: number
  periodicidad_label: PeriodicidadLabel | number
  estado: ContratoEstado
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
  periodicidad: number
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