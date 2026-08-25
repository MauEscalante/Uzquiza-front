import { apiRequest, fetchCollection, fetchPage } from './api'
import type { Propiedad, PropiedadCreateValues, PropiedadDetalle, PropiedadUpdateValues, PropietarioResumen } from '../types/propiedad'

/** El id de la propiedad se muestra siempre con 6 dígitos: 1 -> "000001". */
export function formatPropiedadId(id: number) {
  return String(id).padStart(6, '0')
}

export function listPropiedades(): Promise<Propiedad[]> {
  return fetchCollection<Propiedad>('/propiedades')
}

/** Total real de propiedades, sin el techo de page_size que tiene el listado. */
export async function contarPropiedades(): Promise<number> {
  const page = await fetchPage<unknown>('/propiedades', { page_size: 1 })
  return page.total
}

export function getPropiedad(id: number): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(`/propiedades/${id}`)
}

/** Clientes que ya son propietarios, para el selector del alta de propiedad. */
export function listPropietarios(): Promise<PropietarioResumen[]> {
  return fetchCollection<PropietarioResumen>('/clientes', { tipo: 'Propietario' })
}

export function createPropiedad(values: PropiedadCreateValues): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>('/propiedades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export function updatePropiedad(id: number, values: PropiedadUpdateValues): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(`/propiedades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export function deletePropiedad(id: number): Promise<void> {
  return apiRequest<void>(`/propiedades/${id}`, { method: 'DELETE' })
}
