import Card from '../components/Card'
import Select from '../components/Select'
import Table from '../components/Table'
import { formatCurrency } from '../services/api'
import { monthOptions, yearOptions } from '../controllers/periodo'
import { useAjustesController } from '../controllers/useAjustesController'
import { formatPropiedadId } from '../services/propiedadesService'
import styles from './Ajustes.module.css'

function Ajustes() {
  const {
    loading,
    error,
    ajustes,
    mes,
    setMes,
    anio,
    setAnio,
  } = useAjustesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Ajustes</h2>
            <p>Contratos a los que les toca ajuste en el período seleccionado</p>
          </div>
          <div className={styles.filters}>
            <Select label="Mes" options={monthOptions} value={mes} onChange={(event) => setMes(event.target.value)} />
            <Select label="Año" options={yearOptions} value={anio} onChange={(event) => setAnio(event.target.value)} />
          </div>
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando ajustes...</div></Card> : null}

      {!loading && ajustes.length === 0 ? (
        <Card><div className={styles.emptyState}>No hay ajustes pendientes para {mes} {anio}.</div></Card>
      ) : null}

      {!loading && ajustes.length > 0 ? (
        <Table headers={["Contrato", "Propiedad", "Importe vigente", "Tipo de ajuste", "Periodicidad", "Vence"]}>
          {ajustes.map((ajuste) => (
            <tr key={ajuste.contrato_id}>
              <td>{ajuste.contrato_id}</td>
              <td>{formatPropiedadId(ajuste.propiedad)}</td>
              <td>{formatCurrency(ajuste.importe_inicial)}</td>
              <td>{ajuste.tipo_ajuste ?? '—'}</td>
              <td>{ajuste.periodicidad ?? '—'}</td>
              <td>{ajuste.fecha_fin}</td>
            </tr>
          ))}
        </Table>
      ) : null}
    </div>
  )
}

export default Ajustes
