export type AjusteTipo = 'Ajuste' | 'Re Ajuste'

export type AjusteEstado = 'Ajuste próximo' | 'Ajuste pendiente' | 'Ajuste realizado'

export interface AjusteHistorialItem {
  fecha: string
  detalle: string
}

export interface Ajuste {
  id: string
  propiedad: string
  inquilino: string
  importeAnterior: number
  tipoAjuste: string
  periodicidad: string
  fechaProximoAjuste: string
  nuevoImporte: number
  estado: AjusteEstado
  actualizacion: AjusteTipo
  historial: AjusteHistorialItem[]
}