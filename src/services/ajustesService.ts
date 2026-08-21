import type { Ajuste } from '../types/ajuste'

const mockAjustes: Ajuste[] = [
  {
    id: '1',
    propiedad: 'Av. San Martín 1234',
    inquilino: 'Ana Pérez',
    importeAnterior: 320000,
    tipoAjuste: 'IPC',
    periodicidad: 'Trimestral',
    fechaProximoAjuste: '2026-09-01',
    nuevoImporte: 336000,
    estado: 'Ajuste próximo',
    actualizacion: 'Ajuste',
    historial: [
      { fecha: '2025-01-01', detalle: 'Ajuste inicial' },
      { fecha: '2025-04-01', detalle: 'Subió 5%' },
    ],
  },
  {
    id: '2',
    propiedad: 'Italia 789',
    inquilino: 'Julián Gómez',
    importeAnterior: 285000,
    tipoAjuste: 'ICL',
    periodicidad: 'Semestral',
    fechaProximoAjuste: '2026-07-01',
    nuevoImporte: 301500,
    estado: 'Ajuste pendiente',
    actualizacion: 'Re Ajuste',
    historial: [
      { fecha: '2024-07-01', detalle: 'Ajuste por inflación' },
      { fecha: '2025-01-01', detalle: 'Reajuste anual' },
    ],
  },
]

// Los ajustes todavía no tienen backend: esta pantalla se sirve de datos de ejemplo.
export async function listAjustes(): Promise<Ajuste[]> {
  return mockAjustes
}

// Se eliminó chequearHistorial: apuntaba a /ajuste/historial/{id}/, un endpoint
// que no existe en el backend, y no la llamaba nadie.




