import { apiRequest, apiUrl, fetchCollection } from './api'
import type { AjusteRead, ContratoAAjustar, Recibo } from '../types/recibo'

/** Historial de ingresos por mes. Antes vivía en GET /libroDiario/. */
export function listHistorialIngreso(): Promise<Recibo[]> {
  return fetchCollection<Recibo>('/caja/historial')
}

/** Contratos con ajuste pendiente en un período.
 *
 * Reemplaza a /recibos/ajustar/{mes}/{anio} y a /recibos/reajustar/{mes}/{anio}:
 * el back ya no distingue ajuste de reajuste en la URL.
 */
export function listContratosPendientes(mes: number, anio: number): Promise<ContratoAAjustar[]> {
  return apiRequest<ContratoAAjustar[]>(`/recibos/pendientes?mes=${mes}&anio=${anio}`)
}

/** Encola el ajuste del período. Responde 202 con el trabajo en 'pendiente'.
 *
 * El ajuste tarda más de un minuto, así que el back no lo resuelve dentro del
 * request: hay que seguirlo con getAjuste(). Tira 409 si ya hay uno en curso.
 */
export function solicitarAjuste(mes: number, anio: number): Promise<AjusteRead> {
  return apiRequest<AjusteRead>('/recibos/ajustes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes, anio }),
  })
}

export function getAjuste(ajusteId: number): Promise<AjusteRead> {
  return apiRequest<AjusteRead>(`/recibos/ajustes/${ajusteId}`)
}

/** Nombre del archivo que mandó el back.
 *
 * El nombre de la planilla tiene espacios, así que FastAPI lo manda en la forma
 * extendida de la RFC 5987 (`filename*=utf-8''...`) y no como `filename="..."`.
 */
function nombreDesdeDisposition(disposition: string, fallback: string) {
  const extendido = /filename\*=utf-8''([^;]+)/i.exec(disposition)?.[1]

  if (extendido) {
    try {
      return decodeURIComponent(extendido)
    } catch {
      // Venía mal codificado; seguimos con las otras opciones.
    }
  }

  return /filename="([^"]+)"/i.exec(disposition)?.[1] ?? fallback
}

/** Descarga la planilla de recibos. El back la manda como .xlsx, no como JSON. */
export async function descargarPlanilla(): Promise<void> {
  const response = await fetch(apiUrl('/recibos/archivo'))

  if (!response.ok) {
    throw new Error(`Error al descargar la planilla: ${response.status}`)
  }

  const disposition = response.headers.get('Content-Disposition') ?? ''
  const nombre = nombreDesdeDisposition(disposition, 'recibos.xlsx')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
