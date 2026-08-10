export interface Cliente {
  id: string
  numeroCliente: string
  nombre: string
  apellido: string
  dni: string
  telefono: string
  email: string
}

export type ClienteFormValues = Omit<Cliente, 'id' | 'numeroCliente'>