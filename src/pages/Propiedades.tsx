import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import PropietarioForm from '../components/PropietarioForm'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { estadoAlquilerOptions, estadoOptions, usePropiedadesController } from '../controllers/usePropiedadesController'
import { formatPercent } from '../services/api'
import type { EstadoAlquiler, PropiedadEstado } from '../types/propiedad'
import styles from './Propiedades.module.css'

function formatComision(comision: number | null) {
  return comision != null ? formatPercent(comision) : '—'
}

function Propiedades() {
  const {
    loading,
    error,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    detailOpen,
    setDetailOpen,
    selectedPropiedad,
    detailLoading,
    detailError,
    editingPropiedad,
    form,
    setForm,
    formError,
    feedback,
    filteredPropiedades,
    openCreateModal,
    openEditModal,
    openDetail,
    handleSubmit,
    handleDelete,
    formatPropiedadId,
    propietariosDisponibles,
    variosPropietarios,
    sumaPorcentajes,
    handlePropietarioChange,
    addPropietario,
    removePropietario,
  } = usePropiedadesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Propiedades</h2>
            <p>Administración de inmuebles.</p>
          </div>
          <Button onClick={openCreateModal}>Nueva propiedad</Button>
        </div>

        <div className={styles.filters}>
          <Input placeholder="Buscar por ID, dirección, propietario, inquilino o estado" value={search} onChange={(event) => setSearch(event.target.value)} />
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando propiedades...</div></Card> : null}

      {!loading && filteredPropiedades.length === 0 ? <Card><div className={styles.emptyState}>No hay propiedades para mostrar.</div></Card> : null}

      {!loading && filteredPropiedades.length > 0 ? (
        <Table headers={["ID", "Dirección", "Propietario", "Inquilino", "Comisión", "Alquiler", "Estado", "Acciones"]}>
          {filteredPropiedades.map((propiedad) => (
            <tr key={propiedad.propiedad_id}>
              <td><StatusBadge variant="info">{formatPropiedadId(propiedad.propiedad_id)}</StatusBadge></td>
              <td>{propiedad.direccion}</td>
              <td>{propiedad.propietario || '—'}</td>
              <td>{propiedad.inquilino || '—'}</td>
              <td>{formatComision(propiedad.comision)}</td>
              <td>
                <StatusBadge variant={propiedad.estado_alquiler === 'Abono' ? 'success' : 'danger'}>{propiedad.estado_alquiler}</StatusBadge>
              </td>
              <td>
                <StatusBadge variant={propiedad.estado === 'Activa' ? 'success' : 'neutral'}>{propiedad.estado}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => void openDetail(propiedad)}>Ver</Button>
                  <Button variant="secondary" onClick={() => openEditModal(propiedad)}>Editar</Button>
                  <Button variant="danger" onClick={() => void handleDelete(propiedad)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal
        open={modalOpen}
        title={editingPropiedad ? 'Editar propiedad' : 'Nueva propiedad'}
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="propiedad-form">Guardar</Button>
          </>
        )}
      >
        <form id="propiedad-form" className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <Input label="Dirección" value={form.direccion} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          <Input label="Ambientes" type="number" min={0} step={1} value={form.ambientes} onChange={(event) => setForm((current) => ({ ...current, ambientes: event.target.value }))} />
          {editingPropiedad ? (
            <>
              <Select label="Estado" options={estadoOptions} value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as PropiedadEstado }))} />
              <Select label="Alquiler" options={estadoAlquilerOptions} value={form.estadoAlquiler} onChange={(event) => setForm((current) => ({ ...current, estadoAlquiler: event.target.value as EstadoAlquiler }))} />
            </>
          ) : (
            <>
              <div className={styles.sectionDivider} />
              <Input label="Comisión (%)" type="number" min={0} step="0.01" placeholder="Ej: 6" value={form.comision} onChange={(event) => setForm((current) => ({ ...current, comision: event.target.value }))} />
              {form.propietarios.map((propietario, index) => (
                <PropietarioForm
                  key={index}
                  index={index}
                  propietario={propietario}
                  disponibles={propietariosDisponibles}
                  mostrarPorcentaje={variosPropietarios}
                  onChange={(field) => handlePropietarioChange(index, field)}
                  onRemove={() => removePropietario(index)}
                  canRemove={variosPropietarios}
                />
              ))}
              {variosPropietarios ? (
                <div className={styles.totalPorcentaje}>
                  Total repartido: <strong>{sumaPorcentajes}%</strong>
                  {Math.abs(sumaPorcentajes - 100) > 0.01 ? ' — debe sumar 100%' : ''}
                </div>
              ) : null}
              <div className={styles.addButtonRow}>
                <Button type="button" variant="secondary" onClick={addPropietario}>
                  + Agregar otro propietario
                </Button>
              </div>
            </>
          )}
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de propiedad" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {detailLoading ? <div className={styles.emptyState}>Cargando detalle...</div> : null}
        {detailError ? <div className={styles.error}>{detailError}</div> : null}
        {!detailLoading && !detailError && selectedPropiedad ? (
          <div className={styles.detailGrid}>
            <div><span>ID</span><strong>{formatPropiedadId(selectedPropiedad.propiedad_id)}</strong></div>
            <div><span>Dirección</span><strong>{selectedPropiedad.direccion}</strong></div>
            <div><span>Ambientes</span><strong>{selectedPropiedad.ambientes ?? '—'}</strong></div>
            <div><span>Propietario</span><strong>{selectedPropiedad.propietario || '—'}</strong></div>
            <div><span>Inquilino</span><strong>{selectedPropiedad.inquilino || '—'}</strong></div>
            <div><span>Comisión</span><strong>{formatComision(selectedPropiedad.comision)}</strong></div>
            <div><span>Alquiler</span><strong>{selectedPropiedad.estado_alquiler}</strong></div>
            <div><span>Estado</span><strong>{selectedPropiedad.estado}</strong></div>
            {selectedPropiedad.propietarios.length > 0 ? (
              <>
                <div className={styles.sectionDivider} />
                {selectedPropiedad.propietarios.map((propietario) => (
                  <div key={propietario.cliente_num}>
                    <span>{propietario.nombre}</span>
                    <strong>{formatComision(propietario.comision)} de comisión · le corresponde {formatPercent(propietario.porcentaje)}</strong>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Propiedades
