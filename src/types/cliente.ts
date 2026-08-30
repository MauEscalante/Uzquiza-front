/** Un cliente puede ser las dos cosas: propietario de una propiedad e inquilino de otra. */
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
  /** Derivado en el backend de contratos y propiedades; null si todavía no tiene ninguna. */
  tipo: ClienteTipo | null
  /**
   * Direcciones de las propiedades que posee, separadas por ", ". Null si no es
   * propietario. Es de solo lectura: lo arma el backend con un GROUP_CONCAT.
   */
  direccion_propiedades: string | null
}

/** Solo edición: los clientes se crean automáticamente al cargar contratos y propiedades. */
export type ClienteUpdateValues = Omit<Cliente, 'cliente_num' | 'tipo' | 'direccion_propiedades'>
