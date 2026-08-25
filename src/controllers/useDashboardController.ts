import { useEffect, useMemo, useState } from 'react'
import { contarClientes, listClientes } from '../services/clientesService'
import { contarContratosActivos, listContratos } from '../services/contratosService'
import { contarPropiedades, listPropiedades } from '../services/propiedadesService'
import type { Cliente } from '../types/cliente'
import type { Contrato } from '../types/contrato'
import type { Propiedad } from '../types/propiedad'

interface DashboardState {
  clientes: Cliente[]
  propiedades: Propiedad[]
  contratos: Contrato[]
}

/** Los totales salen del envelope y no de items.length: los listados vienen
 * recortados a PAGE_SIZE_MAX y hoy ya hay más propiedades y clientes que eso. */
interface DashboardTotals {
  propiedades: number
  clientes: number
  contratosActivos: number
}

const initialState: DashboardState = {
  clientes: [],
  propiedades: [],
  contratos: [],
}

const initialTotals: DashboardTotals = {
  propiedades: 0,
  clientes: 0,
  contratosActivos: 0,
}

/** Ventana que se considera "a vencer" para un contrato activo. */
const DIAS_POR_VENCER = 90

export interface ContratoPorVencer {
  contrato_id: string
  direccion: string
  fecha_fin: string
  importe_inicial: number
}

export function useDashboardController() {
  const [state, setState] = useState<DashboardState>(initialState)
  const [totals, setTotals] = useState<DashboardTotals>(initialTotals)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const [clientes, propiedades, contratos, totalClientes, totalPropiedades, contratosActivos] = await Promise.all([
          listClientes(),
          listPropiedades(),
          listContratos(),
          contarClientes(),
          contarPropiedades(),
          contarContratosActivos(),
        ])

        if (!mounted) {
          return
        }

        setState({ clientes, propiedades, contratos })
        setTotals({ propiedades: totalPropiedades, clientes: totalClientes, contratosActivos })
      } catch {
        if (mounted) {
          setError('No se pudo cargar el dashboard.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      mounted = false
    }
  }, [])

  // El back no tiene un endpoint de vencimientos: se derivan de los contratos
  // activos que ya se cargaron para las métricas.
  const contratosPorVencer = useMemo<ContratoPorVencer[]>(() => {
    const hoy = new Date()
    const limite = new Date(hoy)
    limite.setDate(limite.getDate() + DIAS_POR_VENCER)

    const direcciones = new Map(state.propiedades.map((propiedad) => [propiedad.propiedad_id, propiedad.direccion]))

    return state.contratos
      .filter((contrato) => {
        if (contrato.estado !== 'Activo') {
          return false
        }

        const fechaFin = new Date(contrato.fecha_fin)
        return fechaFin >= hoy && fechaFin <= limite
      })
      .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))
      .map((contrato) => ({
        contrato_id: contrato.contrato_id,
        direccion: direcciones.get(contrato.propiedad) ?? String(contrato.propiedad),
        fecha_fin: contrato.fecha_fin,
        importe_inicial: contrato.importe_inicial,
      }))
  }, [state.contratos, state.propiedades])

  const metrics = [
    { label: 'Total de propiedades', value: totals.propiedades, accent: 'info' as const },
    { label: 'Total de clientes', value: totals.clientes, accent: 'neutral' as const },
    { label: 'Contratos activos', value: totals.contratosActivos, accent: 'success' as const },
    { label: 'Contratos a vencer', value: contratosPorVencer.length, accent: 'warning' as const },
  ]

  const recentActivity = [
    'Se registró un nuevo contrato para Av. San Martín 1234.',
    'Se calculó el próximo ajuste para el contrato CTR-2401.',
    'Se generó el recibo mensual de Julio 2026.',
  ]

  return {
    loading,
    error,
    metrics,
    recentActivity,
    contratosPorVencer,
    state,
  }
}
