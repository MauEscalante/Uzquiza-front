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

/** Fila del selector de propietarios existentes (GET /clientes?tipo=Propietario). */
export interface PropietarioResumen {
  cliente_num: number
  nombre: string
  apellido: string
  dni: string
  comision: number | null
}

/** Propietario dentro del alta: o uno existente por cliente_num, o uno a crear. */
export interface PropiedadPropietarioInput {
  cliente_num?: number
  porcentaje: number
  nombre?: string
  apellido?: string
  telefono?: string
  nacionalidad?: string
  dni?: string
  cuil?: string
  direccion?: string
  email?: string
}

/** Estado del formulario. clienteNum vacío significa propietario nuevo. */
export interface PropietarioFormValue {
  clienteNum: string
  porcentaje: string
  nombre: string
  apellido: string
  telefono: string
  nacionalidad: string
  dni: string
  cuil: string
  domicilioLegal: string
  domicilioElectronico: string
}

export const emptyPropietario: PropietarioFormValue = {
  clienteNum: '',
  porcentaje: '',
  nombre: '',
  apellido: '',
  telefono: '',
  nacionalidad: '',
  dni: '',
  cuil: '',
  domicilioLegal: '',
  domicilioElectronico: '',
}

export interface PropiedadCreateValues {
  direccion: string
  ambientes: number | null
  /** Es una sola para la propiedad: la comparten todos sus propietarios. */
  comision: number
  propietarios: PropiedadPropietarioInput[]
}

/** La edición no toca propietarios ni comisión, por eso no extiende el alta. */
export interface PropiedadUpdateValues {
  direccion: string
  ambientes: number | null
  estado: PropiedadEstado
  estado_alquiler: EstadoAlquiler
}
