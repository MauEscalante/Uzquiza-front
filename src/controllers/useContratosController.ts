import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../services/api'
import { createContrato, deleteContrato, listContratos } from '../services/contratosService'
import type { Contrato, ContratoEstado, ContratoFormValues } from '../types/contrato'

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

export const estadoOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Próximo a vencer', value: 'Próximo a vencer' },
  { label: 'Finalizado', value: 'Finalizado' },
]

export const tipoAjusteOptions = [
  { label: 'IPC', value: 'IPC' },
  { label: 'ICL', value: 'ICL' },
  { label: 'Fijo', value: 'Fijo' },
]

export const periodicidadOptions = [
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Cuatrimestral', value: 'Cuatrimestral' },
  { label: 'Semestral', value: 'Semestral' },
]

const emptyForm: FormState = {
  codigo: '',
  propiedad: '',
  inquilino: '',
  fechaInicio: '',
  fechaFin: '',
  importeActual: '',
  tipoAjuste: 'IPC',
  periodicidad: 'Cuatrimestral',
  estado: 'Activo',
}

export function useContratosController() {
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

    return contratos.filter((contrato) => [contrato.id, contrato.propiedad, contrato.inquilino, contrato.estado, contrato.tipoAjuste, contrato.periodicidad]
      .some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [contratos, search])

  function openCreateModal() {
    setEditingContrato(null)
    setForm(emptyForm)
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

    await createContrato(payload)

    setModalOpen(false)
    setEditingContrato(null)
    setForm(emptyForm)
  }

  async function handleDelete(contrato: Contrato) {
    const shouldDelete = window.confirm(`¿Eliminar el contrato ${contrato.id}?`)
    if (!shouldDelete) {
      return
    }

    await deleteContrato(contrato.id)
    setContratos((current) => current.filter((entry) => entry.id !== contrato.id))
    setFeedback('Contrato eliminado.')
  }

  return {
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
    form,
    setForm,
    formError,
    feedback,
    filteredContratos,
    openCreateModal,
    openDetail,
    handleSubmit,
    handleDelete,
    formatCurrency,
  }
}