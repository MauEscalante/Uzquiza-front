
import type { Recibo, ReciboFormValues } from '../types/recibo'

let recibos: Recibo[] = [
  { id: '082026', mes: 'Julio', anio: '2026', total: 341000 },
]

//funcion para obtener los recibos a ajustar
export async function obtenerRecibosAjustar(mes: string, anio: string) {
  const response = await fetch(`http://127.0.0.1:8000/recibos/ajustar/${mes}/${anio}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar recibos a ajustar: ${response.status}`)
  }

  return response.json()
}

//funcion para obtener los recibos a re ajustar
export async function obtenerRecibosReAjustar(mes: string, anio: string) {
  const response = await fetch(`http://127.0.0.1:8000/recibos/reajustar/${mes}/${anio}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar recibos a reajustar: ${response.status}`)
  }

  return response.json()
}

//funcion para generar recibos
export async function generarRecibo(values: ReciboFormValues, recibosAjustar: Recibo[] = [], recibosReAjuste: Recibo[] = []) {

  const { mes, anio } = values
  const response = await fetch(`http://127.0.0.1:8000/recibos/ajustar/${mes}/${anio}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recibosAjustar, recibosReAjuste }),
  })

  if (!response.ok) {
    throw new Error(`Error al cargar recibos: ${response.status}`)
  }

  return response.json()
}

//funcion para listar el historial de ingresos por comisiones
export async function listHistorialIngreso() {
  const response = await fetch('http://127.0.0.1:8000/libroDiario/', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar libro diario: ${response.status}`)
  }

  return response.json()
}



//funcion para descargar excel mock
export async function descargarExcelMock() {
  const response = await fetch('http://127.0.0.1:8000/recibos/', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar recibos: ${response.status}`)
  }

  return response.json()
}

