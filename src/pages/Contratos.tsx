import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import {  periodicidadOptions, tipoAjusteOptions, useContratosController } from '../controllers/useContratosController'

import styles from './Contratos.module.css'

function Contratos() {
  const {
    loading,
    error,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    detailOpen,
    setDetailOpen,
    selectedContrato,
    editingContrato,
    form,
    setForm,
    formError,
    feedback,
    filteredContratos,
    openCreateModal,
    openDetail,
    handleSubmit,
    handleDelete,
    formatCurrency,
  } = useContratosController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Contratos</h2>
            <p>Formulario preparado para conexión futura con FastAPI.</p>
          </div>
          <Button onClick={openCreateModal}>Crear contrato</Button>
        </div>

        <div className={styles.filters}>
          <Input placeholder="Buscar por contrato, propiedad o estado" value={search} onChange={(event) => setSearch(event.target.value)} />
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando contratos...</div></Card> : null}

      {!loading && filteredContratos.length === 0 ? <Card><div className={styles.emptyState}>No hay contratos para mostrar.</div></Card> : null}

      {!loading && filteredContratos.length > 0 ? (
        <Table headers={[ "Propiedad", "Inquilino", "Inicio", "Fin", "Importe inicial", "Deposito", "Tipo de ajuste", "Periodicidad", "Estado", "Acciones"]}>
          {filteredContratos.map((contrato) => (
            <tr key={contrato.id}>
              <td>{contrato.propiedad}</td>
              <td>{contrato.inquilino}</td>
              <td>{contrato.fechaInicio}</td>
              <td>{contrato.fechaFin}</td>
              <td>{formatCurrency(contrato.importeActual)}</td>
              <td>{formatCurrency(contrato.importeActual)}</td>
              <td>{contrato.tipoAjuste}</td>
              <td>{contrato.periodicidad}</td>
              <td>
                <StatusBadge variant={contrato.estado === 'Activo' ? 'success' : contrato.estado === 'Próximo a vencer' ? 'warning' : 'neutral'}>{contrato.estado}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetail(contrato)}>Ver detalles</Button>
                  <Button variant="danger" onClick={() => void handleDelete(contrato)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal
        open={modalOpen}
        title={editingContrato ? 'Editar contrato' : 'Crear contrato'}
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="contrato-form">Guardar</Button>
          </>
        )}
      >
        <form id="contrato-form" className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      
          <Input label="Propiedad" value={form.propiedad} onChange={(event) => setForm((current) => ({ ...current, propiedad: event.target.value }))} />
          <Input label="Inquilino" value={form.inquilino} onChange={(event) => setForm((current) => ({ ...current, inquilino: event.target.value }))} />
          <Input label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={(event) => setForm((current) => ({ ...current, fechaInicio: event.target.value }))} />
          <Input label="Fecha de finalización" type="date" value={form.fechaFin} onChange={(event) => setForm((current) => ({ ...current, fechaFin: event.target.value }))} />
          <Input label="Importe inicial" type="number" value={form.importeActual} onChange={(event) => setForm((current) => ({ ...current, importeActual: event.target.value }))} />
          <Select label="Tipo de ajuste" options={tipoAjusteOptions} value={form.tipoAjuste} onChange={(event) => setForm((current) => ({ ...current, tipoAjuste: event.target.value }))} />
          <Select label="Periodicidad" options={periodicidadOptions} value={form.periodicidad} onChange={(event) => setForm((current) => ({ ...current, periodicidad: event.target.value }))} />
          
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de contrato" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedContrato ? (
          <div className={styles.detailGrid}>
            <div><span>Propiedad</span><strong>{selectedContrato.propiedad}</strong></div>
            <div><span>Inquilino</span><strong>{selectedContrato.inquilino}</strong></div>
            <div><span>Inicio</span><strong>{selectedContrato.fechaInicio}</strong></div>
            <div><span>Fin</span><strong>{selectedContrato.fechaFin}</strong></div>
            <div><span>Importe actual</span><strong>{formatCurrency(selectedContrato.importeActual)}</strong></div>
            <div><span>Tipo de ajuste</span><strong>{selectedContrato.tipoAjuste}</strong></div>
            <div><span>Periodicidad</span><strong>{selectedContrato.periodicidad}</strong></div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Contratos