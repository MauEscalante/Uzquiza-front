import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Table from '../components/Table'
import ContratoForm from '../components/ContratoForm.tsx'
import ContratoDetail from '../components/ContratoDetail.tsx'
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
    detailLoading,
    detailError,
    editingContrato,
    feedback,
    form,
    setForm,
    formError,
    handleSubmit,
    filteredContratos,
    propiedades,
    openCreateModal,
    openDetail,
    formatCurrency,
    getPropiedadDireccion,
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
              <td>{getPropiedadDireccion(contrato.propiedad)}</td>
              <td>{contrato.fecha_inicio}</td>
              <td>{contrato.fecha_fin}</td>
              <td>{formatCurrency(contrato.importe_inicial)}</td>
              <td>{contrato.deposito != null ? formatCurrency(contrato.deposito) : '—'}</td>
              <td>{contrato.tipo_ajuste}</td>
              <td>{contrato.periodicidad}</td>
              <td>{contrato.estado}</td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetail(contrato)}>Ver detalles</Button>
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
          propiedades={propiedades}
        />
      </Modal>

      <Modal open={detailOpen} title="Detalle de contrato" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        <ContratoDetail contrato={selectedContrato} loading={detailLoading} error={detailError} />
      </Modal>
    </div>
  )
}

export default Contratos