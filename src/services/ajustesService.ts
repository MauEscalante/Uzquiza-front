import { createId, formatCurrency, mockRequest } from './api'
import { getContratosSnapshot } from './contratosService'
import type { Ajuste } from '../types/ajuste'

let ajustes: Ajuste[] = getContratosSnapshot().map((contrato, index) => ({
  id: createId('aj'),
  contrato: contrato.codigo,
  propiedad: contrato.propiedad,
  inquilino: contrato.inquilino,
  importeActual: contrato.importeActual,
  tipoAjuste: contrato.tipoAjuste,
  periodicidad: contrato.periodicidad,
  fechaProximoAjuste: index === 0 ? '2026-09-01' : '2026-07-01',
  nuevoImporte: index === 0 ? 336000 : 301500,
  estado: index === 0 ? 'Ajuste próximo' : 'Ajuste pendiente',
  historial: [
    { fecha: '2026-03-01', detalle: 'Último cálculo registrado' },
    { fecha: '2025-12-01', detalle: 'Ajuste aplicado correctamente' },
  ],
}))

export async function listAjustes() {
  return mockRequest(ajustes)
}

export async function calcularAjuste(id: string) {
  ajustes = ajustes.map((ajuste) => {
    if (ajuste.id !== id) {
      return ajuste
    }

    const nuevoImporte = Math.round(ajuste.importeActual * 1.08)

    return {
      ...ajuste,
      nuevoImporte,
      estado: 'Ajuste pendiente',
      historial: [
        { fecha: new Date().toISOString().slice(0, 10), detalle: `Nuevo importe calculado: ${formatCurrency(nuevoImporte)}` },
        ...ajuste.historial,
      ],
    }
  })

  return mockRequest(ajustes.find((ajuste) => ajuste.id === id) ?? ajustes[0])
}

export async function aplicarAjuste(id: string) {
  ajustes = ajustes.map((ajuste) => {
    if (ajuste.id !== id) {
      return ajuste
    }

    return {
      ...ajuste,
      importeActual: ajuste.nuevoImporte,
      estado: 'Ajuste realizado',
      historial: [{ fecha: new Date().toISOString().slice(0, 10), detalle: 'Ajuste aplicado con éxito' }, ...ajuste.historial],
    }
  })

  return mockRequest(ajustes.find((ajuste) => ajuste.id === id) ?? ajustes[0])
}