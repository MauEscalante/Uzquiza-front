import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import Table, { ClickableRow } from '../components/Table'
import { useClientesController } from '../controllers/useClientesController'
import type { ClienteTipo } from '../types/cliente'
import styles from './Clientes.module.css'
import { formatCurrency, formatDate } from '../services/api'

function badgeVariant(tipo: ClienteTipo) {
  if (tipo === 'Propietario') return 'success' as const
  if (tipo === 'Ambos') return 'warning' as const
  return 'info' as const
}

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
    selectedCliente,
    form,
    setForm,
    formError,
    feedback,
    historial,
    historialLoading,
    historialError,
    filteredClientes,
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
            <p>Los clientes se registran automáticamente al crear contratos y propiedades.</p>
          </div>
        </div>

        <div className={styles.filters}>
          <Input placeholder="Buscar por nombre, DNI, teléfono o dirección" value={search} onChange={(event) => setSearch(event.target.value)} />
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
            <ClickableRow
              key={cliente.cliente_num}
              onSelect={() => openDetailModal(cliente)}
              label={`Ver detalle de ${cliente.nombre} ${cliente.apellido}`}
            >
              {/* El inquilino tiene domicilio personal; el propietario no, así que
                  para él se muestra la propiedad que posee. */}
              <td>{cliente.direccion ?? cliente.direccion_propiedades ?? '—'}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.telefono}</td>
              <td>
                {cliente.tipo ? <StatusBadge variant={badgeVariant(cliente.tipo)}>{cliente.tipo}</StatusBadge> : '—'}
              </td>
              <td>
                {/* La fila entera abre el detalle: las acciones no deben propagar el click. */}
                <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
                  <Button variant="secondary" onClick={() => openEditModal(cliente)}>Editar</Button>
                </div>
              </td>
            </ClickableRow>
          ))}
        </Table>
      ) : null}

      <Modal
        open={modalOpen}
        title="Editar cliente"
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
          <Input label="Email (opcional)" type="email" value={form.email ?? ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <Input label="Dirección (opcional)" value={form.direccion ?? ''} onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))} />
          <Input label="CUIL (opcional)" value={form.cuil ?? ''} onChange={(event) => setForm((current) => ({ ...current, cuil: event.target.value }))} />
          <Input label="Nacionalidad (opcional)" value={form.nacionalidad ?? ''} onChange={(event) => setForm((current) => ({ ...current, nacionalidad: event.target.value }))} />
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de cliente" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedCliente ? (
          <div className={styles.detailGrid}>
            <div><span>Número</span><strong>{selectedCliente.cliente_num}</strong></div>
            <div><span>Nombre</span><strong>{selectedCliente.nombre}</strong></div>
            <div><span>Apellido</span><strong>{selectedCliente.apellido}</strong></div>
            <div><span>DNI</span><strong>{selectedCliente.dni}</strong></div>
            <div><span>Teléfono</span><strong>{selectedCliente.telefono}</strong></div>
            <div><span>Email</span><strong>{selectedCliente.email ?? '—'}</strong></div>
            <div><span>Dirección</span><strong>{selectedCliente.direccion ?? '—'}</strong></div>
            <div><span>Propiedades</span><strong>{selectedCliente.direccion_propiedades ?? '—'}</strong></div>
            <div><span>CUIL</span><strong>{selectedCliente.cuil ?? '—'}</strong></div>
            <div><span>Nacionalidad</span><strong>{selectedCliente.nacionalidad ?? '—'}</strong></div>
            <div><span>Inquilino/Propietario</span><strong>{selectedCliente.tipo ?? '—'}</strong></div>
          </div>
        ) : null}

        {selectedCliente ? (
          <>
            <h3 className={styles.sectionTitle}>Importes históricos</h3>
            {/* Un renglón por período de vigencia: cada ajuste del alquiler deja el suyo. */}
            {historialLoading ? <div className={styles.emptyState}>Cargando importes...</div> : null}
            {historialError ? <div className={styles.error}>{historialError}</div> : null}
            {!historialLoading && !historialError && historial.length === 0 ? (
              <div className={styles.emptyState}>Este cliente no tiene importes registrados.</div>
            ) : null}
            {!historialLoading && !historialError && historial.length > 0 ? (
              <Table headers={["Desde", "Hasta", "Propiedad", "Importe"]} className={styles.historial}>
                {historial.map((valor) => (
                  // La PK de valor_historico es (contrato, fecha_inicio).
                  <tr key={`${valor.contrato}-${valor.fecha_inicio}`}>
                    <td>{formatDate(valor.fecha_inicio)}</td>
                    <td>{formatDate(valor.fecha_fin)}</td>
                    <td>{valor.direccion}</td>
                    <td className={styles.monto}>{formatCurrency(valor.importe_inicial)}</td>
                  </tr>
                ))}
              </Table>
            ) : null}
          </>
        ) : null}
      </Modal>
    </div>
  )
}

export default Clientes
