/** Mes y año: los selectores comparten opciones entre Recibos y Ajustes, y el
 * back siempre pide el mes como número 1-12 mientras el form usa nombres. */

export const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

/** Nombre del mes -> índice base 0. También ordena el historial. */
export const monthOrder = new Map(monthNames.map((month, index) => [month, index]))

export function mesANumero(mes: string) {
  return (monthOrder.get(mes) ?? 0) + 1
}

const currentDate = new Date()
const currentYear = currentDate.getFullYear()

export const currentMonthName = monthNames[currentDate.getMonth()]
export const currentYearValue = String(currentYear)

export const monthOptions = monthNames.map((month) => ({ label: month, value: month }))

export const yearOptions = Array.from({ length: 4 }, (_, index) => String(currentYear - 1 + index))
  .map((year) => ({ label: year, value: year }))
