import { useEffect, useMemo, useState } from 'react'
import {
  createPropiedad,
  deletePropiedad,
  formatPropiedadId,
  getPropiedad,
  listPropiedades,
  updatePropiedad,
} from '../services/propiedadesService'
import type {
  EstadoAlquiler,
  Propiedad,
  PropiedadDetalle,
  PropiedadEstado,
} from '../types/propiedad'

interface FormState {
  direccion: string
  ambientes: string
  estado: PropiedadEstado
  estadoAlquiler: EstadoAlquiler
}

export const estadoOptions = [
  { label: 'Activa', value: 'Activa' },
  { label: 'Inactiva', value: 'Inactiva' },
]

export const estadoAlquilerOptions = [
  { label: 'Abono', value: 'Abono' },
  { label: 'Adeuda', value: 'Adeuda' },
]

const emptyForm: FormState = {
  direccion: '',
  ambientes: '',
  estado: 'Activa',
  estadoAlquiler: 'Adeuda',
}

export function usePropiedadesController() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPropiedad, setSelectedPropiedad] = useState<PropiedadDetalle | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
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

    return propiedades.filter((propiedad) => [
      formatPropiedadId(propiedad.propiedad_id),
      propiedad.direccion,
      propiedad.propietario ?? '',
      propiedad.inquilino ?? '',
      propiedad.estado,
      propiedad.estado_alquiler,
    ].some((value) => value.toLowerCase().includes(normalizedSearch)))
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
      ambientes: propiedad.ambientes != null ? String(propiedad.ambientes) : '',
      estado: propiedad.estado,
      estadoAlquiler: propiedad.estado_alquiler,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function openDetail(propiedad: Propiedad) {
    setSelectedPropiedad(null)
    setDetailError('')
    setDetailOpen(true)
    setDetailLoading(true)

    try {
      const detalle = await getPropiedad(propiedad.propiedad_id)
      setSelectedPropiedad(detalle)
    } catch {
      setDetailError('No se pudo cargar el detalle de la propiedad.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!form.direccion.trim()) {
      setFormError('Completá la dirección.')
      return
    }

    const ambientes = form.ambientes.trim() ? Number(form.ambientes) : null

    if (ambientes !== null && (!Number.isInteger(ambientes) || ambientes < 0)) {
      setFormError('Los ambientes deben ser un número entero mayor o igual a 0.')
      return
    }

    try {
      if (editingPropiedad) {
        const saved = await updatePropiedad(editingPropiedad.propiedad_id, {
          direccion: form.direccion.trim(),
          ambientes,
          estado: form.estado,
          estado_alquiler: form.estadoAlquiler,
        })
        setPropiedades((current) => current.map((propiedad) => (
          propiedad.propiedad_id === editingPropiedad.propiedad_id ? saved : propiedad
        )))
        setFeedback('Propiedad actualizada correctamente.')
      } else {
        const saved = await createPropiedad({ direccion: form.direccion.trim(), ambientes })
        setPropiedades((current) => [saved, ...current])
        setFeedback('Propiedad creada correctamente.')
      }
    } catch {
      setFormError('No se pudo guardar la propiedad.')
      return
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

    try {
      await deletePropiedad(propiedad.propiedad_id)
    } catch {
      setError('No se pudo eliminar la propiedad. Puede tener contratos asociados.')
      return
    }

    setPropiedades((current) => current.filter((entry) => entry.propiedad_id !== propiedad.propiedad_id))
    setError('')
    setFeedback('Propiedad eliminada.')
  }

  return {
    propiedades,
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
  }
}
