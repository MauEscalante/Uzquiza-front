/** Envoltorio de colección que devuelve el backend en todos los listados. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

/** Error a nivel campo dentro de la respuesta de error. */
export interface ErrorDetail {
  field: string | null
  message: string
  code: string
}

/** Forma única de error del backend, igual para 404, 409, 422 y 500. */
export interface ErrorResponse {
  error: string
  message: string
  details: ErrorDetail[] | null
  timestamp: string
  path: string
}
