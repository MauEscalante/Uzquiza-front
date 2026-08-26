import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatDate, mensajeDe } from '../services/api'
import {
  calcularRescision,
  createContrato,
  getContratoDetails,
  cancelarRescision,
  entregarLlaves,
  listContratos,
  listPropiedadesResumen,
  registrarRescision,
  type PropiedadResumen,
} from '../services/contratosService'
import type { Contrato, ContratoDetalle, ContratoEstado, ContratoFormValues, GaranteInput, GarantePropietarioFormValue, InquilinoFormValue, RescisionCalculo, TipoGarantia } from '../types/contrato'
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

/** "2026-8" -> "2026-08", el formato que espera el value del selector. */
function claveMes(anio: number, mes: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

/**
 * Meses en los que se puede rescindir: el actual y el siguiente, nada más.
 *
 * Se descartan los anteriores al inicio del contrato, que el backend rechaza con
 * un 422 (`salida_antes_del_inicio`).
 */
function mesesDeSalida(fechaInicio: string): Array<{ label: string; value: string }> {
  const [anioInicio, mesInicio] = fechaInicio.slice(0, 10).split('-').map(Number)
  const inicio = anioInicio * 12 + (mesInicio - 1)
  const hoy = new Date()
  const formato = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })

  return [0, 1]
    .map((offset) => new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1))
    .filter((fecha) => fecha.getFullYear() * 12 + fecha.getMonth() >= inicio)
    .map((fecha) => ({
      label: formato.format(fecha),
      value: claveMes(fecha.getFullYear(), fecha.getMonth() + 1),
    }))
}

/**
 * El aviso quedo registrado pero las llaves todavia no se entregaron.
 *
 * En ese tramo el contrato sigue Activo a proposito: el mes de salida se cobra y se
 * ajusta como cualquier otro, y recien al entregarse las llaves se conoce el alquiler
 * con el que se calcula la penalidad.
 */
export function tieneRescisionPendiente(contrato: Contrato): boolean {
  return contrato.estado === 'Activo' && contrato.fecha_rescision !== null
}

/** "2026-09-28" -> "2026-09". El preview se pide por mes. */
function mesDeFecha(fecha: string): string {
  return fecha.slice(0, 7)
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
  const [rescisionContrato, setRescisionContrato] = useState<Contrato | null>(null)
  const [rescisionMes, setRescisionMes] = useState('')
  const [rescisionCalculo, setRescisionCalculo] = useState<RescisionCalculo | null>(null)
  const [rescisionLoading, setRescisionLoading] = useState(false)
  const [rescisionSubmitting, setRescisionSubmitting] = useState(false)
  const [rescisionError, setRescisionError] = useState('')
  const [entregaContrato, setEntregaContrato] = useState<Contrato | null>(null)
  const [entregaFecha, setEntregaFecha] = useState('')
  const [entregaImporte, setEntregaImporte] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadContratos() {
      try {
        const data = await listContratos()
        if (mounted) {
          setContratos(data)

        }
      } catch (e) {
        if (mounted) {
          setError(mensajeDe(e, 'No se pudieron cargar los contratos.'))
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
      } catch (e) {
        // La lista de contratos ya muestra su propio error; el selector queda vacío.
        console.error('No se pudieron cargar las propiedades del selector:', e)
      }
    }

    void loadContratos()
    void loadPropiedades()

    return () => {
      mounted = false
    }
  }, [])

  // Un solo preview para los dos modales: el del aviso pregunta por el mes del
  // selector, el de la entrega por el mes de la fecha de entrega. Asi la pantalla de
  // entrega sabe ANTES de confirmar si el alquiler de ese mes esta cargado o hay que
  // pedirlo (`importe_estimado`).
  const previewContratoId = rescisionContrato?.contrato_id ?? entregaContrato?.contrato_id ?? ''
  const previewMes = rescisionContrato
    ? rescisionMes
    : entregaFecha
      ? mesDeFecha(entregaFecha)
      : ''

  useEffect(() => {
    if (!previewContratoId || !previewMes) {
      setRescisionCalculo(null)
      return
    }

    let cancelado = false
    const [anio, mes] = previewMes.split('-').map(Number)

    setRescisionLoading(true)
    setRescisionError('')

    calcularRescision(previewContratoId, anio, mes)
      .then((calculo) => {
        if (!cancelado) {
          setRescisionCalculo(calculo)
        }
      })
      .catch((e) => {
        if (!cancelado) {
          setRescisionCalculo(null)
          setRescisionError(mensajeDe(e, 'No se pudo calcular la rescisión.'))
        }
      })
      .finally(() => {
        if (!cancelado) {
          setRescisionLoading(false)
        }
      })

    // Descarta la respuesta si el usuario ya cambió de mes o cerró el modal.
    return () => {
      cancelado = true
    }
  }, [previewContratoId, previewMes])

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
    } catch (e) {
      setDetailError(mensajeDe(e, 'No se pudo cargar el detalle del contrato.'))
    } finally {
      setDetailLoading(false)
    }
  }

  function openRescision(contrato: Contrato) {
    const opciones = mesesDeSalida(contrato.fecha_inicio)

    setRescisionContrato(contrato)
    setRescisionCalculo(null)
    setRescisionError('')
    setFeedback('')
    // La primera opción es el mes actual salvo que el contrato arranque el que viene.
    setRescisionMes(opciones[0]?.value ?? '')
  }

  function closeRescision() {
    setRescisionContrato(null)
    setRescisionMes('')
    setRescisionCalculo(null)
    setRescisionError('')
  }

  async function confirmRescision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!rescisionContrato || !rescisionMes) {
      return
    }

    const [anio, mes] = rescisionMes.split('-').map(Number)
    setRescisionSubmitting(true)

    try {
      const calculo = await registrarRescision(rescisionContrato.contrato_id, anio, mes)

      closeRescision()
      setFeedback(
        `Rescisión registrada: ${calculo.direccion} se desocupa en ${formatDate(calculo.fecha_salida)}. `
        + 'La penalidad se calcula al cargar la entrega de llaves.',
      )

      setContratos(await listContratos())
    } catch (e) {
      setRescisionError(mensajeDe(e, 'No se pudo registrar la rescisión.'))
    } finally {
      setRescisionSubmitting(false)
    }
  }

  function openEntregaLlaves(contrato: Contrato) {
    setEntregaContrato(contrato)
    setRescisionCalculo(null)
    setRescisionError('')
    setFeedback('')
    setEntregaImporte('')
    // Por defecto hoy: las llaves se cargan cuando ya se entregaron.
    setEntregaFecha(new Date().toISOString().slice(0, 10))
  }

  function closeEntregaLlaves() {
    setEntregaContrato(null)
    setEntregaFecha('')
    setEntregaImporte('')
    setRescisionCalculo(null)
    setRescisionError('')
  }

  async function confirmEntregaLlaves(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!entregaContrato || !entregaFecha) {
      return
    }

    // Solo se manda cuando el mes no esta liquidado; si no, el backend usa el tramo.
    const importe = rescisionCalculo?.importe_estimado ? Number(entregaImporte) : undefined

    if (rescisionCalculo?.importe_estimado && (!importe || Number.isNaN(importe) || importe <= 0)) {
      setRescisionError('Indicá el alquiler del mes de salida para poder calcular la penalidad.')
      return
    }

    setRescisionSubmitting(true)

    try {
      const calculo = await entregarLlaves(entregaContrato.contrato_id, entregaFecha, importe)

      closeEntregaLlaves()
      setFeedback(
        calculo.anticipada
          ? `Contrato de ${calculo.direccion} cerrado. Penalidad: ${formatCurrency(calculo.penalidad)}.`
          : `Contrato de ${calculo.direccion} cerrado a término, sin penalidad.`,
      )

      setContratos(await listContratos())
    } catch (e) {
      setRescisionError(mensajeDe(e, 'No se pudo registrar la entrega de llaves.'))
    } finally {
      setRescisionSubmitting(false)
    }
  }

  async function cancelarAviso(contrato: Contrato) {
    setError('')

    try {
      await cancelarRescision(contrato.contrato_id)
      setFeedback(`Se canceló la rescisión de ${getPropiedadDireccion(contrato.propiedad)}.`)
      setContratos(await listContratos())
    } catch (e) {
      setError(mensajeDe(e, 'No se pudo cancelar la rescisión.'))
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

    try {
      await createContrato(payload)
    } catch (e) {
      setFormError(mensajeDe(e, 'No se pudo crear el contrato.'))
      return
    }

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
    rescisionContrato,
    rescisionMes,
    setRescisionMes,
    rescisionCalculo,
    rescisionLoading,
    rescisionSubmitting,
    rescisionError,
    rescisionMesesOptions: rescisionContrato ? mesesDeSalida(rescisionContrato.fecha_inicio) : [],
    openRescision,
    closeRescision,
    confirmRescision,
    entregaContrato,
    entregaFecha,
    setEntregaFecha,
    entregaImporte,
    setEntregaImporte,
    openEntregaLlaves,
    closeEntregaLlaves,
    confirmEntregaLlaves,
    cancelarAviso,
  }
}