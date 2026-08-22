import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../services/api'
import { DIAS_POR_VENCER, useDashboardController } from '../controllers/useDashboardController'
import styles from './Dashboard.module.css'

/** Cuanto más cerca del vencimiento, más fuerte el color. */
function urgencia(diasRestantes: number) {
  if (diasRestantes <= 15) {
    return 'danger' as const
  }
  return diasRestantes <= 30 ? ('warning' as const) : ('info' as const)
}

function textoRestante(diasRestantes: number) {
  if (diasRestantes <= 0) {
    return 'Vence hoy'
  }
  return diasRestantes === 1 ? 'Falta 1 día' : `Faltan ${diasRestantes} días`
}

function Dashboard() {
  const { loading, error, metrics, contratosPorVencer, actividad, diasActividad } = useDashboardController()

  return (
    <div className={styles.page}>
      {loading ? <div className={styles.statusBox}>Cargando dashboard...</div> : null}
      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <section className={styles.metricGrid}>
        {metrics.map((metric) => (
          <Card key={metric.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span>{metric.label}</span>
            </div>
            <strong>{metric.value}</strong>
          </Card>
        ))}
      </section>

      <section className={styles.twoColumn}>
        <Card title="Actividad reciente" subtitle={`Altas de los últimos ${diasActividad} días`}>
          {actividad.length === 0 ? (
            <p className={styles.empty}>Sin actividad en los últimos {diasActividad} días.</p>
          ) : (
            <ul className={styles.list}>
              {actividad.map((evento) => (
                <li key={evento.evento_id}>
                  <span>{evento.descripcion}</span>
                  <time dateTime={evento.creado_en}>{formatDate(evento.creado_en)}</time>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Próximos contratos a vencer" subtitle={`Contratos que terminan dentro de ${DIAS_POR_VENCER} días`}>
          {contratosPorVencer.length === 0 ? (
            <p className={styles.empty}>No hay contratos por vencer en los próximos {DIAS_POR_VENCER} días.</p>
          ) : (
            <div className={styles.vencimientoList}>
              {contratosPorVencer.map((contrato) => (
                <article key={contrato.contratoId} className={styles.vencimientoItem}>
                  <div>
                    <strong>{contrato.direccion}</strong>
                    <p>{contrato.inquilino ?? 'Sin inquilino asignado'}</p>
                  </div>
                  <div>
                    <StatusBadge variant={urgencia(contrato.diasRestantes)}>
                      {textoRestante(contrato.diasRestantes)}
                    </StatusBadge>
                    <span>{formatDate(contrato.fechaFin)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

export default Dashboard
