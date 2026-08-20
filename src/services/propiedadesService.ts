import type { Propiedad, PropiedadCreateValues, PropiedadDetalle, PropiedadUpdateValues, PropietarioResumen } from '../types/propiedad'

/** El id de la propiedad se muestra siempre con 6 dígitos: 1 -> "000001". */
export function formatPropiedadId(id: number) {
  return String(id).padStart(6, '0')
}

export async function listPropiedades(): Promise<Propiedad[]> {
  const response = await fetch(`http://127.0.0.1:8000/propiedades/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar propiedades: ${response.status}`)
  }

  return await response.json()
}

export async function getPropiedad(id: number): Promise<PropiedadDetalle> {
  const response = await fetch(`http://127.0.0.1:8000/propiedades/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar detalle de la propiedad: ${response.status}`)
  }

  return await response.json()
}

/** Clientes que ya son propietarios, para el selector del alta de propiedad. */
export async function listPropietarios(): Promise<PropietarioResumen[]> {
  const response = await fetch(`http://127.0.0.1:8000/propietarios/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar propietarios: ${response.status}`)
  }

  return await response.json()
}

export async function createPropiedad(values: PropiedadCreateValues): Promise<PropiedadDetalle> {
  const response = await fetch(`http://127.0.0.1:8000/propiedades/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al crear la propiedad: ${response.status}`)
  }

  return await response.json()
}

export async function updatePropiedad(id: number, values: PropiedadUpdateValues): Promise<PropiedadDetalle> {
  const response = await fetch(`http://127.0.0.1:8000/propiedades/update/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al actualizar la propiedad: ${response.status}`)
  }

  return await response.json()
}

export async function deletePropiedad(id: number): Promise<void> {
  const response = await fetch(`http://127.0.0.1:8000/propiedades/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al eliminar la propiedad: ${response.status}`)
  }
}
