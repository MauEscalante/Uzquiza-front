import type { ErrorResponse, Page } from '../types/api'

export const requestDelay = 140

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

/** Todos los recursos cuelgan del prefijo de versión. */
export const API_V1 = `${API_BASE_URL}/api/v1`

/** Tope de page_size que acepta el backend. */
const PAGE_SIZE_MAX = 100

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function mockRequest<T>(value: T, delay = requestDelay): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), delay)
  })
}

/** Un filtro puede repetirse: `?tipo=INGRESO&tipo=DEPOSITO`. */
export type QueryParams = Record<string, string | string[]>

/** Arma el query string admitiendo parámetros repetidos. */
export function construirQuery(params: QueryParams): string {
  const query = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    for (const item of Array.isArray(valor) ? valor : [valor]) {
      query.append(clave, item)
    }
  }
  return query.toString()
}

/** Error que trae un mensaje del backend, apto para mostrarle al usuario. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Mensaje a mostrar para un error capturado.
 *
 * Solo se confía en el texto de un ApiError, que viene del envelope del backend.
 * Un fallo de red da un Error nativo con mensajes como "fetch failed" o
 * "Failed to fetch", que al usuario no le dicen nada: ahí va el mensaje propio.
 */
export function mensajeDe(error: unknown, fallback: string): string {
  return error instanceof ApiError && error.message ? error.message : fallback
}

/** Saca el mensaje del envelope de error del backend, con fallback al status. */
async function mensajeDeError(response: Response, contexto: string): Promise<string> {
  try {
    const cuerpo = (await response.json()) as ErrorResponse
    if (cuerpo?.message) {
      const campo = cuerpo.details?.find((d) => d.field)?.field
      return campo ? `${cuerpo.message} (${campo})` : cuerpo.message
    }
  } catch {
    // Respuesta sin JSON: se cae al mensaje genérico.
  }
  return `${contexto}: ${response.status}`
}

/**
 * Request contra la API.
 *
 * Devuelve null en las respuestas 204 (los DELETE), que no traen cuerpo y
 * harían fallar a response.json().
 */
export async function apiRequest<T>(path: string, init?: RequestInit, contexto = `Error en la petición a ${path}`): Promise<T> {
  const response = await fetch(`${API_V1}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new ApiError(await mensajeDeError(response, contexto), response.status)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

/**
 * Recorre todas las páginas de una colección y devuelve los items juntos.
 *
 * Las pantallas todavía muestran las listas completas, así que la paginación se
 * resuelve acá en vez de truncar en la primera página. El día que las tablas
 * paginen de verdad, conviene usar apiRequest<Page<T>> directamente.
 */
export async function fetchAllPages<T>(path: string, contexto: string, params: QueryParams = {}): Promise<T[]> {
  const items: T[] = []
  let page = 1
  let pages = 1

  do {
    const query = construirQuery({ ...params, page: String(page), page_size: String(PAGE_SIZE_MAX) })
    const pagina = await apiRequest<Page<T>>(`${path}?${query}`, { method: 'GET' }, contexto)
    items.push(...pagina.items)
    pages = pagina.pages
    page += 1
  } while (page <= pages)

  return items
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
