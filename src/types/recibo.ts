export interface Recibo {
  id: string
  contrato: string
  inquilino: string
  mes: string
  anio: string
  importeAlquiler: number
  comision: number
  otrosConceptos: number
  total: number
  estado: string
}

export interface ReciboFormValues {
  contrato: string
  inquilino: string
  mes: string
  anio: string
}