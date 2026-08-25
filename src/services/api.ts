export const requestDelay = 140

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
/** Todo endpoint de negocio cuelga de acá (settings.API_PREFIX en el back). */
const API_PREFIX = '/api/v1'

/** Tope de filas por página que acepta el back (PAGE_SIZE_MAX en schemas/common.py). */
export const PAGE_SIZE_MAX = 100

/** Envelope en el que el back devuelve toda colección. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

/** Error a nivel campo dentro de la respuesta de error del back. */
interface ApiErrorDetail {
  field: string | null
  message: string
  code: string
}

/** Error de la API con el status y el mensaje que mandó el back.
 *
 * Los 4xx/5xx salen con el envelope ErrorResponse, así que la UI puede mostrar
 * el motivo real (p. ej. el 409 de "ya hay un ajuste en curso") en vez de un
 * mensaje genérico.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details: ApiErrorDetail[]

  constructor(message: string, status: number, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function mockRequest<T>(value: T, delay = requestDelay): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), delay)
  })
}

/** URL absoluta de un path de la API. Para los casos que no devuelven JSON. */
export function apiUrl(path: string) {
  return `${API_BASE_URL}${API_PREFIX}${path}`
}

async function buildApiError(response: Response, path: string): Promise<ApiError> {
  try {
    const body = await response.json()
    if (body && typeof body.message === 'string') {
      return new ApiError(body.message, response.status, body.details ?? [])
    }
  } catch {
    // El body no era el envelope de error esperado; caemos al mensaje genérico.
  }

  return new ApiError(`Error en la petición a ${path}: ${response.status}`, response.status)
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw await buildApiError(response, path)
  }

  // Los DELETE responden 204 sin body: pedirle el json explota.
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function buildQuery(params: Record<string, string | number>) {
  const entries = Object.entries({ page_size: PAGE_SIZE_MAX, ...params })
    .map(([key, value]) => [key, String(value)] as [string, string])

  return new URLSearchParams(entries).toString()
}

/** Trae una página de tamaño máximo y devuelve el envelope completo. */
export function fetchPage<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<Page<T>> {
  return apiRequest<Page<T>>(`${path}?${buildQuery(params)}`)
}

/** Igual que fetchPage pero devuelve solo las filas.
 *
 * Las páginas filtran y cuentan en el cliente, así que trabajan con arrays: el
 * envelope se desarma acá y no en los controllers. Techo de PAGE_SIZE_MAX filas.
 */
export async function fetchCollection<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  const page = await fetchPage<T>(path, params)
  return page.items
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
