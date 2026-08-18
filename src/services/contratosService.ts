import type {  ContratoFormValues } from '../types/contrato'


export async function listContratos() {
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

export async function getContratoDetails(id: string) {
  const response = await fetch(`http://127.0.0.1:8000/contratos/${id}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar resumen: ${response.status}`)
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



export async function deleteContrato(id: string) {
  const response = await fetch(`http://127.0.0.1:8000/resumen/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al eliminar contrato: ${response.status}`)
  }

  return response.json()
}

