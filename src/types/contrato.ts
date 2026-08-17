export type ContratoEstado = 'Activo' | 'Próximo a vencer' | 'Finalizado'

export interface Contrato {
  id: string
  propiedad: string
  inquilino: string
  fechaInicio: string
  fechaFin: string
  importeActual: number
  tipoAjuste: string
  periodicidad: string
  estado: ContratoEstado
}

export type ContratoFormValues = Omit<Contrato, 'id'>