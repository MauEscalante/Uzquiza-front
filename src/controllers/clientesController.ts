import { apiRequest } from '../services/api'
import type { Cliente } from '../types/cliente'

export async function listClientesController() {
  return apiRequest<Cliente[]>('/clientes')
}

export async function createClienteController(created: Cliente) {
  return apiRequest<Cliente>('/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(created),
  })
}

export async function updateClienteController(id: string, updated: Cliente) {
  return apiRequest<Cliente>(`/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  })
}

export async function deleteClienteController(id: string) {
  return apiRequest<boolean>(`/clientes/${id}`, {
    method: 'DELETE',
  })
}
