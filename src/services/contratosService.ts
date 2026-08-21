import { apiRequest, fetchAllPages } from './api'
import type { Contrato, ContratoDetalle, ContratoFormValues } from '../types/contrato'
import type { ContratoGarante, ContratoInquilino } from '../types/contrato'

export interface PropiedadResumen {
  propiedad_id: number
  direccion: string
}

export async function listPropiedadesResumen(): Promise<PropiedadResumen[]> {
  return fetchAllPages<PropiedadResumen>('/propiedades', 'Error al cargar propiedades')
}

export async function listContratos(): Promise<Contrato[]> {
  return fetchAllPages<Contrato>('/contratos', 'Error al cargar contratos')
}

export async function getContratoDetails(id: string): Promise<ContratoDetalle> {
  // Sin barra final: antes la había y provocaba un 307 en cada llamada.
  return apiRequest<ContratoDetalle>(
    `/contratos/${id}`,
    { method: 'GET' },
    'Error al cargar detalle del contrato',
  )
}

export async function createContrato(values: ContratoFormValues) {
  return apiRequest<Contrato>(
    '/contratos',
    { method: 'POST', body: JSON.stringify(values) },
    'Error al cargar contrato',
  )
}

export async function deleteContrato(id: string): Promise<void> {
  await apiRequest<null>(
    `/contratos/${id}`,
    { method: 'DELETE' },
    'Error al eliminar el contrato',
  )
}

/** Sub-recurso: los inquilinos del contrato. */
export async function listInquilinosDeContrato(id: string): Promise<ContratoInquilino[]> {
  return apiRequest<ContratoInquilino[]>(
    `/contratos/${id}/inquilinos`,
    { method: 'GET' },
    'Error al cargar los inquilinos del contrato',
  )
}

/** Sub-recurso: los garantes del contrato. Vacío si la garantía es GPremier. */
export async function listGarantesDeContrato(id: string): Promise<ContratoGarante[]> {
  return apiRequest<ContratoGarante[]>(
    `/contratos/${id}/garantes`,
    { method: 'GET' },
    'Error al cargar los garantes del contrato',
  )
}
