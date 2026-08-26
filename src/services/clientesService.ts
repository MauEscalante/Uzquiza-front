import type { ClienteFormValues, ClienteValorHistorico } from '../types/cliente'

export async function listClientes() {
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

export async function getClienteHistorial(clienteNum: number): Promise<ClienteValorHistorico[]> {
  const response = await fetch(`http://127.0.0.1:8000/clientes/${clienteNum}/historial`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error al cargar el historial del cliente: ${response.status}`)
  }

  return await response.json()
}

export async function createCliente(values: ClienteFormValues) {
  const response = await fetch(`http://127.0.0.1:8000/clientes/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al cargar clientes: ${response.status}`)
  }

  return await response.json()
}

export async function updateCliente(clienteNum: number, values: ClienteFormValues) {
  const response = await fetch(`http://127.0.0.1:8000/clientes/${clienteNum}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error(`Error al cargar clientes: ${response.status}`)
  }

  return await response.json()
}
