import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { createContrato, deleteContrato, listContratos, updateContrato } from '../services/contratosService'
import { formatCurrency } from '../services/api'
import type { Contrato, ContratoEstado, ContratoFormValues } from '../types/contrato'
import styles from './Contratos.module.css'

interface FormState {
  codigo: string
  propiedad: string
  inquilino: string
  fechaInicio: string
  fechaFin: string
  importeActual: string
  tipoAjuste: string
  periodicidad: string
  estado: ContratoEstado
}

const emptyForm: FormState = {
  codigo: '',
  propiedad: '',
  inquilino: '',
  fechaInicio: '',
  fechaFin: '',
  importeActual: '',
  tipoAjuste: 'IPC',
  periodicidad: 'Mensual',
  estado: 'Activo',
}

const estadoOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Próximo a vencer', value: 'Próximo a vencer' },
  { label: 'Finalizado', value: 'Finalizado' },
]

const tipoAjusteOptions = [
  { label: 'IPC', value: 'IPC' },
  { label: 'ICL', value: 'ICL' },
  { label: 'Fijo', value: 'Fijo' },
]

const periodicidadOptions = [
  { label: 'Mensual', value: 'Mensual' },
  { label: 'Bimestral', value: 'Bimestral' },
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Semestral', value: 'Semestral' },
]

function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadContratos() {
      try {
        const data = await listContratos()
        if (mounted) {
          setContratos(data)
        }
      } catch {
        if (mounted) {
          setError('No se pudieron cargar los contratos.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadContratos()

    return () => {
      mounted = false
    }
  }, [])

  const filteredContratos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return contratos
    }

    return contratos.filter((contrato) => [contrato.codigo, contrato.propiedad, contrato.inquilino, contrato.estado, contrato.tipoAjuste, contrato.periodicidad]
      .some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [contratos, search])

  function openCreateModal() {
    setEditingContrato(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(contrato: Contrato) {
    setEditingContrato(contrato)
    setForm({
      codigo: contrato.codigo,
      propiedad: contrato.propiedad,
      inquilino: contrato.inquilino,
      fechaInicio: contrato.fechaInicio,
      fechaFin: contrato.fechaFin,
      importeActual: String(contrato.importeActual),
      tipoAjuste: contrato.tipoAjuste,
      periodicidad: contrato.periodicidad,
      estado: contrato.estado,
    })
    setFormError('')
    setModalOpen(true)
  }

  function openDetail(contrato: Contrato) {
    setSelectedContrato(contrato)
    setDetailOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.codigo || !form.propiedad || !form.inquilino || !form.fechaInicio || !form.fechaFin || !form.importeActual) {
      setFormError('Completá todos los campos del contrato.')
      return
    }

    const payload: ContratoFormValues = {
      ...form,
      importeActual: Number(form.importeActual),
    }

    if (Number.isNaN(payload.importeActual) || payload.importeActual <= 0) {
      setFormError('El importe actual debe ser un valor numérico válido.')
      return
    }

    const saved = editingContrato ? await updateContrato(editingContrato.id, payload) : await createContrato(payload)

    if (editingContrato) {
      setContratos((current) => current.map((contrato) => (contrato.id === editingContrato.id ? saved : contrato)))
      setFeedback('Contrato actualizado correctamente.')
    } else {
      setContratos((current) => [saved, ...current])
      setFeedback('Contrato creado correctamente.')
    }

    setModalOpen(false)
    setEditingContrato(null)
    setForm(emptyForm)
  }

  async function handleDelete(contrato: Contrato) {
    const shouldDelete = window.confirm(`¿Eliminar el contrato ${contrato.codigo}?`)
    if (!shouldDelete) {
      return
    }

    await deleteContrato(contrato.id)
    setContratos((current) => current.filter((entry) => entry.id !== contrato.id))
    setFeedback('Contrato eliminado.')
  }

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
        <Table headers={["Código", "Propiedad", "Inquilino", "Inicio", "Fin", "Importe actual", "Tipo de ajuste", "Periodicidad", "Estado", "Acciones"]}>
          {filteredContratos.map((contrato) => (
            <tr key={contrato.id}>
              <td><StatusBadge variant="info">{contrato.codigo}</StatusBadge></td>
              <td>{contrato.propiedad}</td>
              <td>{contrato.inquilino}</td>
              <td>{contrato.fechaInicio}</td>
              <td>{contrato.fechaFin}</td>
              <td>{formatCurrency(contrato.importeActual)}</td>
              <td>{contrato.tipoAjuste}</td>
              <td>{contrato.periodicidad}</td>
              <td>
                <StatusBadge variant={contrato.estado === 'Activo' ? 'success' : contrato.estado === 'Próximo a vencer' ? 'warning' : 'neutral'}>{contrato.estado}</StatusBadge>
              </td>
              <td>
                <div className={styles.actions}>
                  <Button variant="ghost" onClick={() => openDetail(contrato)}>Ver detalles</Button>
                  <Button variant="secondary" onClick={() => openEditModal(contrato)}>Editar</Button>
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
          <Input label="Código de contrato" value={form.codigo} onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value }))} />
          <Input label="Propiedad" value={form.propiedad} onChange={(event) => setForm((current) => ({ ...current, propiedad: event.target.value }))} />
          <Input label="Inquilino" value={form.inquilino} onChange={(event) => setForm((current) => ({ ...current, inquilino: event.target.value }))} />
          <Input label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={(event) => setForm((current) => ({ ...current, fechaInicio: event.target.value }))} />
          <Input label="Fecha de finalización" type="date" value={form.fechaFin} onChange={(event) => setForm((current) => ({ ...current, fechaFin: event.target.value }))} />
          <Input label="Importe actual" type="number" value={form.importeActual} onChange={(event) => setForm((current) => ({ ...current, importeActual: event.target.value }))} />
          <Select label="Tipo de ajuste" options={tipoAjusteOptions} value={form.tipoAjuste} onChange={(event) => setForm((current) => ({ ...current, tipoAjuste: event.target.value }))} />
          <Select label="Periodicidad" options={periodicidadOptions} value={form.periodicidad} onChange={(event) => setForm((current) => ({ ...current, periodicidad: event.target.value }))} />
          <Select label="Estado" options={estadoOptions} value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as ContratoEstado }))} />
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal open={detailOpen} title="Detalle de contrato" onClose={() => setDetailOpen(false)} footer={<Button variant="ghost" onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {selectedContrato ? (
          <div className={styles.detailGrid}>
            <div><span>Código</span><strong>{selectedContrato.codigo}</strong></div>
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