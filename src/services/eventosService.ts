import { fetchAllPages } from './api'
import type { Evento } from '../types/evento'

/**
 * Actividad de los últimos días, del evento más nuevo al más viejo.
 *
 * La bitácora arranca vacía: solo registra lo que se da de alta desde que la
 * tabla existe, porque contrato y cliente no guardan fecha de creación.
 */
export async function listEventosRecientes(dias = 7): Promise<Evento[]> {
  return fetchAllPages<Evento>('/eventos', 'Error al cargar la actividad reciente', {
    dias: String(dias),
  })
}
