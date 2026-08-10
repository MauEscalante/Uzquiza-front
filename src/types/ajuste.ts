export type AjusteEstado = 'Ajuste próximo' | 'Ajuste pendiente' | 'Ajuste realizado'

export interface AjusteHistorialItem {
  fecha: string
  detalle: string
}

export interface Ajuste {
  id: string
  contrato: string
  propiedad: string
  inquilino: string
  importeActual: number
  tipoAjuste: string
  periodicidad: string
  fechaProximoAjuste: string
  nuevoImporte: number
  estado: AjusteEstado
  historial: AjusteHistorialItem[]
}