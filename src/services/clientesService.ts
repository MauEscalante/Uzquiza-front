import { apiRequest, fetchAllPages } from './api'
import type { Cliente, ClienteUpdateValues } from '../types/cliente'

// No hay createCliente: los clientes se dan de alta solos al crear un contrato
// (inquilino) o una propiedad (propietario). El backend tampoco expone el alta.

export async function listClientes(): Promise<Cliente[]> {
  return fetchAllPages<Cliente>('/clientes', 'Error al cargar clientes')
}

export async function updateCliente(clienteNum: number, values: ClienteUpdateValues): Promise<Cliente> {
  return apiRequest<Cliente>(
    `/clientes/${clienteNum}`,
    { method: 'PUT', body: JSON.stringify(values) },
    'Error al actualizar el cliente',
  )
}

/**
 * Actualiza solo los campos indicados.
 *
 * Reemplaza a los viejos PUT /clientes/email/{id} y /clientes/telefono/{id}, que
 * mandaban el valor nuevo por query string.
 */
export async function patchCliente(clienteNum: number, cambios: Partial<ClienteUpdateValues>): Promise<Cliente> {
  return apiRequest<Cliente>(
    `/clientes/${clienteNum}`,
    { method: 'PATCH', body: JSON.stringify(cambios) },
    'Error al actualizar el cliente',
  )
}
