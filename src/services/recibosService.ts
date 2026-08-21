import { API_V1, ApiError, apiRequest, construirQuery } from './api'
import type { ReciboFormValues } from '../types/recibo'

/** Contrato al que le toca ajuste en el período. */
export interface ContratoAAjustar {
  contrato_id: string
  propiedad: number
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
  periodicidad: string | null
  tipo_ajuste: string | null
}

export interface PlanillaResumen {
  cantidad_hojas: number
  hojas: string[]
}

export interface IngresoMensual {
  id: string
  mes: string
  anio: string
  total: number
}

export interface ResumenRecibos {
  totalIngresos: number
  cantidadRecibosActivos: number
  aumentoPorcentual: number
  aumentoMonetario: number
}

/**
 * Contratos con ajuste pendiente en el período.
 *
 * Antes era `/recibos/ajustar/{mes}/{anio}`: el período pasó de identificador a
 * filtro, y ahora el backend valida que el mes sea 1..12.
 */
export async function obtenerRecibosAjustar(mes: string, anio: string): Promise<ContratoAAjustar[]> {
  const query = construirQuery({ mes, anio })
  return apiRequest<ContratoAAjustar[]>(
    `/recibos/pendientes?${query}`,
    { method: 'GET' },
    'Error al cargar recibos a ajustar',
  )
}

export type EstadoAjuste = 'pendiente' | 'en_proceso' | 'completado' | 'fallido'

/** Un trabajo de ajuste tal como lo devuelve el backend. */
export interface Ajuste {
  ajuste_id: number
  mes: number
  anio: number
  estado: EstadoAjuste
  contratos_ajustados: number | null
  propiedades_marcadas_adeuda: number | null
  error: string | null
  creado_en: string
  finalizado_en: string | null
}

/** Estados en los que el trabajo ya no va a cambiar más. */
const ESTADOS_FINALES: EstadoAjuste[] = ['completado', 'fallido']

/** Cada cuánto se pregunta por el estado, y hasta cuándo. */
const INTERVALO_CONSULTA_MS = 2000
const ESPERA_MAXIMA_MS = 10 * 60 * 1000

/**
 * Encola el ajuste del período y devuelve el trabajo recién creado.
 *
 * No espera a que termine: ajustar la planilla tarda más de un minuto. El estado
 * se sigue con esperarAjuste(). Devuelve 409 si ya hay un ajuste en curso.
 */
export async function generarRecibo(values: ReciboFormValues): Promise<Ajuste> {
  return apiRequest<Ajuste>(
    '/recibos/ajustes',
    { method: 'POST', body: JSON.stringify({ mes: Number(values.mes), anio: Number(values.anio) }) },
    'Error al generar los recibos',
  )
}

/** Estado actual de un ajuste. */
export async function obtenerAjuste(ajusteId: number): Promise<Ajuste> {
  return apiRequest<Ajuste>(
    `/recibos/ajustes/${ajusteId}`,
    { method: 'GET' },
    'Error al consultar el ajuste',
  )
}

/**
 * Consulta el ajuste hasta que termina.
 *
 * `onEstado` se llama en cada consulta para que la pantalla pueda mostrar en qué
 * anda. Corta con error si el trabajo falla o si supera la espera máxima, así el
 * botón nunca queda girando para siempre.
 */
export async function esperarAjuste(
  ajusteId: number,
  onEstado?: (estado: EstadoAjuste) => void,
): Promise<Ajuste> {
  const limite = Date.now() + ESPERA_MAXIMA_MS

  for (;;) {
    const ajuste = await obtenerAjuste(ajusteId)
    onEstado?.(ajuste.estado)

    if (ajuste.estado === 'fallido') {
      // Va como ApiError porque el texto lo produjo el backend y hay que mostrarlo:
      // mensajeDe() descarta el mensaje de cualquier Error que no sea ApiError.
      throw new ApiError(ajuste.error ?? 'El ajuste de recibos falló.', 200)
    }
    if (ESTADOS_FINALES.includes(ajuste.estado)) {
      return ajuste
    }
    if (Date.now() > limite) {
      throw new ApiError('El ajuste está tardando demasiado. Revisá el estado más tarde.', 200)
    }

    await new Promise((resolve) => setTimeout(resolve, INTERVALO_CONSULTA_MS))
  }
}

/** Estado de la planilla de recibos guardada en el servidor. */
export async function obtenerPlanilla(): Promise<PlanillaResumen> {
  return apiRequest<PlanillaResumen>('/recibos', { method: 'GET' }, 'Error al cargar la planilla')
}

/** Historial de ingresos por mes. Antes salía de `GET /libroDiario/`. */
export async function listHistorialIngreso(): Promise<IngresoMensual[]> {
  const pagina = await apiRequest<{ items: IngresoMensual[] }>(
    '/caja/historial?page=1&page_size=100',
    { method: 'GET' },
    'Error al cargar el historial de ingresos',
  )
  return pagina.items
}

/**
 * Resumen de la pantalla de Recibos.
 *
 * Se calcula acá a partir del historial y de la planilla. Antes pegaba contra
 * `GET /resumen/`, un endpoint que nunca existió en el backend: la llamada
 * fallaba con 404 en cada carga de la pantalla.
 */
export async function obtenerResumen(): Promise<ResumenRecibos> {
  const [historial, planilla] = await Promise.all([listHistorialIngreso(), obtenerPlanilla()])

  const totalIngresos = historial.reduce((total, fila) => total + fila.total, 0)

  // El historial viene del más nuevo al más viejo.
  const [ultimo, previo] = historial
  const aumentoMonetario = ultimo && previo ? ultimo.total - previo.total : 0
  const aumentoPorcentual = previo?.total ? (aumentoMonetario / previo.total) * 100 : 0

  return {
    totalIngresos,
    cantidadRecibosActivos: planilla.cantidad_hojas,
    aumentoPorcentual,
    aumentoMonetario,
  }
}

/**
 * Descarga la planilla de recibos.
 *
 * El endpoint viejo (`GET /recibos/`) devolvía JSON y además reventaba con un 500,
 * así que el botón de descarga nunca bajó ningún archivo.
 */
export async function descargarExcel(): Promise<string> {
  const response = await fetch(`${API_V1}/recibos/archivo`, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`Error al descargar la planilla: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'RECIBO INMOBILIARIO.xlsx'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)

  return 'Planilla descargada.'
}
