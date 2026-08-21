import { apiRequest, construirQuery, fetchAllPages } from './api'
import type { MovimientoDiario, MovimientoFormValues, ResumenCaja } from '../types/libroDiario'

/**
 * Movimientos del mes, sin los retiros.
 *
 * Los retiros de caja se listan aparte, así que se piden explícitamente los otros
 * tres tipos. Antes esto era `/libroDiario/{anio}/{mes}`, que traía el filtro
 * `tipo <> 'RETIRO'` escondido en el backend.
 */
export async function listMovimientos(anio: string, mes: string): Promise<MovimientoDiario[]> {
  return fetchAllPages<MovimientoDiario>('/movimientos', 'Error al cargar el libro diario', {
    anio,
    mes,
    tipo: ['INGRESO', 'DEPOSITO', 'EGRESO'],
    sort: '-fecha',
  })
}

/** Retiros de caja del mes: el mismo recurso, filtrado por tipo. */
export async function listRetiros(anio: string, mes: string): Promise<MovimientoDiario[]> {
  return fetchAllPages<MovimientoDiario>('/movimientos', 'Error al cargar los retiros de caja', {
    anio,
    mes,
    tipo: 'RETIRO',
    sort: 'fecha',
  })
}

export async function obtenerResumenCaja(anio: string, mes: string): Promise<ResumenCaja> {
  const query = construirQuery({ anio, mes })
  return apiRequest<ResumenCaja>(
    `/caja/resumen?${query}`,
    { method: 'GET' },
    'Error al cargar el estado de la caja',
  )
}

export async function crearMovimiento(values: MovimientoFormValues): Promise<MovimientoDiario> {
  return apiRequest<MovimientoDiario>(
    '/movimientos',
    {
      method: 'POST',
      body: JSON.stringify({
        fecha: values.fecha,
        tipo: values.tipo,
        propiedad_id: values.propiedadId ? Number(values.propiedadId) : null,
        concepto: values.concepto,
        monto: Number(values.monto),
        cuenta: values.cuenta || null,
      }),
    },
    'Error al registrar el movimiento',
  )
}

export async function eliminarMovimiento(id: number): Promise<void> {
  await apiRequest<null>(
    `/movimientos/${id}`,
    { method: 'DELETE' },
    'Error al eliminar el movimiento',
  )
}
