
import type { Recibo, ReciboFormValues } from '../types/recibo'

let recibos: Recibo[] = [
  { id: '082026', mes: 'Julio', anio: '2026', total: 341000 },
]

export async function listHistorialIngreso() {
  //obtengo los ingresos historicos por mes de la db (Falta la tabla)
}

export async function generarRecibo(values: ReciboFormValues) {

//actualiza todo el excel con los recibos
}

export async function descargarExcelMock() {
//descargo excel
}