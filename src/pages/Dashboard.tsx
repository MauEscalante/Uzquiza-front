import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency } from '../services/api'
import { useDashboardController } from '../controllers/useDashboardController'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { loading, error, metrics, recentActivity, contratosPorVencer } = useDashboardController()

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

        <Card title="Próximos contratos a vencer" subtitle="Contratos activos que vencen en los próximos 90 días">
          <div className={styles.adjustmentList}>
            {contratosPorVencer.length === 0 ? <p>No hay contratos por vencer.</p> : null}
            {contratosPorVencer.slice(0, 3).map((contrato) => (
              <article key={contrato.contrato_id} className={styles.adjustmentItem}>
                <div>
                  <strong>{contrato.direccion}</strong>
                  <p>{`Contrato ${contrato.contrato_id}`}</p>
                </div>
                <div>
                  <StatusBadge variant="warning">{`Vence ${contrato.fecha_fin}`}</StatusBadge>
                  <span>{formatCurrency(contrato.importe_inicial)}</span>
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
