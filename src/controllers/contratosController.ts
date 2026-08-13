import { mockRequest } from '../services/api'
import type { Contrato } from '../types/contrato'

export async function listContratosController(contratos: Contrato[]) {
  return mockRequest(contratos)
}

export async function createContratoController(created: Contrato) {
  return mockRequest(created)
}

export async function updateContratoController(updated: Contrato) {
  return mockRequest(updated)
}

export async function deleteContratoController() {
  return mockRequest(true)
}
