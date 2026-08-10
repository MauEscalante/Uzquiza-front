import { useEffect, useState } from 'react'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency } from '../services/api'
import { listAjustes } from '../services/ajustesService'
import { listClientes } from '../services/clientesService'
import { listContratos } from '../services/contratosService'
import { listPropiedades } from '../services/propiedadesService'
import { listRecibos } from '../services/recibosService'
import type { Ajuste } from '../types/ajuste'
import type { Cliente } from '../types/cliente'
import type { Contrato } from '../types/contrato'
import type { Propiedad } from '../types/propiedad'
import type { Recibo } from '../types/recibo'
import styles from './Dashboard.module.css'

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

function Dashboard() {
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
          listRecibos(),
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

  return (
    <div className={styles.page}>
      {loading ? <div className={styles.statusBox}>Cargando dashboard...</div> : null}
      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <section className={styles.metricGrid}>
        {metrics.map((metric) => (
          <Card key={metric.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span>{metric.label}</span>
              <StatusBadge variant={metric.accent}>{metric.label.split(' ')[0]}</StatusBadge>
            </div>
            <strong>{metric.value}</strong>
          </Card>
        ))}
      </section>

      <section className={styles.twoColumn}>
        <Card title="Actividad reciente" subtitle="Últimos movimientos del sistema">
          <ul className={styles.list}>
            {recentActivity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card title="Próximos ajustes de alquiler" subtitle="Contratos con revisión en el corto plazo">
          <div className={styles.adjustmentList}>
            {state.ajustes.slice(0, 3).map((ajuste) => (
              <article key={ajuste.id} className={styles.adjustmentItem}>
                <div>
                  <strong>{ajuste.contrato}</strong>
                  <p>{ajuste.propiedad}</p>
                </div>
                <div>
                  <StatusBadge variant={ajuste.estado === 'Ajuste realizado' ? 'success' : ajuste.estado === 'Ajuste pendiente' ? 'warning' : 'info'}>{ajuste.estado}</StatusBadge>
                  <span>{formatCurrency(ajuste.nuevoImporte)}</span>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default Dashboard