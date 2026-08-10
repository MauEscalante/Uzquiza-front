import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { aplicarAjuste, calcularAjuste, listAjustes } from '../services/ajustesService'
import { formatCurrency } from '../services/api'
import type { Ajuste } from '../types/ajuste'
import styles from './Ajustes.module.css'

function Ajustes() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedAjuste, setSelectedAjuste] = useState<Ajuste | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAjustes() {
      try {
        const data = await listAjustes()
        if (mounted) {
          setAjustes(data)
        }
      } catch {
        if (mounted) {
          setError('No se pudieron cargar los ajustes.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadAjustes()

    return () => {
      mounted = false
    }
  }, [])

  const visibleAjustes = useMemo(() => ajustes, [ajustes])

  async function handleCalcular(ajuste: Ajuste) {
    const updated = await calcularAjuste(ajuste.id)
    setAjustes((current) => current.map((entry) => (entry.id === ajuste.id ? updated : entry)))
    setFeedback('Ajuste calculado correctamente.')
  }

  async function handleAplicar(ajuste: Ajuste) {
    const shouldApply = window.confirm(`¿Aplicar el ajuste del contrato ${ajuste.contrato}?`)
    if (!shouldApply) {
      return
    }

    const updated = await aplicarAjuste(ajuste.id)
    setAjustes((current) => current.map((entry) => (entry.id === ajuste.id ? updated : entry)))
    setFeedback('Ajuste aplicado correctamente.')
  }

  function openHistory(ajuste: Ajuste) {
    setSelectedAjuste(ajuste)
    setHistoryOpen(true)
  }

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Ajustes</h2>
            <p>Tabla prioritaria para seguimiento de próximos ajustes de alquiler.</p>
          </div>
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando ajustes...</div></Card> : null}

      {!loading && visibleAjustes.length === 0 ? <Card><div className={styles.emptyState}>No hay ajustes para mostrar.</div></Card> : null}

      {!loading && visibleAjustes.length > 0 ? (
        <Table headers={["Contrato", "Propiedad", "Inquilino", "Importe actual", "Tipo de ajuste", "Periodicidad", "Fecha del próximo ajuste", "Nuevo importe", "Estado", "Acciones"]}>
          {visibleAjustes.map((ajuste) => (
            <tr key={ajuste.id}>
              <td><StatusBadge variant="info">{ajuste.contrato}</StatusBadge></td>
              <td>{ajuste.propiedad}</td>
              <td>{ajuste.inquilino}</td>
              <td>{formatCurrency(ajuste.importeActual)}</td>
              <td>{ajuste.tipoAjuste}</td>
              <td>{ajuste.periodicidad}</td>
              <td>{ajuste.fechaProximoAjuste}</td>
              <td>{formatCurrency(ajuste.nuevoImporte)}</td>
              <td>
                <StatusBadge variant={ajuste.estado === 'Ajuste realizado' ? 'success' : ajuste.estado === 'Ajuste pendiente' ? 'warning' : 'info'}>{ajuste.estado}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => void handleCalcular(ajuste)}>Calcular ajuste</Button>
                  <Button variant="ghost" onClick={() => void handleAplicar(ajuste)}>Aplicar ajuste</Button>
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