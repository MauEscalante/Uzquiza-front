import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Table from '../components/Table'
import ContratoForm from '../components/ContratoForm.tsx'
import { useContratosController } from '../controllers/useContratosController'

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
    feedback,
    form,
    setForm,
    formError,
    handleSubmit,
    filteredContratos,
    openCreateModal,
    openDetail,
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
        <Table headers={["Propiedad", "Inicio", "Fin", "Importe inicial", "Deposito", "Tipo de ajuste", "Periodicidad", "Estado", "Acciones"]}>
          
          {filteredContratos.map((contrato) => (
            <tr key={contrato.contrato_id}>
              <td>{contrato.propiedad}</td>
              <td>{contrato.fecha_inicio}</td>
              <td>{contrato.fecha_fin}</td>
              <td>{formatCurrency(contrato.importe_inicial)}</td>
              <td>{formatCurrency(contrato.importe_inicial)}</td>
              
              <td>{contrato.tipo_ajuste}</td>
              <td>{contrato.periodicidad}</td>
              <td>{contrato.estado}</td>
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
        <ContratoForm 
          form={form}
          setForm={setForm}
          formError={formError}
          onSubmit={(event) => handleSubmit(event as React.FormEvent<HTMLFormElement>)}
        />
      </Modal>

      <Modal open={detailOpen} title="Detalle de contrato" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedContrato ? (
          <div className={styles.detailGrid}>
            <div><span>Propiedad</span><strong>{selectedContrato.propiedad}</strong></div>
            <div><span>Inicio</span><strong>{selectedContrato.fecha_inicio}</strong></div>
            <div><span>Fin</span><strong>{selectedContrato.fecha_fin}</strong></div>
            <div><span>Importe actual</span><strong>{formatCurrency(selectedContrato.importe_inicial)}</strong></div>
            <div><span>Tipo de ajuste</span><strong>{selectedContrato.tipo_ajuste}</strong></div>
            <div><span>Periodicidad</span><strong>{selectedContrato.periodicidad}</strong></div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Contratos