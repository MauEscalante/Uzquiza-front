import { apiRequest } from '../services/api'
import type { Propiedad } from '../types/propiedad'

export async function listPropiedadesController() {
  return apiRequest<Propiedad[]>('/propiedades')
}

export async function createPropiedadController(created: Propiedad) {
  return apiRequest<Propiedad>('/propiedades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(created),
  })
}

export async function updatePropiedadController(id: string, updated: Propiedad) {
  return apiRequest<Propiedad>(`/propiedades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  })
}

export async function deletePropiedadController(id: string) {
  return apiRequest<boolean>(`/propiedades/${id}`, {
    method: 'DELETE',
  })
}
