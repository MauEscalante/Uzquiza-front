import { createId, mockRequest } from './api'
import type { Propiedad, PropiedadFormValues } from '../types/propiedad'

let propiedades: Propiedad[] = [
  { id: 'prop-001', direccion: 'Av. San Martín 1234', propietario: 'María López', inquilino: 'Ana Pérez', estado: 'Alquilada' },
  { id: 'prop-002', direccion: 'Belgrano 456', propietario: 'Jorge Díaz', inquilino: '', estado: 'Disponible' },
  { id: 'prop-003', direccion: 'Italia 789', propietario: 'Sofía Torres', inquilino: 'Julián Gómez', estado: 'Mantenimiento' },
]

export async function listPropiedades() {
  return mockRequest(propiedades)
}

export async function createPropiedad(values: PropiedadFormValues) {
  const created: Propiedad = {
    id: createId('prop'),
    ...values,
  }

  propiedades = [created, ...propiedades]
  return mockRequest(created)
}

export async function updatePropiedad(id: string, values: PropiedadFormValues) {
  propiedades = propiedades.map((propiedad) => (propiedad.id === id ? { ...propiedad, ...values } : propiedad))
  return mockRequest(propiedades.find((propiedad) => propiedad.id === id) ?? propiedades[0])
}

export async function deletePropiedad(id: string) {
  propiedades = propiedades.filter((propiedad) => propiedad.id !== id)
  return mockRequest(true)
}