import { useEffect, useState } from 'react'
import { listContratosPendientes } from '../services/recibosService'
import { currentMonthName, currentYearValue, mesANumero } from './periodo'
import type { ContratoAAjustar } from '../types/recibo'

export function useAjustesController() {
  const [ajustes, setAjustes] = useState<ContratoAAjustar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mes, setMes] = useState(currentMonthName)
  const [anio, setAnio] = useState(currentYearValue)

  useEffect(() => {
    let mounted = true

    async function loadAjustes() {
      try {
        const data = await listContratosPendientes(mesANumero(mes), Number(anio))
        if (mounted) {
          setAjustes(data)
          setError('')
        }
      } catch {
        if (mounted) {
          setAjustes([])
          setError('No se pudieron cargar los ajustes.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadAjustes()

    return () => {
      mounted = false
    }
  }, [mes, anio])

  // El spinner se prende desde el handler y no desde el efecto: así el cambio de
  // período no dispara un render en cascada.
  function cambiarMes(value: string) {
    setLoading(true)
    setMes(value)
  }

  function cambiarAnio(value: string) {
    setLoading(true)
    setAnio(value)
  }

  return {
    loading,
    error,
    ajustes,
    mes,
    setMes: cambiarMes,
    anio,
    setAnio: cambiarAnio,
  }
}
