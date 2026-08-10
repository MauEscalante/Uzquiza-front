export type PropiedadEstado = 'Disponible' | 'Alquilada' | 'Mantenimiento'

export interface Propiedad {
  id: string
  direccion: string
  propietario: string
  inquilino: string
  estado: PropiedadEstado
}

export type PropiedadFormValues = Omit<Propiedad, 'id'>