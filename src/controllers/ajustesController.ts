import { mockRequest } from '../services/api'
import type { Ajuste } from '../types/ajuste'

export async function listAjustesController(ajustes: Ajuste[]) {
  return mockRequest(ajustes)
}

export async function calcularAjusteController(ajuste: Ajuste) {
  return mockRequest(ajuste)
}

export async function aplicarAjusteController(ajuste: Ajuste) {
  return mockRequest(ajuste)
}
