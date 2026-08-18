import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { useClientesController } from '../controllers/useClientesController'
import styles from './Clientes.module.css'

function Clientes() {
  const {
    loading,
    error,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    detailOpen,
    setDetailOpen,
    editingCliente,
    selectedCliente,
    form,
    setForm,
    formError,
    feedback,
    filteredClientes,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleSubmit
  } = useClientesController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Clientes</h2>
            <p>Gestión mock preparada para integrarse luego con FastAPI.</p>
          </div>
          <Button onClick={openCreateModal}>Nuevo cliente</Button>
        </div>

        <div className={styles.filters}>
          <Input placeholder="Buscar por nombre, DNI, email o número" value={search} onChange={(event) => setSearch(event.target.value)} />
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando clientes...</div></Card> : null}

      {!loading && filteredClientes.length === 0 ? (
        <Card><div className={styles.emptyState}>No hay clientes para mostrar.</div></Card>
      ) : null}

      {!loading && filteredClientes.length > 0 ? (
        <Table headers={["Dirección", "Nombre", "Apellido", "Teléfono", "Inquilino/Propietario", "Acciones"]}>
          {filteredClientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.direccion}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.telefono}</td>
              <td>
                <StatusBadge variant={cliente.tipo === 'Propietario' ? 'success' : 'info'}>{cliente.tipo}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetailModal(cliente)}>Ver</Button>
                  <Button variant="secondary" onClick={() => openEditModal(cliente)}>Editar</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal
        open={modalOpen}
        title={editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="cliente-form">Guardar</Button>
          </>
        )}
      >
        <form id="cliente-form" className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <Input label="Nombre" value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} />
          <Input label="Apellido" value={form.apellido} onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))} />
          <Input label="DNI" value={form.dni} onChange={(event) => setForm((current) => ({ ...current, dni: event.target.value }))} />
          <Input label="Teléfono" value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <Input label="Dirección" value={form.direccion} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          <Input label="CUIL" value={form.cuil} onChange={(event) => setForm((current) => ({ ...current, cuil: event.target.value }))} />
          <Input label="Nacionalidad" value={form.nacionalidad} onChange={(event) => setForm((current) => ({ ...current, nacionalidad: event.target.value }))} />
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de cliente" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedCliente ? (
          <div className={styles.detailGrid}>
            <div><span>Número</span><strong>{selectedCliente.numeroCliente}</strong></div>
            <div><span>Nombre</span><strong>{selectedCliente.nombre}</strong></div>
            <div><span>Apellido</span><strong>{selectedCliente.apellido}</strong></div>
            <div><span>DNI</span><strong>{selectedCliente.dni}</strong></div>
            <div><span>Teléfono</span><strong>{selectedCliente.telefono}</strong></div>
            <div><span>Email</span><strong>{selectedCliente.email}</strong></div>
            <div><span>Dirección</span><strong>{selectedCliente.direccion}</strong></div>
            <div><span>CUIL</span><strong>{selectedCliente.cuil}</strong></div>
            <div><span>Nacionalidad</span><strong>{selectedCliente.nacionalidad}</strong></div>
            <div><span>Inquilino/Propietario</span><strong>{selectedCliente.tipo}</strong></div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Clientes