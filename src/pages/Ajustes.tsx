import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { cell } from '../components/tableCells'
import { useAjustesController } from '../controllers/useAjustesController'
import { monthOptions, yearOptions } from '../controllers/useRecibosController.tsx'
import styles from './Ajustes.module.css'

function Ajustes() {
  const {
    loading,
    error,
    feedback,
    pendientes,
    mes,
    setMes,
    anio,
    setAnio,
    ajustando,
    handleAjustar,
    historyOpen,
    setHistoryOpen,
    selectedContrato,
    historial,
    historialLoading,
    historialError,
    openHistory,
    formatCurrency,
    formatDate,
  } = useAjustesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Ajustes</h2>
            <p>
              Alquileres a los que les toca aumento en el período elegido. Cuando el IPC
              del último mes todavía no salió, el ajuste se hace con el anterior y queda
              un <strong>Re Ajuste</strong> pendiente para el mes que viene.
            </p>
          </div>
          <Button onClick={() => void handleAjustar()} disabled={ajustando || loading || pendientes.length === 0}>
            {ajustando ? 'Ajustando...' : 'Ajustar'}
          </Button>
        </div>

        <div className={styles.filters}>
          <Select label="Mes" options={monthOptions} value={mes} onChange={(event) => setMes(event.target.value)} />
          <Select label="Año" options={yearOptions} value={anio} onChange={(event) => setAnio(event.target.value)} />
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando ajustes...</div></Card> : null}

      {!loading && pendientes.length === 0 ? (
        <Card><div className={styles.emptyState}>No hay alquileres para ajustar en este período.</div></Card>
      ) : null}

      {!loading && pendientes.length > 0 ? (
        <Table
          headers={[
            'Propiedad',
            'Inquilino',
            { label: 'Alquiler vigente', money: true },
            'Vigente desde',
            'Tipo',
            'Índice',
            'Periodicidad',
            'Acciones',
          ]}
        >
          {pendientes.map((ajuste) => (
            <tr key={ajuste.contrato_id}>
              <td>{ajuste.direccion}</td>
              <td>{ajuste.inquilino ?? '—'}</td>
              <td className={cell.money}>
                {ajuste.importe_vigente != null ? formatCurrency(ajuste.importe_vigente) : '—'}
              </td>
              <td className={cell.dato}>
                {ajuste.importe_vigente_desde ? formatDate(ajuste.importe_vigente_desde) : '—'}
              </td>
              <td>
                {/*
                  Un re-ajuste no es un aumento nuevo: es el del mes pasado, que se
                  hizo con un índice repetido, rehecho con el que ya salió.
                */}
                <StatusBadge variant={ajuste.tipo === 'Re Ajuste' ? 'warning' : 'info'}>
                  {ajuste.tipo}
                </StatusBadge>
              </td>
              <td>{ajuste.tipo_ajuste ?? '—'}</td>
              <td>{ajuste.periodicidad ?? '—'}</td>
              <td>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => void openHistory(ajuste)}>Ver historial</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal
        open={historyOpen}
        title={selectedContrato ? `Historial de ${selectedContrato.direccion}` : 'Historial de alquileres'}
        onClose={() => setHistoryOpen(false)}
        footer={<Button variant="ghost" onClick={() => setHistoryOpen(false)}>Cerrar</Button>}
      >
        {historialLoading ? <div className={styles.emptyState}>Cargando historial...</div> : null}
        {historialError ? <div className={styles.error}>{historialError}</div> : null}

        {!historialLoading && !historialError && historial.length === 0 ? (
          <div className={styles.emptyState}>Este contrato todavía no tiene tramos cargados.</div>
        ) : null}

        {!historialLoading && historial.length > 0 ? (
          <div className={styles.historyList}>
            {/* Un tramo por ajuste: cada aumento cierra el anterior y abre este. */}
            {historial.map((tramo) => (
              <article key={tramo.fecha_inicio}>
                <strong>{formatCurrency(tramo.importe_inicial)}</strong>
                <p>
                  Desde {formatDate(tramo.fecha_inicio)} hasta {formatDate(tramo.fecha_fin)}
                  {tramo.provisorio ? ' — provisorio, con un índice de IPC repetido' : ''}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Ajustes
