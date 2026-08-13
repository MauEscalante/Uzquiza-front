import {
  createPropiedadController,
  deletePropiedadController,
  listPropiedadesController,
  updatePropiedadController,
} from '../controllers/propiedadesController'
import type { Propiedad, PropiedadFormValues } from '../types/propiedad'

let propiedades: Propiedad[] = [
  { id: 'prop-001', direccion: 'Av. San Martín 1234', propietario: 'María López', inquilino: 'Ana Pérez', estado: 'Alquilada' },
  { id: 'prop-002', direccion: 'Belgrano 456', propietario: 'Jorge Díaz', inquilino: '', estado: 'Disponible' },
  { id: 'prop-003', direccion: 'Italia 789', propietario: 'Sofía Torres', inquilino: 'Julián Gómez', estado: 'Mantenimiento' },
]

export async function listPropiedades() {
  return listPropiedadesController()
}

export async function createPropiedad(values: PropiedadFormValues) {
  const created: Propiedad = {
    id: `prop-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ...values,
  }

  propiedades = [created, ...propiedades]
  return createPropiedadController(created)
}

export async function updatePropiedad(id: string, values: PropiedadFormValues) {
  const updated: Propiedad = {
    ...(propiedades.find((propiedad) => propiedad.id === id) ?? { id }),
    ...values,
  }

  propiedades = propiedades.map((propiedad) => (propiedad.id === id ? updated : propiedad))
  return updatePropiedadController(id, updated)
}

export async function deletePropiedad(id: string) {
  propiedades = propiedades.filter((propiedad) => propiedad.id !== id)
  return deletePropiedadController(id)
}