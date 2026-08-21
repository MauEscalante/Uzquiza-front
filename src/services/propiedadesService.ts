import { apiRequest, fetchAllPages } from './api'
import type { Propiedad, PropiedadCreateValues, PropiedadDetalle, PropiedadUpdateValues, PropietarioResumen } from '../types/propiedad'

/** El id de la propiedad se muestra siempre con 6 dígitos: 1 -> "000001". */
export function formatPropiedadId(id: number) {
  return String(id).padStart(6, '0')
}

export async function listPropiedades(): Promise<Propiedad[]> {
  return fetchAllPages<Propiedad>('/propiedades', 'Error al cargar propiedades')
}

export async function getPropiedad(id: number): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(
    `/propiedades/${id}`,
    { method: 'GET' },
    'Error al cargar detalle de la propiedad',
  )
}

/**
 * Clientes que ya son propietarios, para el selector del alta de propiedad.
 *
 * Antes era la colección /propietarios, que en realidad era /clientes con el
 * filtro por tipo fijo en la URL.
 */
export async function listPropietarios(): Promise<PropietarioResumen[]> {
  return fetchAllPages<PropietarioResumen>(
    '/clientes',
    'Error al cargar propietarios',
    { tipo: 'Propietario' },
  )
}

export async function createPropiedad(values: PropiedadCreateValues): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(
    '/propiedades',
    { method: 'POST', body: JSON.stringify(values) },
    'Error al crear la propiedad',
  )
}

export async function updatePropiedad(id: number, values: PropiedadUpdateValues): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(
    `/propiedades/${id}`,
    { method: 'PUT', body: JSON.stringify(values) },
    'Error al actualizar la propiedad',
  )
}

/** Actualiza solo los campos indicados, sin reemplazar la fila entera. */
export async function patchPropiedad(id: number, cambios: Partial<PropiedadUpdateValues>): Promise<PropiedadDetalle> {
  return apiRequest<PropiedadDetalle>(
    `/propiedades/${id}`,
    { method: 'PATCH', body: JSON.stringify(cambios) },
    'Error al actualizar la propiedad',
  )
}

/** Propietarios de una propiedad, con el porcentaje de cada uno. */
export async function listPropietariosDePropiedad(id: number) {
  return apiRequest<PropietarioResumen[]>(
    `/propiedades/${id}/propietarios`,
    { method: 'GET' },
    'Error al cargar los propietarios de la propiedad',
  )
}

export async function deletePropiedad(id: number): Promise<void> {
  await apiRequest<null>(
    `/propiedades/${id}`,
    { method: 'DELETE' },
    'Error al eliminar la propiedad',
  )
}
