export type ClienteTipo = 'Inquilino' | 'Propietario'

export interface Cliente {
  id: string
  numeroCliente: string
  nombre: string
  apellido: string
  dni: string
  telefono: string
  email: string
  direccion: string
  cuil: string
  nacionalidad: string
  tipo: ClienteTipo
}

export type ClienteFormValues = Omit<Cliente, 'id' | 'numeroCliente' | 'tipo'>