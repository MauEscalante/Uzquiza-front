import { useEffect, useState } from 'react'
import { formatCurrency, formatDate, mensajeDe } from '../services/api'
import { ajustarAlquileres, listHistorial, listPendientes } from '../services/ajustesService'
import type { AjustePendiente, TramoHistorial } from '../types/ajuste'

const hoy = new Date()

export function useAjustesController() {
  const [pendientes, setPendientes] = useState<AjustePendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [mes, setMes] = useState(String(hoy.getMonth() + 1))
  const [anio, setAnio] = useState(String(hoy.getFullYear()))
  const [ajustando, setAjustando] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState<AjustePendiente | null>(null)
  const [historial, setHistorial] = useState<TramoHistorial[]>([])
  const [historialLoading, setHistorialLoading] = useState(false)
  const [historialError, setHistorialError] = useState('')
  // Se incrementa después de ajustar para releer la tabla con los importes nuevos.
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let mounted = true

    async function cargar() {
      setLoading(true)
      try {
        const data = await listPendientes(Number(mes), Number(anio))
        if (mounted) {
          setPendientes(data)
          setError('')
        }
      } catch (e) {
        if (mounted) {
          setPendientes([])
          setError(mensajeDe(e, 'No se pudieron cargar los ajustes pendientes.'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void cargar()

    return () => {
      mounted = false
    }
  }, [mes, anio, recarga])

  async function handleAjustar() {
    setError('')
    setFeedback('')
    setAjustando(true)

    try {
      const resultado = await ajustarAlquileres(Number(mes), Number(anio))

      // Las dos cosas caen en la misma corrida y conviene decirlas por separado:
      // el re-ajuste no es un aumento nuevo, es el del mes pasado hecho en firme.
      const partes = []
      if (resultado.contratos_ajustados > 0) {
        partes.push(`${resultado.contratos_ajustados} de ${resultado.contratos_pendientes} alquileres ajustados`)
      }
      if (resultado.contratos_reajustados > 0) {
        partes.push(`${resultado.contratos_reajustados} de ${resultado.reajustes_pendientes} re-ajustados con el índice definitivo`)
      }

      setFeedback(
        partes.length > 0
          ? `Listo: ${partes.join(' y ')}.`
          : 'No quedaba nada por hacer: estos contratos ya tienen aplicado lo de este período.',
      )
      // La tabla muestra el importe vigente, así que recién acá se ve el nuevo.
      setRecarga((n) => n + 1)
    } catch (e) {
      setError(mensajeDe(e, 'No se pudieron ajustar los alquileres.'))
    } finally {
      setAjustando(false)
    }
  }

  async function openHistory(contrato: AjustePendiente) {
    setSelectedContrato(contrato)
    setHistorial([])
    setHistorialError('')
    setHistoryOpen(true)
    setHistorialLoading(true)

    try {
      setHistorial(await listHistorial(contrato.contrato_id))
    } catch (e) {
      setHistorialError(mensajeDe(e, 'No se pudo cargar el historial del contrato.'))
    } finally {
      setHistorialLoading(false)
    }
  }

  return {
    loading,
    error,
    feedback,
    pendientes,
    mes,
    setMes,
    anio,
    setAnio,
    ajustando,
    handleAjustar,
    historyOpen,
    setHistoryOpen,
    selectedContrato,
    historial,
    historialLoading,
    historialError,
    openHistory,
    formatCurrency,
    formatDate,
  }
}
