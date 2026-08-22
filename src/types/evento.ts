/**
 * Tipos de evento que registra el backend.
 *
 * `llaves_recibidas` todavía no lo emite nadie: la recepción de llaves no existe
 * como funcionalidad. Está declarado para no tener que tocar el tipo al sumarla.
 */
export type TipoEvento =
  | 'contrato_creado'
  | 'propiedad_creada'
  | 'propietario_creado'
  | 'llaves_recibidas'

export interface Evento {
  evento_id: number
  /** String suelto y no TipoEvento: el backend puede sumar tipos sin romper el front. */
  tipo: string
  /** Texto ya armado por el backend, listo para mostrar. */
  descripcion: string
  /** A qué recurso apunta; null en los eventos que no refieren a una entidad. */
  entidad_tipo: string | null
  entidad_id: string | null
  /** ISO 8601 con hora, a diferencia de las fechas del resto de la API. */
  creado_en: string
}
