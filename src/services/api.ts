export const requestDelay = 140

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function mockRequest<T>(value: T, delay = requestDelay): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), delay)
  })
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Error en la petición a ${path}: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number)  {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value/100)
}

/** "2026-08-10" -> "10/08/2026". El backend siempre manda fechas ISO. */
export function formatDate(value: string) {
  const [anio, mes, dia] = value.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}
