import type { MovimientoDiario, MovimientoFormValues, ResumenCaja } from '../types/libroDiario'

export async function listMovimientos(anio: string, mes: string): Promise<MovimientoDiario[]> {
  const response = await fetch(`http://127.0.0.1:8000/libroDiario/${anio}/${mes}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar el libro diario: ${response.status}`)
  }

  return await response.json()
}

export async function listRetiros(anio: string, mes: string): Promise<MovimientoDiario[]> {
  const response = await fetch(`http://127.0.0.1:8000/libroDiario/retiros/${anio}/${mes}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar los retiros de caja: ${response.status}`)
  }

  return await response.json()
}

export async function obtenerResumenCaja(anio: string, mes: string): Promise<ResumenCaja> {
  const response = await fetch(`http://127.0.0.1:8000/libroDiario/resumen/${anio}/${mes}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar el estado de la caja: ${response.status}`)
  }

  return await response.json()
}

export async function crearMovimiento(values: MovimientoFormValues): Promise<MovimientoDiario> {
  const response = await fetch(`http://127.0.0.1:8000/libroDiario/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fecha: values.fecha,
      tipo: values.tipo,
      propiedad_id: values.propiedadId ? Number(values.propiedadId) : null,
      concepto: values.concepto,
      monto: Number(values.monto),
      cuenta: values.cuenta || null,
    }),
  })

  if (!response.ok) {
    // El backend explica el motivo en `detail`; sin eso el error no le sirve al usuario.
    const detalle = await response.json().catch(() => null)
    throw new Error(detalle?.detail ?? `Error al registrar el movimiento: ${response.status}`)
  }

  return await response.json()
}

export async function eliminarMovimiento(id: number): Promise<void> {
  const response = await fetch(`http://127.0.0.1:8000/libroDiario/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al eliminar el movimiento: ${response.status}`)
  }
}
