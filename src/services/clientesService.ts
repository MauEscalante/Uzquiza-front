import type { Cliente, ClienteUpdateValues } from '../types/cliente'

// No hay createCliente: los clientes se dan de alta solos al crear un contrato
// (inquilino) o una propiedad (propietario). El backend tampoco expone el alta.

export async function listClientes(): Promise<Cliente[]> {
  const response = await fetch(`http://127.0.0.1:8000/clientes/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar clientes: ${response.status}`)
  }

  return await response.json()
}

export async function updateCliente(clienteNum: number, values: ClienteUpdateValues): Promise<Cliente> {
  const response = await fetch(`http://127.0.0.1:8000/clientes/${clienteNum}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al actualizar el cliente: ${response.status}`)
  }

  return await response.json()
}
