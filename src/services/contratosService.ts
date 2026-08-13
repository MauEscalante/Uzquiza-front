import {
  createContratoController,
  deleteContratoController,
  listContratosController,
  updateContratoController,
} from '../controllers/contratosController'
import type { Contrato, ContratoFormValues } from '../types/contrato'

let contratos: Contrato[] = [
  {
    id: 'con-001',
    codigo: 'CTR-2401',
    propiedad: 'Av. San Martín 1234',
    inquilino: 'Ana Pérez',
    fechaInicio: '2024-01-01',
    fechaFin: '2026-01-01',
    importeActual: 320000,
    tipoAjuste: 'IPC',
    periodicidad: 'Trimestral',
    estado: 'Activo',
  },
  {
    id: 'con-002',
    codigo: 'CTR-2402',
    propiedad: 'Italia 789',
    inquilino: 'Julián Gómez',
    fechaInicio: '2023-09-15',
    fechaFin: '2025-09-15',
    importeActual: 285000,
    tipoAjuste: 'ICL',
    periodicidad: 'Semestral',
    estado: 'Próximo a vencer',
  },
]

export async function listContratos() {
  return listContratosController(contratos)
}

export async function createContrato(values: ContratoFormValues) {
  const created: Contrato = {
    id: `con-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ...values,
  }

  contratos = [created, ...contratos]
  return createContratoController(created)
}

export async function updateContrato(id: string, values: ContratoFormValues) {
  const updated: Contrato = {
    ...(contratos.find((contrato) => contrato.id === id) ?? { id, codigo: '', propiedad: '', inquilino: '', fechaInicio: '', fechaFin: '', importeActual: 0, tipoAjuste: 'IPC', periodicidad: 'Mensual', estado: 'Activo' }),
    ...values,
  }

  contratos = contratos.map((contrato) => (contrato.id === id ? updated : contrato))
  return updateContratoController(updated)
}

export async function deleteContrato(id: string) {
  contratos = contratos.filter((contrato) => contrato.id !== id)
  return deleteContratoController()
}

export function getContratosSnapshot() {
  return contratos
}