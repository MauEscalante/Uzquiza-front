export type ClienteTipo = 'Inquilino' | 'Propietario'

export interface Cliente {
  /** La PK de la tabla `cliente`. Es lo que devuelve la API, no un `id`. */
  cliente_num: number
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

export type ClienteFormValues = Omit<Cliente, 'cliente_num' | 'tipo'>

/** Un período de vigencia del alquiler, tal como sale de `valor_historico`. */
export interface ClienteValorHistorico {
  contrato: string
  direccion: string
  fecha_inicio: string
  fecha_fin: string
  importe_inicial: number
}