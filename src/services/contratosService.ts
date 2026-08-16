import type { Contrato, ContratoFormValues } from '../types/contrato'

let contratos: Contrato[] = [
  {
    id: 'con-001',
    propiedad: 'Av. San Martín 1234',
    inquilino: 'Ana Pérez',
    fechaInicio: '2024-01-01',
    fechaFin: '2026-01-01',
    importeActual: 320000,
    tipoAjuste: 'IPC',
    periodicidad: 'Trimestral',
    estado: 'Activo',
  },
  {
    id: 'con-002',
    propiedad: 'Italia 789',
    inquilino: 'Julián Gómez',
    fechaInicio: '2023-09-15',
    fechaFin: '2025-09-15',
    importeActual: 285000,
    tipoAjuste: 'ICL',
    periodicidad: 'Semestral',
    estado: 'Próximo a vencer',
  },
]

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

  return response.json()
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

export function getContratosSnapshot() {
  return contratos
}