import { createId, mockRequest } from './api'
import type { Cliente, ClienteFormValues } from '../types/cliente'

let clientes: Cliente[] = [
  { id: 'cli-001', numeroCliente: 'CLI-1001', nombre: 'Ana', apellido: 'Pérez', dni: '30111222', telefono: '11 5555-1111', email: 'ana.perez@mail.com' },
  { id: 'cli-002', numeroCliente: 'CLI-1002', nombre: 'Julián', apellido: 'Gómez', dni: '28999888', telefono: '11 5555-2222', email: 'julian.gomez@mail.com' },
  { id: 'cli-003', numeroCliente: 'CLI-1003', nombre: 'Laura', apellido: 'Romero', dni: '31444777', telefono: '11 5555-3333', email: 'laura.romero@mail.com' },
]

export async function listClientes() {
  return mockRequest(clientes)
}

export async function createCliente(values: ClienteFormValues) {
  const created: Cliente = {
    id: createId('cli'),
    numeroCliente: `CLI-${1000 + clientes.length + 1}`,
    ...values,
  }

  clientes = [created, ...clientes]
  return mockRequest(created)
}

export async function updateCliente(id: string, values: ClienteFormValues) {
  clientes = clientes.map((cliente) => (cliente.id === id ? { ...cliente, ...values } : cliente))
  return mockRequest(clientes.find((cliente) => cliente.id === id) ?? clientes[0])
}

export async function deleteCliente(id: string) {
  clientes = clientes.filter((cliente) => cliente.id !== id)
  return mockRequest(true)
}