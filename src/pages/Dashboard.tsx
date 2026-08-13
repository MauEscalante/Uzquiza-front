import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency } from '../services/api'
import { useDashboardController } from '../controllers/useDashboardController'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { loading, error, metrics, recentActivity, state } = useDashboardController()

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