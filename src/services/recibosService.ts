import { createId, mockRequest } from './api'
import { getContratosSnapshot } from './contratosService'
import type { Recibo, ReciboFormValues } from '../types/recibo'

let recibos: Recibo[] = [
  { id: 'rec-001', contrato: 'CTR-2401', inquilino: 'Ana Pérez', mes: 'Julio', anio: '2026', importeAlquiler: 320000, comision: 16000, otrosConceptos: 5000, total: 341000, estado: 'Emitido' },
]

export async function listRecibos() {
  return mockRequest(recibos)
}

export async function generarRecibo(values: ReciboFormValues) {
  const contrato = getContratosSnapshot().find((entry) => entry.codigo === values.contrato)
  const importeAlquiler = contrato?.importeActual ?? 0
  const comision = Math.round(importeAlquiler * 0.05)
  const otrosConceptos = 5000
  const created: Recibo = {
    id: createId('rec'),
    contrato: values.contrato,
    inquilino: values.inquilino,
    mes: values.mes,
    anio: values.anio,
    importeAlquiler,
    comision,
    otrosConceptos,
    total: importeAlquiler + comision + otrosConceptos,
    estado: 'Generado',
  }

  recibos = [created, ...recibos]
  return mockRequest(created)
}

export async function descargarExcelMock() {
  return mockRequest('La exportación a Excel se conectará luego con FastAPI.')
}