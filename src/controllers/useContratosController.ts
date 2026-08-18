import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../services/api'
import { createContrato, deleteContrato, listContratos } from '../services/contratosService'
import type { Contrato, ContratoEstado, ContratoFormValues, InquilinoFormValue } from '../types/contrato'
import { emptyInquilino } from '../types/contrato'

interface FormState {
  codigo: string
  propiedad: string
  inquilinos: InquilinoFormValue[]
  fechaInicio: string
  fechaFin: string
  importeActual: string
  tipoAjuste: string
  periodicidad: string
  estado: ContratoEstado
  garantia: string
  // Garantia Propietaria
  garante: string
  dniGarante: string
  direccionGarantia: string
  // Seguro de caución (GPremier)
  aseguradora: string
  numeroPoliza: string
  // Garantes (hasta 3)
  nombreGarante1: string
  sueldoGarante1: string
  telefonoGarante1: string
  nombreGarante2: string
  sueldoGarante2: string
  telefonoGarante2: string
  nombreGarante3: string
  sueldoGarante3: string
  telefonoGarante3: string
}



const emptyForm: FormState = {
  codigo: '',
  propiedad: '',
  inquilinos: [emptyInquilino],
  fechaInicio: '',
  fechaFin: '',
  importeActual: '',
  tipoAjuste: 'IPC',
  periodicidad: 'Cuatrimestral',
  estado: 'Activo',
  garantia: 'GPremier',
  garante: '',
  dniGarante: '',
  direccionGarantia: '',
  aseguradora: 'GPremier',
  numeroPoliza: '',
  nombreGarante1: '',
  sueldoGarante1: '',
  telefonoGarante1: '',
  nombreGarante2: '',
  sueldoGarante2: '',
  telefonoGarante2: '',
  nombreGarante3: '',
  sueldoGarante3: '',
  telefonoGarante3: '',
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

    return contratos.filter((contrato) => [contrato.contrato_id, contrato.propiedad, contrato.estado, contrato.tipo_ajuste, contrato.periodicidad]
      .some((value) => value.toString().toLowerCase().includes(normalizedSearch)))
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

    if (!form.codigo || !form.propiedad || !form.inquilinos.length || !form.inquilinos[0].nombreCompleto || !form.fechaInicio || !form.fechaFin || !form.importeActual) {
      setFormError('Completá todos los campos del contrato.')
      return
    }

    const payload: ContratoFormValues = {
      ...form,
      importe_inicial: Number(form.importeActual),
      contrato_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      periodicidad: 0,
      tipo_ajuste: 'IPC',
    }

    if (Number.isNaN(payload.importe_inicial) || payload.importe_inicial <= 0) {
      setFormError('El importe actual debe ser un valor numérico válido.')
      return
    }

    await createContrato(payload)

    setModalOpen(false)
    setEditingContrato(null)
    setForm(emptyForm)
  }

  async function handleDelete(contrato: Contrato) {
    const shouldDelete = window.confirm(`¿Eliminar el contrato ${contrato.contrato_id}?`)
    if (!shouldDelete) {
      return
    }

    await deleteContrato(contrato.contrato_id)
    setContratos((current) => current.filter((entry) => entry.contrato_id !== contrato.contrato_id))
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
    contratos,
    openCreateModal,
    openDetail,
    handleSubmit,
    handleDelete,
    formatCurrency,
  }
}