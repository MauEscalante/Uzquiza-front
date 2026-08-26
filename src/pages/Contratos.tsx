import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Table, { ClickableRow } from '../components/Table'
import { cell } from '../components/tableCells'
import ContratoForm from '../components/ContratoForm.tsx'
import ContratoDetail from '../components/ContratoDetail.tsx'
import RescisionForm from '../components/RescisionForm.tsx'
import EntregaLlavesForm from '../components/EntregaLlavesForm.tsx'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../services/api'
import { tieneRescisionPendiente, useContratosController } from '../controllers/useContratosController'

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
    rescisionContrato,
    rescisionMes,
    setRescisionMes,
    rescisionCalculo,
    rescisionLoading,
    rescisionSubmitting,
    rescisionError,
    rescisionMesesOptions,
    openRescision,
    closeRescision,
    confirmRescision,
    entregaContrato,
    entregaFecha,
    setEntregaFecha,
    entregaImporte,
    setEntregaImporte,
    openEntregaLlaves,
    closeEntregaLlaves,
    confirmEntregaLlaves,
    cancelarAviso,
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
        <Table
          headers={[
            'Propiedad',
            'Inicio',
            'Fin',
            { label: 'Importe inicial', money: true },
            { label: 'Depósito', money: true },
            'Tipo de ajuste',
            'Periodicidad',
            'Estado',
          ]}
        >
          
          {filteredContratos.map((contrato) => (
            <ClickableRow
              key={contrato.contrato_id}
              onSelect={() => openDetail(contrato)}
              label={`Ver detalle del contrato ${contrato.contrato_id}`}
            >
              <td>{getPropiedadDireccion(contrato.propiedad)}</td>
              <td className={cell.dato}>{contrato.fecha_inicio}</td>
              <td className={cell.dato}>{contrato.fecha_fin}</td>
              <td className={cell.money}>{formatCurrency(contrato.importe_inicial)}</td>
              <td className={cell.money}>{contrato.deposito != null ? formatCurrency(contrato.deposito) : '—'}</td>
              <td>{contrato.tipo_ajuste}</td>
              <td>{contrato.periodicidad}</td>
              <td>
                {tieneRescisionPendiente(contrato) ? (
                  <StatusBadge variant="warning">
                    {`Rescisión ${formatDate(contrato.fecha_rescision as string)}`}
                  </StatusBadge>
                ) : (
                  contrato.estado
                )}
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetail(contrato)}>Ver detalles</Button>
                  {/*
                    Las acciones siguen las tres fases: sin aviso se rescinde, con aviso
                    pendiente se cierra por entrega de llaves (o se cancela el aviso), y un
                    contrato ya cerrado no ofrece ninguna.
                  */}
                  {contrato.estado === 'Activo' && !tieneRescisionPendiente(contrato) ? (
                    <Button variant="danger" onClick={() => openRescision(contrato)}>Rescindir</Button>
                  ) : null}
                  {tieneRescisionPendiente(contrato) ? (
                    <>
                      <Button onClick={() => openEntregaLlaves(contrato)}>Entregar llaves</Button>
                      <Button variant="ghost" onClick={() => cancelarAviso(contrato)}>Cancelar rescisión</Button>
                    </>
                  ) : null}
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

      <Modal
        open={rescisionContrato !== null}
        title="Rescindir contrato"
        onClose={closeRescision}
        footer={(
          <>
            <Button variant="ghost" onClick={closeRescision}>Cancelar</Button>
            <Button
              type="submit"
              form="rescision-form"
              variant="danger"
              disabled={rescisionSubmitting || rescisionLoading || !rescisionCalculo}
            >
              {rescisionSubmitting ? 'Registrando...' : 'Registrar rescisión'}
            </Button>
          </>
        )}
      >
        <RescisionForm
          direccion={rescisionContrato ? getPropiedadDireccion(rescisionContrato.propiedad) : ''}
          mesesOptions={rescisionMesesOptions}
          mesSeleccionado={rescisionMes}
          onMesChange={setRescisionMes}
          calculo={rescisionCalculo}
          loading={rescisionLoading}
          error={rescisionError}
          onSubmit={confirmRescision}
        />
      </Modal>

      <Modal
        open={entregaContrato !== null}
        title="Entrega de llaves"
        onClose={closeEntregaLlaves}
        footer={(
          <>
            <Button variant="ghost" onClick={closeEntregaLlaves}>Cancelar</Button>
            <Button
              type="submit"
              form="entrega-llaves-form"
              variant="danger"
              disabled={rescisionSubmitting || rescisionLoading || !rescisionCalculo}
            >
              {rescisionSubmitting ? 'Cerrando...' : 'Cerrar contrato'}
            </Button>
          </>
        )}
      >
        <EntregaLlavesForm
          direccion={entregaContrato ? getPropiedadDireccion(entregaContrato.propiedad) : ''}
          fechaSalidaAgendada={entregaContrato?.fecha_rescision ?? null}
          fecha={entregaFecha}
          onFechaChange={setEntregaFecha}
          importe={entregaImporte}
          onImporteChange={setEntregaImporte}
          calculo={rescisionCalculo}
          loading={rescisionLoading}
          error={rescisionError}
          onSubmit={confirmEntregaLlaves}
        />
      </Modal>

      <Modal open={detailOpen} title="Detalle de contrato" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        <ContratoDetail contrato={selectedContrato} loading={detailLoading} error={detailError} />
      </Modal>
    </div>
  )
}

export default Contratos