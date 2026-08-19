import type { Contrato, ContratoDetalle, ContratoFormValues } from '../types/contrato'

export interface PropiedadResumen {
  propiedad_id: number
  direccion: string
}

export async function listPropiedadesResumen(): Promise<PropiedadResumen[]> {
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

export async function listContratos(): Promise<Contrato[]> {
  const response = await fetch(`http://127.0.0.1:8000/contratos/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar contratos: ${response.status}`)
  }

  return await response.json()
}

export async function getContratoDetails(id: string): Promise<ContratoDetalle> {
  const response = await fetch(`http://127.0.0.1:8000/contratos/${id}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar detalle del contrato: ${response.status}`)
  }

  return response.json()
}

export async function createContrato(values: ContratoFormValues) {
  const response = await fetch(`http://127.0.0.1:8000/contratos/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al cargar contrato: ${response.status}`)
  }

  return response.json()
}



