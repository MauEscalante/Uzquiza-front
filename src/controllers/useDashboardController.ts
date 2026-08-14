import { useEffect, useState } from 'react'
import { listAjustes } from '../services/ajustesService'
import { listClientes } from '../services/clientesService'
import { listContratos } from '../services/contratosService'
import { listPropiedades } from '../services/propiedadesService'
import { listHistorialIngreso } from '../services/recibosService'
import type { Ajuste } from '../types/ajuste'
import type { Cliente } from '../types/cliente'
import type { Contrato } from '../types/contrato'
import type { Propiedad } from '../types/propiedad'
import type { Recibo } from '../types/recibo'

interface DashboardState {
  clientes: Cliente[]
  propiedades: Propiedad[]
  contratos: Contrato[]
  ajustes: Ajuste[]
  recibos: Recibo[]
}

const initialState: DashboardState = {
  clientes: [],
  propiedades: [],
  contratos: [],
  ajustes: [],
  recibos: [],
}

export function useDashboardController() {
  const [state, setState] = useState<DashboardState>(initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const [clientes, propiedades, contratos, ajustes, recibos] = await Promise.all([
          listClientes(),
          listPropiedades(),
          listContratos(),
          listAjustes(),
          listHistorialIngreso(),
        ])

        if (!mounted) {
          return
        }

        setState({ clientes, propiedades, contratos, ajustes, recibos })
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

  const metrics = [
    { label: 'Total de propiedades', value: state.propiedades.length, accent: 'info' as const },
    { label: 'Total de clientes', value: state.clientes.length, accent: 'neutral' as const },
    { label: 'Contratos activos', value: state.contratos.filter((contrato) => contrato.estado === 'Activo').length, accent: 'success' as const },
    { label: 'Ajustes próximos', value: state.ajustes.filter((ajuste) => ajuste.estado === 'Ajuste próximo').length, accent: 'warning' as const },
    { label: 'Recibos generados', value: state.recibos.length, accent: 'danger' as const },
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
    state,
  }
}