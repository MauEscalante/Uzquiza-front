export type PropiedadEstado = 'Activa' | 'Inactiva'
export type EstadoAlquiler = 'Abono' | 'Adeuda'

export interface Propiedad {
  propiedad_id: number
  direccion: string
  ambientes: number | null
  /** Nombre completo; si hay varios propietarios vienen separados por ", ". */
  propietario: string | null
  /** Nombre completo del inquilino del contrato vigente a la fecha. */
  inquilino: string | null
  /** Solo lectura: la comisión pertenece al propietario, se administra desde Clientes. */
  comision: number | null
  estado: PropiedadEstado
  estado_alquiler: EstadoAlquiler
}

export interface PropiedadPropietarioDetalle {
  cliente_num: number
  nombre: string
  /** Qué parte de la comisión le corresponde a este propietario. */
  porcentaje: number
  comision: number | null
}

export interface PropiedadDetalle extends Propiedad {
  propietarios: PropiedadPropietarioDetalle[]
}

export interface PropiedadCreateValues {
  direccion: string
  ambientes: number | null
}

export interface PropiedadUpdateValues extends PropiedadCreateValues {
  estado: PropiedadEstado
  estado_alquiler: EstadoAlquiler
}
