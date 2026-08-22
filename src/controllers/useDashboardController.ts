import { useEffect, useMemo, useState } from 'react'
import { mensajeDe } from '../services/api'
import { listClientes } from '../services/clientesService'
import { listContratos } from '../services/contratosService'
import { listEventosRecientes } from '../services/eventosService'
import { listPropiedades } from '../services/propiedadesService'
import type { Cliente } from '../types/cliente'
import type { Contrato } from '../types/contrato'
import type { Evento } from '../types/evento'
import { hoy } from '../types/libroDiario'
import type { Propiedad } from '../types/propiedad'

/** Ventana que define "por vencer": un contrato que termina dentro de 60 días. */
export const DIAS_POR_VENCER = 60

/** Ventana de la actividad reciente. */
const DIAS_ACTIVIDAD = 7

const MS_POR_DIA = 24 * 60 * 60 * 1000

interface DashboardState {
  clientes: Cliente[]
  propiedades: Propiedad[]
  contratos: Contrato[]
  eventos: Evento[]
}

const initialState: DashboardState = {
  clientes: [],
  propiedades: [],
  contratos: [],
  eventos: [],
}

export interface ContratoPorVencer {
  contratoId: string
  direccion: string
  inquilino: string | null
  fechaFin: string
  diasRestantes: number
}

/**
 * Fecha ISO a `dias` días de hoy.
 *
 * Se parte de hoy() y no de new Date(), que en UTC-3 después de las 21:00 ya
 * devuelve la fecha de mañana y correría la ventana un día entero.
 */
function fechaEn(dias: number): string {
  const [anio, mes, dia] = hoy().split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia + dias)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

/** Días entre dos fechas ISO. Ambas se leen como mediodía local para esquivar el DST. */
function diasEntre(desde: string, hasta: string): number {
  const aFecha = (iso: string) => {
    const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number)
    return new Date(anio, mes - 1, dia, 12)
  }
  return Math.round((aFecha(hasta).getTime() - aFecha(desde).getTime()) / MS_POR_DIA)
}

export function useDashboardController() {
  const [state, setState] = useState<DashboardState>(initialState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const [clientes, propiedades, contratos, eventos] = await Promise.all([
          listClientes(),
          listPropiedades(),
          listContratos(),
          listEventosRecientes(DIAS_ACTIVIDAD),
        ])

        if (!mounted) {
          return
        }

        setState({ clientes, propiedades, contratos, eventos })
      } catch (e) {
        if (mounted) {
          setError(mensajeDe(e, 'No se pudo cargar el dashboard.'))
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

  /**
   * Contratos activos que terminan dentro de la ventana, del más urgente al menos.
   *
   * Las fechas se comparan como strings ISO: en formato YYYY-MM-DD el orden
   * alfabético coincide con el cronológico, así que no hace falta construir Date
   * ni arriesgarse a un corrimiento de zona horaria.
   */
  const contratosPorVencer = useMemo<ContratoPorVencer[]>(() => {
    const desde = hoy()
    const hasta = fechaEn(DIAS_POR_VENCER)
    // La dirección y el inquilino vigente ya vienen en la propiedad, así que el
    // cruce evita pedir el detalle de cada contrato por separado.
    const porId = new Map(state.propiedades.map((propiedad) => [propiedad.propiedad_id, propiedad]))

    return state.contratos
      .filter((contrato) => {
        if (contrato.estado !== 'Activo' || !contrato.fecha_fin) {
          return false
        }
        const fin = contrato.fecha_fin.slice(0, 10)
        return fin >= desde && fin <= hasta
      })
      .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))
      .map((contrato) => {
        const propiedad = porId.get(contrato.propiedad)
        return {
          contratoId: contrato.contrato_id,
          direccion: propiedad?.direccion ?? `Propiedad ${contrato.propiedad}`,
          inquilino: propiedad?.inquilino ?? null,
          fechaFin: contrato.fecha_fin,
          diasRestantes: diasEntre(desde, contrato.fecha_fin),
        }
      })
  }, [state.contratos, state.propiedades])

  const metrics = useMemo(
    () => [
      {
        label: 'Propiedades activas',
        value: state.propiedades.filter((propiedad) => propiedad.estado === 'Activa').length,
        accent: 'info' as const,
      },
      {
        label: 'Total de clientes',
        value: state.clientes.length,
        accent: 'neutral' as const,
      },
      {
        label: 'Contratos por vencer',
        value: contratosPorVencer.length,
        accent: 'warning' as const,
      },
      {
        label: 'Contratos activos',
        value: state.contratos.filter((contrato) => contrato.estado === 'Activo').length,
        accent: 'success' as const,
      },
      {
        label: 'Propiedades que adeudan',
        value: state.propiedades.filter(
          (propiedad) => propiedad.estado === 'Activa' && propiedad.estado_alquiler === 'Adeuda',
        ).length,
        accent: 'danger' as const,
      },
    ],
    [state.propiedades, state.clientes, state.contratos, contratosPorVencer],
  )

  return {
    loading,
    error,
    metrics,
    contratosPorVencer,
    actividad: state.eventos,
    diasActividad: DIAS_ACTIVIDAD,
  }
}
