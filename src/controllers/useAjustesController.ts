import { useEffect, useMemo, useState } from 'react'
import { aplicarAjuste, calcularAjuste, listAjustes } from '../services/ajustesService'
import type { Ajuste } from '../types/ajuste'

export function useAjustesController() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedAjuste, setSelectedAjuste] = useState<Ajuste | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAjustes() {
      try {
        const data = await listAjustes()
        if (mounted) {
          setAjustes(data)
        }
      } catch {
        if (mounted) {
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
  }, [])

  const visibleAjustes = useMemo(() => ajustes, [ajustes])

  async function handleCalcular(ajuste: Ajuste) {
    const updated = await calcularAjuste(ajuste.id)
    setAjustes((current) => current.map((entry) => (entry.id === ajuste.id ? updated : entry)))
    setFeedback('Ajuste calculado correctamente.')
  }

  async function handleAplicar(ajuste: Ajuste) {
    const shouldApply = window.confirm(`¿Aplicar el ajuste del contrato ${ajuste.contrato}?`)
    if (!shouldApply) {
      return
    }

    const updated = await aplicarAjuste(ajuste.id)
    setAjustes((current) => current.map((entry) => (entry.id === ajuste.id ? updated : entry)))
    setFeedback('Ajuste aplicado correctamente.')
  }

  function openHistory(ajuste: Ajuste) {
    setSelectedAjuste(ajuste)
    setHistoryOpen(true)
  }

  return {
    loading,
    error,
    feedback,
    visibleAjustes,
    historyOpen,
    setHistoryOpen,
    selectedAjuste,
    handleCalcular,
    handleAplicar,
    openHistory,
  }
}