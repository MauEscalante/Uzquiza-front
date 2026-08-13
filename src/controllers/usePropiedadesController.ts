import { useEffect, useMemo, useState } from 'react'
import { createPropiedad, deletePropiedad, listPropiedades, updatePropiedad } from '../services/propiedadesService'
import type { Propiedad, PropiedadEstado, PropiedadFormValues } from '../types/propiedad'

interface FormState {
  direccion: string
  propietario: string
  inquilino: string
  estado: PropiedadEstado
}

export const estadoOptions = [
  { label: 'Disponible', value: 'Disponible' },
  { label: 'Alquilada', value: 'Alquilada' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
]

const emptyForm: FormState = {
  direccion: '',
  propietario: '',
  inquilino: '',
  estado: 'Disponible',
}

export function usePropiedadesController() {
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
  }
}