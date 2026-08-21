import { useEffect, useMemo, useState } from 'react'
import { mensajeDe } from '../services/api'
import {
  createPropiedad,
  deletePropiedad,
  formatPropiedadId,
  getPropiedad,
  listPropiedades,
  listPropietarios,
  updatePropiedad,
} from '../services/propiedadesService'
import type {
  EstadoAlquiler,
  PropiedadPropietarioInput,
  Propiedad,
  PropiedadDetalle,
  PropiedadEstado,
  PropietarioFormValue,
  PropietarioResumen,
} from '../types/propiedad'
import { emptyPropietario } from '../types/propiedad'

interface FormState {
  direccion: string
  ambientes: string
  estado: PropiedadEstado
  estadoAlquiler: EstadoAlquiler
  /** Una sola comisión para toda la propiedad; la comparten sus propietarios. */
  comision: string
  propietarios: PropietarioFormValue[]
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
  comision: '',
  propietarios: [{ ...emptyPropietario }],
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
  const [propietariosDisponibles, setPropietariosDisponibles] = useState<PropietarioResumen[]>([])

  useEffect(() => {
    let mounted = true

    async function loadPropiedades() {
      try {
        const data = await listPropiedades()
        if (mounted) {
          setPropiedades(data)
        }
      } catch (e) {
        if (mounted) {
          setError(mensajeDe(e, 'No se pudieron cargar las propiedades.'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    async function loadPropietarios() {
      try {
        const data = await listPropietarios()
        if (mounted) {
          setPropietariosDisponibles(data)
        }
      } catch (e) {
        // La grilla ya muestra su propio error; el selector queda vacío y solo
        // se pueden cargar propietarios nuevos. Se deja rastro para poder diagnosticar.
        console.error('No se pudieron cargar los propietarios:', e)
      }
    }

    void loadPropiedades()
    void loadPropietarios()

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

  // Con un solo propietario el porcentaje es implícito (100%); recién se pide
  // cuando hay más de uno.
  const variosPropietarios = form.propietarios.length > 1

  const sumaPorcentajes = useMemo(() => form.propietarios.reduce(
    (total, propietario) => total + (Number(propietario.porcentaje) || 0),
    0,
  ), [form.propietarios])

  function handlePropietarioChange(index: number, field: keyof PropietarioFormValue) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target

      setForm((current) => {
        const propietarios = [...current.propietarios]
        propietarios[index] = { ...propietarios[index], [field]: value }

        // Al elegir un propietario que ya tiene comisión registrada la sugerimos,
        // pero sin pisar lo que el usuario haya escrito.
        let comision = current.comision
        if (field === 'clienteNum' && !comision) {
          const elegido = propietariosDisponibles.find((entry) => String(entry.cliente_num) === value)
          if (elegido?.comision != null) {
            comision = String(elegido.comision)
          }
        }

        return { ...current, propietarios, comision }
      })
    }
  }

  function addPropietario() {
    setForm((current) => ({
      ...current,
      propietarios: [...current.propietarios, { ...emptyPropietario }],
    }))
  }

  function removePropietario(index: number) {
    setForm((current) => ({
      ...current,
      propietarios: current.propietarios.filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  function openCreateModal() {
    setEditingPropiedad(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(propiedad: Propiedad) {
    setEditingPropiedad(propiedad)
    setForm({
      // La edición no toca propietarios ni comisión, pero se resetean para no
      // arrastrar lo que hubiera quedado cargado en un alta anterior.
      ...emptyForm,
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
    } catch (e) {
      setDetailError(mensajeDe(e, 'No se pudo cargar el detalle de la propiedad.'))
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

    // Los propietarios solo se cargan en el alta; la edición no los toca.
    let propietariosPayload: PropiedadPropietarioInput[] | null = null

    if (!editingPropiedad) {
      const comision = Number(form.comision)

      if (!form.comision.trim() || Number.isNaN(comision) || comision < 0) {
        setFormError('La comisión debe ser un número mayor o igual a 0.')
        return
      }

      const incompleto = form.propietarios.some((propietario) => (
        propietario.clienteNum === ''
          && (!propietario.nombre.trim() || !propietario.apellido.trim() || !propietario.dni.trim())
      ))

      if (incompleto) {
        setFormError('Cada propietario nuevo necesita nombre, apellido y DNI.')
        return
      }

      if (variosPropietarios) {
        const porcentajeInvalido = form.propietarios.some((propietario) => {
          const porcentaje = Number(propietario.porcentaje)
          return !propietario.porcentaje.trim() || Number.isNaN(porcentaje) || porcentaje <= 0
        })

        if (porcentajeInvalido) {
          setFormError('Indicá el porcentaje de cada propietario.')
          return
        }

        if (Math.abs(sumaPorcentajes - 100) > 0.01) {
          setFormError(`Los porcentajes deben sumar 100%. Actualmente suman ${sumaPorcentajes}%.`)
          return
        }
      }

      propietariosPayload = form.propietarios.map((propietario) => {
        // Con un único propietario el 100% es implícito: nunca se le pidió.
        const porcentaje = variosPropietarios ? Number(propietario.porcentaje) : 100

        if (propietario.clienteNum !== '') {
          return { cliente_num: Number(propietario.clienteNum), porcentaje }
        }

        return {
          porcentaje,
          nombre: propietario.nombre.trim(),
          apellido: propietario.apellido.trim(),
          telefono: propietario.telefono.trim(),
          nacionalidad: propietario.nacionalidad.trim(),
          dni: propietario.dni.trim(),
          cuil: propietario.cuil.trim(),
          direccion: propietario.domicilioLegal.trim(),
          email: propietario.domicilioElectronico.trim(),
        }
      })
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
        const saved = await createPropiedad({
          direccion: form.direccion.trim(),
          ambientes,
          comision: Number(form.comision),
          propietarios: propietariosPayload!,
        })
        setPropiedades((current) => [saved, ...current])
        setFeedback('Propiedad creada correctamente.')
      }
    } catch (e) {
      setFormError(mensajeDe(e, 'No se pudo guardar la propiedad.'))
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
    } catch (e) {
      setError(mensajeDe(e, 'No se pudo eliminar la propiedad. Puede tener contratos asociados.'))
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
    propietariosDisponibles,
    variosPropietarios,
    sumaPorcentajes,
    handlePropietarioChange,
    addPropietario,
    removePropietario,
  }
}
