import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Table from '../components/Table'
import { formatCurrency } from '../services/api'
import { useAjustesController } from '../controllers/useAjustesController'
import styles from './Ajustes.module.css'

function Ajustes() {
  const {
    loading,
    error,
    feedback,
    visibleAjustes,
    historyOpen,
    setHistoryOpen,
    selectedAjuste,
    openHistory,
  } = useAjustesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Ajustes</h2>
            <p>Tabla de ajustes y re ajustes de alquileres</p>
          </div>
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando ajustes...</div></Card> : null}

      {!loading && visibleAjustes.length === 0 ? <Card><div className={styles.emptyState}>No hay ajustes para mostrar.</div></Card> : null}

      {!loading && visibleAjustes.length > 0 ? (
        <Table headers={["Propiedad", "Inquilino", "Importe anterior", "Tipo de ajuste", "Periodicidad", "Nuevo importe", "Tipo", "Acciones"]}>
          {visibleAjustes.map((ajuste) => (

            <tr key={ajuste.id}>
              <td>{ajuste.propiedad}</td>
              <td>{ajuste.inquilino}</td>
              <td>{formatCurrency(ajuste.importeAnterior)}</td>
              <td>{ajuste.tipoAjuste}</td>
              <td>{ajuste.periodicidad}</td>
              <td>{formatCurrency(ajuste.nuevoImporte)}</td>
              <td>{ajuste.actualizacion}</td>
              <td>
                <div className={styles.actions}>
                  <Button variant="danger" onClick={() => openHistory(ajuste)}>Ver historial</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal open={historyOpen} title="Historial de ajuste" onClose={() => setHistoryOpen(false)} footer={<Button variant="ghost" onClick={() => setHistoryOpen(false)}>Cerrar</Button>}>
        {selectedAjuste ? (
          <div className={styles.historyList}>
            {selectedAjuste.historial.map((item) => (
              <article key={`${item.fecha}-${item.detalle}`}>
                <strong>{item.fecha}</strong>
                <p>{item.detalle}</p>
              </article>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Ajustes