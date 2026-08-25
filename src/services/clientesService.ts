import { apiRequest, fetchCollection, fetchPage } from './api'
import type { Cliente, ClienteFormValues } from '../types/cliente'

// No hay alta de clientes: el back los crea solos al registrar un contrato
// (inquilino) o una propiedad (propietario).

export function listClientes(): Promise<Cliente[]> {
  return fetchCollection<Cliente>('/clientes')
}

/** Total real de clientes, sin el techo de page_size que tiene el listado. */
export async function contarClientes(): Promise<number> {
  const page = await fetchPage<unknown>('/clientes', { page_size: 1 })
  return page.total
}

export function updateCliente(clienteNum: number, values: ClienteFormValues): Promise<Cliente> {
  return apiRequest<Cliente>(`/clientes/${clienteNum}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}
