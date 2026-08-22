import { apiRequest, construirQuery, fetchAllPages } from './api'
import type { Contrato, ContratoDetalle, ContratoFormValues, RescisionCalculo } from '../types/contrato'
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

/**
 * Cuánto sale irse en un mes dado, sin persistir nada.
 *
 * El día dentro del mes es indistinto: el backend toma siempre el cierre del mes.
 */
export async function calcularRescision(id: string, anio: number, mes: number): Promise<RescisionCalculo> {
  const query = construirQuery({ anio: String(anio), mes: String(mes) })
  return apiRequest<RescisionCalculo>(
    `/contratos/${id}/rescision?${query}`,
    { method: 'GET' },
    'Error al calcular la rescisión',
  )
}

/**
 * Registra el aviso: el inquilino se va tal mes. NO cierra el contrato.
 *
 * Queda Activo con la salida agendada, porque ese mes lo paga y tiene que seguir
 * liquidando. La penalidad se calcula al entregar las llaves.
 */
export async function registrarRescision(id: string, anio: number, mes: number): Promise<RescisionCalculo> {
  return apiRequest<RescisionCalculo>(
    `/contratos/${id}/rescision`,
    { method: 'POST', body: JSON.stringify({ anio, mes }) },
    'Error al registrar la rescisión',
  )
}

/**
 * Cierra la rescisión con la fecha real de entrega de llaves.
 *
 * `importe` solo hace falta cuando el mes de la entrega todavía no tiene su alquiler
 * cargado; el preview lo anticipa con `importe_estimado`.
 */
export async function entregarLlaves(id: string, fechaEntrega: string, importe?: number): Promise<RescisionCalculo> {
  return apiRequest<RescisionCalculo>(
    `/contratos/${id}/entrega-llaves`,
    {
      method: 'POST',
      body: JSON.stringify({
        fecha_entrega: fechaEntrega,
        importe_alquiler: importe ?? null,
      }),
    },
    'Error al registrar la entrega de llaves',
  )
}

/** Deshace un aviso mal cargado. */
export async function cancelarRescision(id: string): Promise<void> {
  await apiRequest<null>(
    `/contratos/${id}/rescision`,
    { method: 'DELETE' },
    'Error al cancelar la rescisión',
  )
}
