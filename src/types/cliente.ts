/** El tipo no se guarda: lo deriva el back de contratos y propiedades. */
export type ClienteTipo = 'Inquilino' | 'Propietario' | 'Ambos'

export interface Cliente {
  cliente_num: number
  nombre: string
  apellido: string
  dni: string
  telefono: string
  email: string | null
  direccion: string | null
  cuil: string | null
  nacionalidad: string | null
  /** Null cuando el cliente todavía no tiene contratos ni propiedades. */
  tipo: ClienteTipo | null
  /** Comisión del propietario. Null si el cliente no es propietario. */
  comision: number | null
}

/** Body del PUT: el back pide todos los campos editables (ClienteUpdate). */
export type ClienteFormValues = Omit<Cliente, 'cliente_num' | 'tipo' | 'comision'>
