import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { createPropiedad, deletePropiedad, listPropiedades, updatePropiedad } from '../services/propiedadesService'
import type { Propiedad, PropiedadEstado, PropiedadFormValues } from '../types/propiedad'
import styles from './Propiedades.module.css'

interface FormState {
  direccion: string
  propietario: string
  inquilino: string
  estado: PropiedadEstado
}

const emptyForm: FormState = {
  direccion: '',
  propietario: '',
  inquilino: '',
  estado: 'Disponible',
}

const estadoOptions = [
  { label: 'Disponible', value: 'Disponible' },
  { label: 'Alquilada', value: 'Alquilada' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
]

function Propiedades() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPropiedad, setSelectedPropiedad] = useState<Propiedad | null>(null)
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadPropiedades() {
      try {
        const data = await listPropiedades()
        if (mounted) {
          setPropiedades(data)
        }
      } catch {
        if (mounted) {
          setError('No se pudieron cargar las propiedades.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadPropiedades()

    return () => {
      mounted = false
    }
  }, [])

  const filteredPropiedades = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return propiedades
    }

    return propiedades.filter((propiedad) => [propiedad.id, propiedad.direccion, propiedad.propietario, propiedad.inquilino, propiedad.estado]
      .some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [propiedades, search])

  function openCreateModal() {
    setEditingPropiedad(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(propiedad: Propiedad) {
    setEditingPropiedad(propiedad)
    setForm({
      direccion: propiedad.direccion,
      propietario: propiedad.propietario,
      inquilino: propiedad.inquilino,
      estado: propiedad.estado,
    })
    setFormError('')
    setModalOpen(true)
  }

  function openDetail(propiedad: Propiedad) {
    setSelectedPropiedad(propiedad)
    setDetailOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.direccion || !form.propietario || !form.estado) {
      setFormError('Completá la dirección, el propietario y el estado.')
      return
    }

    const payload: PropiedadFormValues = form
    const saved = editingPropiedad ? await updatePropiedad(editingPropiedad.id, payload) : await createPropiedad(payload)

    if (editingPropiedad) {
      setPropiedades((current) => current.map((propiedad) => (propiedad.id === editingPropiedad.id ? saved : propiedad)))
      setFeedback('Propiedad actualizada correctamente.')
    } else {
      setPropiedades((current) => [saved, ...current])
      setFeedback('Propiedad creada correctamente.')
    }

    setModalOpen(false)
    setEditingPropiedad(null)
    setForm(emptyForm)
  }

  async function handleDelete(propiedad: Propiedad) {
    const shouldDelete = window.confirm(`¿Eliminar la propiedad ${propiedad.direccion}?`)
    if (!shouldDelete) {
      return
    }

    await deletePropiedad(propiedad.id)
    setPropiedades((current) => current.filter((entry) => entry.id !== propiedad.id))
    setFeedback('Propiedad eliminada.')
  }

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