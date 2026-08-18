export type ContratoEstado = 'Activo' | 'Inactivo'
export type TipoAjuste = 'IPC' | 'ICL'

export interface Contrato {
  contrato_id: string
  propiedad: string
  fecha_inicio: string
  fecha_fin: string
  fechaFin: string
  importe_inicial: number
  tipo_ajuste: TipoAjuste
  periodicidad: number
  estado: ContratoEstado
}

export type ContratoFormValues = Omit<Contrato, 'id'>

export interface InquilinoFormValue {
  nombreCompleto: string
  nacionalidad: string
  dni: string
  cuil: string
  domicilioLegal: string
  domicilioElectronico: string
}

export const emptyInquilino: InquilinoFormValue = {
  nombreCompleto: '',
  nacionalidad: '',
  dni: '',
  cuil: '',
  domicilioLegal: '',
  domicilioElectronico: '',
}