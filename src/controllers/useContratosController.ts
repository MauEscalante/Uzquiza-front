import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../services/api'
import {
  createContrato,
  getContratoDetails,
  listContratos,
  listPropiedadesResumen,
  type PropiedadResumen,
} from '../services/contratosService'
import type { Contrato, ContratoDetalle, ContratoEstado, ContratoFormValues, GaranteInput, GarantePropietarioFormValue, InquilinoFormValue, TipoGarantia } from '../types/contrato'
import { emptyGarantePropietario, emptyInquilino } from '../types/contrato'

interface FormState {
  propiedad: string
  inquilinos: InquilinoFormValue[]
  fechaInicio: string
  fechaFin: string
  importeActual: string
  deposito: string
  tipoAjuste: string
  periodicidad: string
  estado: ContratoEstado
  garantia: string
  // Garantia Propietaria
  direccionGarantia: string
  garantesPropietarios: GarantePropietarioFormValue[]
  // Garantes (hasta 3)
  nombreGarante1: string
  apellidoGarante1: string
  sueldoGarante1: string
  telefonoGarante1: string
  emailGarante1: string
  nombreGarante2: string
  apellidoGarante2: string
  sueldoGarante2: string
  telefonoGarante2: string
  emailGarante2: string
  nombreGarante3: string
  apellidoGarante3: string
  sueldoGarante3: string
  telefonoGarante3: string
  emailGarante3: string
}



const emptyForm: FormState = {
  propiedad: '',
  inquilinos: [emptyInquilino],
  fechaInicio: '',
  fechaFin: '',
  importeActual: '',
  deposito: '',
  tipoAjuste: 'IPC',
  periodicidad: 'Cuatrimestral',
  estado: 'Activo',
  garantia: 'GPremier',
  direccionGarantia: '',
  garantesPropietarios: [emptyGarantePropietario],
  nombreGarante1: '',
  apellidoGarante1: '',
  sueldoGarante1: '',
  telefonoGarante1: '',
  emailGarante1: '',
  nombreGarante2: '',
  apellidoGarante2: '',
  sueldoGarante2: '',
  telefonoGarante2: '',
  emailGarante2: '',
  nombreGarante3: '',
  apellidoGarante3: '',
  sueldoGarante3: '',
  telefonoGarante3: '',
  emailGarante3: '',
}

function buildGarantesPayload(form: FormState): { garantes: GaranteInput[]; direccion_garantia: string | null } {
  if (form.garantia === 'Garantia Propietaria') {
    return {
      direccion_garantia: form.direccionGarantia || null,
      garantes: form.garantesPropietarios
        .filter((garante) => garante.nombre.trim() !== '')
        .map((garante) => ({
          nombre: garante.nombre,
          apellido: garante.apellido,
          dni: garante.dni,
          telefono: garante.telefono,
        })),
    }
  }

  if (form.garantia === 'Garantes') {
    return {
      direccion_garantia: null,
      garantes: [1, 2, 3]
        .map((index) => ({
          nombre: form[`nombreGarante${index}` as keyof FormState] as string,
          apellido: form[`apellidoGarante${index}` as keyof FormState] as string,
          telefono: form[`telefonoGarante${index}` as keyof FormState] as string,
          sueldo: Number(form[`sueldoGarante${index}` as keyof FormState]) || undefined,
          email: form[`emailGarante${index}` as keyof FormState] as string,
        }))
        .filter((garante) => garante.nombre.trim() !== ''),
    }
  }

  return { garantes: [], direccion_garantia: null }
}

export function useContratosController() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState<ContratoDetalle | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [propiedades, setPropiedades] = useState<PropiedadResumen[]>([])

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

    async function loadPropiedades() {
      try {
        const data = await listPropiedadesResumen()
        if (mounted) {
          setPropiedades(data)
        }
      } catch {
        // La lista de contratos ya muestra su propio error; el selector queda vacío.
      }
    }

    void loadContratos()
    void loadPropiedades()

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

  function getPropiedadDireccion(propiedadId: string | number): string {
    const propiedad = propiedades.find((entry) => String(entry.propiedad_id) === String(propiedadId))
    return propiedad?.direccion ?? String(propiedadId)
  }

  function openCreateModal() {
    setEditingContrato(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }


  async function openDetail(contrato: Contrato) {
    setSelectedContrato(null)
    setDetailError('')
    setDetailOpen(true)
    setDetailLoading(true)

    try {
      const detalle = await getContratoDetails(contrato.contrato_id)
      setSelectedContrato(detalle)
    } catch {
      setDetailError('No se pudo cargar el detalle del contrato.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const primerInquilino = form.inquilinos[0]

    if (!form.propiedad || !form.fechaInicio || !form.fechaFin || !form.importeActual
      || !form.inquilinos.length || !primerInquilino.nombre || !primerInquilino.apellido || !primerInquilino.dni) {
      setFormError('Completá todos los campos del contrato (propiedad, fechas, importe e inquilinos).')
      return
    }

    const importeInicial = Number(form.importeActual)

    if (Number.isNaN(importeInicial) || importeInicial <= 0) {
      setFormError('El importe inicial debe ser un valor numérico válido.')
      return
    }

    const payload: ContratoFormValues = {
      propiedad: Number(form.propiedad),
      fecha_inicio: form.fechaInicio,
      fecha_fin: form.fechaFin,
      importe_inicial: importeInicial,
      deposito: form.deposito ? Number(form.deposito) : null,
      tipo_ajuste: form.tipoAjuste as ContratoFormValues['tipo_ajuste'],
      periodicidad: form.periodicidad as ContratoFormValues['periodicidad'],
      estado: form.estado,
      inquilinos: form.inquilinos.map((inquilino) => ({
        nombre: inquilino.nombre,
        apellido: inquilino.apellido,
        telefono: inquilino.telefono,
        dni: inquilino.dni,
        cuil: inquilino.cuil,
        nacionalidad: inquilino.nacionalidad,
        direccion: inquilino.domicilioLegal,
        email: inquilino.domicilioElectronico,
      })),
      garantia: form.garantia as TipoGarantia,
      ...buildGarantesPayload(form),
    }

    await createContrato(payload)

    setFeedback('Contrato creado correctamente.')
    setModalOpen(false)
    setEditingContrato(null)
    setForm(emptyForm)

    const data = await listContratos()
    setContratos(data)
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
    detailLoading,
    detailError,
    editingContrato,
    form,
    setForm,
    formError,
    feedback,
    filteredContratos,
    contratos,
    propiedades,
    openCreateModal,
    openDetail,
    handleSubmit,
    formatCurrency,
    getPropiedadDireccion,
  }
}