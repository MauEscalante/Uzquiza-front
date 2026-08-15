import { useEffect, useMemo, useState } from 'react'
import {   listAjustes } from '../services/ajustesService'
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
    openHistory,
  }
}