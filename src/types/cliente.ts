/** Un cliente puede ser las dos cosas: propietario de una propiedad e inquilino de otra. */
export type ClienteTipo = 'Inquilino' | 'Propietario' | 'Ambos'

export interface Cliente {
  /** La PK de la tabla `cliente`. Es lo que devuelve la API, no un `id`. */
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

/** Un período de vigencia del alquiler, tal como sale de `valor_historico`. */
export interface ClienteValorHistorico {
  contrato: string
  direccion: string
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
}
