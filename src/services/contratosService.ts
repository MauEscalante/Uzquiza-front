import { apiRequest, fetchCollection, fetchPage } from './api'
import type { Contrato, ContratoDetalle, ContratoFormValues } from '../types/contrato'

export interface PropiedadResumen {
  propiedad_id: number
  direccion: string
}

export function listPropiedadesResumen(): Promise<PropiedadResumen[]> {
  return fetchCollection<PropiedadResumen>('/propiedades')
}

export function listContratos(): Promise<Contrato[]> {
  return fetchCollection<Contrato>('/contratos')
}

/** Cantidad de contratos que matchean el filtro. Solo interesa el total del
 * envelope, así que se pide una sola fila. */
async function contarContratos(params: Record<string, string | number> = {}): Promise<number> {
  const page = await fetchPage<unknown>('/contratos', { ...params, page_size: 1 })
  return page.total
}

export function contarContratosActivos(): Promise<number> {
  return contarContratos({ estado: 'Activo' })
}

export function getContratoDetails(id: string): Promise<ContratoDetalle> {
  return apiRequest<ContratoDetalle>(`/contratos/${id}`)
}

export function createContrato(values: ContratoFormValues): Promise<Contrato> {
  return apiRequest<Contrato>('/contratos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}
