import { apiRequest, construirQuery } from './api'
import type { AjusteAplicado, AjustePendiente, TramoHistorial } from '../types/ajuste'

/**
 * Contratos a los que les toca ajuste en el período.
 *
 * Solo los de IPC: los de ICL no los ajusta nadie todavía, así que nunca aparecen.
 */
export async function listPendientes(mes: number, anio: number): Promise<AjustePendiente[]> {
  const query = construirQuery({ mes: String(mes), anio: String(anio) })
  return apiRequest<AjustePendiente[]>(
    `/ajustes/pendientes?${query}`,
    { method: 'GET' },
    'Error al cargar los ajustes pendientes',
  )
}

/**
 * Aplica el aumento del período a los alquileres que corresponden.
 *
 * Ajusta solo la plata: no reescribe la planilla de recibos ni marca las
 * propiedades como impagas, que es lo que hace de más "Hacer recibos". Repetirlo
 * no vuelve a aumentar.
 */
export async function ajustarAlquileres(mes: number, anio: number): Promise<AjusteAplicado> {
  return apiRequest<AjusteAplicado>(
    '/ajustes',
    { method: 'POST', body: JSON.stringify({ mes, anio }) },
    'Error al ajustar los alquileres',
  )
}

/** Historial de alquileres del contrato: un tramo por ajuste. */
export async function listHistorial(contratoId: string): Promise<TramoHistorial[]> {
  return apiRequest<TramoHistorial[]>(
    `/ajustes/${contratoId}/historial`,
    { method: 'GET' },
    'Error al cargar el historial del contrato',
  )
}
