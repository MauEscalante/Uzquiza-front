import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { createCliente, deleteCliente, listClientes, updateCliente } from '../services/clientesService'
import type { Cliente, ClienteFormValues } from '../types/cliente'
import styles from './Clientes.module.css'

const emptyForm: ClienteFormValues = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
}

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [form, setForm] = useState<ClienteFormValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadClientes() {
      try {
        const data = await listClientes()
        if (mounted) {
          setClientes(data)
        }
      } catch {
        if (mounted) {
          setError('No se pudieron cargar los clientes.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadClientes()

    return () => {
      mounted = false
    }
  }, [])

  const filteredClientes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return clientes
    }

    return clientes.filter((cliente) => [cliente.numeroCliente, cliente.nombre, cliente.apellido, cliente.dni, cliente.telefono, cliente.email]
      .some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [clientes, search])

  function openCreateModal() {
    setEditingCliente(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(cliente: Cliente) {
    setEditingCliente(cliente)
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      telefono: cliente.telefono,
      email: cliente.email,
    })
    setFormError('')
    setModalOpen(true)
  }

  function openDetailModal(cliente: Cliente) {
    setSelectedCliente(cliente)
    setDetailOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombre || !form.apellido || !form.dni || !form.telefono || !form.email) {
      setFormError('Completá todos los campos del cliente.')
      return
    }

    const action = editingCliente ? updateCliente(editingCliente.id, form) : createCliente(form)
    const saved = await action

    if (editingCliente) {
      setClientes((current) => current.map((cliente) => (cliente.id === editingCliente.id ? saved : cliente)))
      setFeedback('Cliente actualizado correctamente.')
    } else {
      setClientes((current) => [saved, ...current])
      setFeedback('Cliente creado correctamente.')
    }

    setModalOpen(false)
    setEditingCliente(null)
    setForm(emptyForm)
  }

  async function handleDelete(cliente: Cliente) {
    const shouldDelete = window.confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`)
    if (!shouldDelete) {
      return
    }

    await deleteCliente(cliente.id)
    setClientes((current) => current.filter((entry) => entry.id !== cliente.id))
    setFeedback('Cliente eliminado.')
  }

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
        <Table headers={["Número de cliente", "Nombre", "Apellido", "DNI", "Teléfono", "Email", "Acciones"]}>
          {filteredClientes.map((cliente) => (
            <tr key={cliente.id}>
              <td><StatusBadge variant="info">{cliente.numeroCliente}</StatusBadge></td>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.dni}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetailModal(cliente)}>Ver</Button>
                  <Button variant="secondary" onClick={() => openEditModal(cliente)}>Editar</Button>
                  <Button variant="danger" onClick={() => void handleDelete(cliente)}>Eliminar</Button>
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
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Clientes