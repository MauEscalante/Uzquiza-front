import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { estadoOptions, usePropiedadesController } from '../controllers/usePropiedadesController'
import type { PropiedadEstado } from '../types/propiedad'
import styles from './Propiedades.module.css'

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
  } = usePropiedadesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Propiedades</h2>
            <p>Administración de inmuebles con datos mock.</p>
          </div>
          <Button onClick={openCreateModal}>Nueva propiedad</Button>
        </div>

        <div className={styles.filters}>
          <Input placeholder="Buscar por dirección, propietario o estado" value={search} onChange={(event) => setSearch(event.target.value)} />
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando propiedades...</div></Card> : null}

      {!loading && filteredPropiedades.length === 0 ? <Card><div className={styles.emptyState}>No hay propiedades para mostrar.</div></Card> : null}

      {!loading && filteredPropiedades.length > 0 ? (
        <Table headers={["ID", "Dirección", "Propietario", "Inquilino", "Estado", "Acciones"]}>
          {filteredPropiedades.map((propiedad) => (
            <tr key={propiedad.id}>
              <td><StatusBadge variant="info">{propiedad.id}</StatusBadge></td>
              <td>{propiedad.direccion}</td>
              <td>{propiedad.propietario}</td>
              <td>{propiedad.inquilino || '—'}</td>
              <td>
                <StatusBadge variant={propiedad.estado === 'Alquilada' ? 'success' : propiedad.estado === 'Mantenimiento' ? 'warning' : 'neutral'}>{propiedad.estado}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetail(propiedad)}>Ver</Button>
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
          <Input label="Propietario" value={form.propietario} onChange={(event) => setForm((current) => ({ ...current, propietario: event.target.value }))} />
          <Input label="Inquilino" value={form.inquilino} onChange={(event) => setForm((current) => ({ ...current, inquilino: event.target.value }))} />
          <Select label="Estado" options={estadoOptions} value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as PropiedadEstado }))} />
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de propiedad" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedPropiedad ? (
          <div className={styles.detailGrid}>
            <div><span>ID</span><strong>{selectedPropiedad.id}</strong></div>
            <div><span>Dirección</span><strong>{selectedPropiedad.direccion}</strong></div>
            <div><span>Propietario</span><strong>{selectedPropiedad.propietario}</strong></div>
            <div><span>Inquilino</span><strong>{selectedPropiedad.inquilino || '—'}</strong></div>
            <div><span>Estado</span><strong>{selectedPropiedad.estado}</strong></div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Propiedades