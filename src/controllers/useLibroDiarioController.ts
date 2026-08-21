import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatDate, mensajeDe } from '../services/api'
import { crearMovimiento, eliminarMovimiento, listMovimientos, listRetiros, obtenerResumenCaja } from '../services/libroDiarioService'
import { listPropiedades } from '../services/propiedadesService'
import { crearMovimientoVacio, hoy } from '../types/libroDiario'
import type { MovimientoDiario, MovimientoFormValues, ResumenCaja, TipoMovimiento } from '../types/libroDiario'
import type { Propiedad } from '../types/propiedad'

const monthNames = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]

/** Cuántos años hacia atrás se pueden consultar, contando el actual. */
const ANIOS_CONSULTABLES = 4

export const tipoOptions: Array<{ label: string; value: TipoMovimiento }> = [
	// El valor sigue siendo INGRESO: es lo que espera la base, solo cambia el texto.
	{ label: 'Efectivo', value: 'INGRESO' },
	{ label: 'Depósito', value: 'DEPOSITO' },
	{ label: 'Egreso', value: 'EGRESO' },
]

export const cuentaOptions = [
	{ label: 'Sin especificar', value: '' },
	{ label: 'Kike', value: 'Kike' },
	{ label: 'Dai', value: 'Dai' },
]

/** Los ingresos y depósitos se registran contra una propiedad; el resto no. */
function requierePropiedad(tipo: TipoMovimiento) {
	return tipo === 'INGRESO' || tipo === 'DEPOSITO'
}

const resumenVacio: ResumenCaja = {
	total_efectivo: 0,
	total_transferencias: 0,
	total_egresos: 0,
	total_retiros: 0,
	total_caja: 0,
}

export function useLibroDiarioController() {
	// El mes va sin cero adelante ('8', no '08') porque es el value de las opciones.
	const [anioHoy, mesConCero] = hoy().split('-')
	const mesHoy = String(Number(mesConCero))

	const [mes, setMes] = useState(mesHoy)
	const [anio, setAnio] = useState(anioHoy)

	const [movimientos, setMovimientos] = useState<MovimientoDiario[]>([])
	const [retiros, setRetiros] = useState<MovimientoDiario[]>([])
	const [resumen, setResumen] = useState<ResumenCaja>(resumenVacio)
	const [propiedades, setPropiedades] = useState<Propiedad[]>([])

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [feedback, setFeedback] = useState('')

	const [movimientoModalOpen, setMovimientoModalOpen] = useState(false)
	const [retiroModalOpen, setRetiroModalOpen] = useState(false)
	const [form, setForm] = useState<MovimientoFormValues>(() => crearMovimientoVacio('INGRESO'))
	const [formError, setFormError] = useState('')
	const [guardando, setGuardando] = useState(false)

	const cargarMes = useCallback(async () => {
		const [movimientosDelMes, retirosDelMes, resumenDelMes] = await Promise.all([
			listMovimientos(anio, mes),
			listRetiros(anio, mes),
			obtenerResumenCaja(anio, mes),
		])
		setMovimientos(movimientosDelMes)
		setRetiros(retirosDelMes)
		setResumen(resumenDelMes)
	}, [anio, mes])

	useEffect(() => {
		let mounted = true

		async function cargar() {
			setLoading(true)
			setError('')
			try {
				await cargarMes()
			} catch (e) {
				if (mounted) {
					setError(mensajeDe(e, 'No se pudo cargar el libro diario.'))
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		void cargar()
		return () => {
			mounted = false
		}
	}, [cargarMes])

	// Las propiedades no dependen del mes elegido, se cargan una sola vez.
	useEffect(() => {
		let mounted = true

		async function cargarPropiedades() {
			try {
				const data = await listPropiedades()
				if (mounted) {
					setPropiedades(data)
				}
			} catch (e) {
				if (mounted) {
					setError(mensajeDe(e, 'No se pudieron cargar las propiedades.'))
				}
			}
		}

		void cargarPropiedades()
		return () => {
			mounted = false
		}
	}, [])

	const propiedadOptions = useMemo(
		() => [
			{ label: 'Seleccioná una propiedad', value: '' },
			...propiedades.map((propiedad) => ({ label: propiedad.direccion, value: String(propiedad.propiedad_id) })),
		],
		[propiedades],
	)

	const periodoLabel = useMemo(() => `${monthNames[Number(mes) - 1]} ${anio}`, [mes, anio])

	// Los movimientos siempre se guardan con la fecha de hoy: fuera del mes en curso la
	// pantalla es solo de consulta, y el saldo del resumen no es el disponible real.
	const esPeriodoActual = anio === anioHoy && mes === mesHoy

	// El año en curso es el último que se ofrece: no hay nada que ver más adelante.
	const yearOptions = useMemo(
		() =>
			Array.from({ length: ANIOS_CONSULTABLES }, (_, index) => {
				const year = String(Number(anioHoy) - (ANIOS_CONSULTABLES - 1) + index)
				return { label: year, value: year }
			}),
		[anioHoy],
	)

	// El value es el número de mes porque es lo que espera el backend.
	const monthOptions = useMemo(() => {
		const ultimoMes = anio === anioHoy ? Number(mesHoy) : monthNames.length
		return monthNames.slice(0, ultimoMes).map((month, index) => ({ label: month, value: String(index + 1) }))
	}, [anio, anioHoy, mesHoy])

	/** Volver al año en curso desde un mes que en ese año todavía no llegó. */
	function cambiarAnio(nuevoAnio: string) {
		setAnio(nuevoAnio)
		if (nuevoAnio === anioHoy && Number(mes) > Number(mesHoy)) {
			setMes(mesHoy)
		}
	}

	function abrirMovimiento() {
		setForm(crearMovimientoVacio('INGRESO'))
		setFormError('')
		setMovimientoModalOpen(true)
	}

	// De la caja solo sale efectivo: el retiro no pide motivo ni cuenta, así que el
	// concepto (obligatorio en la base) se completa solo.
	function abrirRetiro() {
		setForm({ ...crearMovimientoVacio('RETIRO'), concepto: 'Retiro de caja' })
		setFormError('')
		setRetiroModalOpen(true)
	}

	function cerrarModales() {
		setMovimientoModalOpen(false)
		setRetiroModalOpen(false)
		setFormError('')
	}

	/**
	 * Al cambiar de tipo se limpian los campos que dejaron de aplicar.
	 *
	 * La cuenta se limpia salvo en depósito porque el selector no se muestra en los
	 * otros tipos: si no, una cuenta elegida antes se guardaría sin que se vea.
	 */
	function handleTipoChange(tipo: TipoMovimiento) {
		setForm((current) => ({
			...current,
			tipo,
			...(tipo === 'DEPOSITO' ? {} : { cuenta: '' }),
			...(requierePropiedad(tipo) ? { concepto: '' } : { propiedadId: '' }),
		}))
	}

	async function handleSubmit() {
		setFormError('')

		const monto = Number(form.monto)
		if (!form.monto || Number.isNaN(monto) || monto <= 0) {
			setFormError('Ingresá un monto mayor a cero.')
			return
		}

		if (requierePropiedad(form.tipo) && !form.propiedadId) {
			setFormError('Indicá a qué propiedad corresponde.')
			return
		}

		if (!requierePropiedad(form.tipo) && !form.concepto.trim()) {
			setFormError('Ingresá a qué corresponde el movimiento.')
			return
		}

		// En un depósito la cuenta es el dato que dice a dónde se transfirió la plata.
		if (form.tipo === 'DEPOSITO' && !form.cuenta) {
			setFormError('Indicá a qué cuenta se transfirió el depósito.')
			return
		}

		setGuardando(true)
		try {
			// La fecha se resuelve recién acá: si el modal quedó abierto pasada la
			// medianoche, la que se calculó al abrirlo ya no sería la de hoy.
			await crearMovimiento({ ...form, fecha: hoy() })
			await cargarMes()
			cerrarModales()
			setFeedback(
				form.tipo === 'RETIRO'
					? 'Retiro de caja registrado.'
					: requierePropiedad(form.tipo)
						? 'Movimiento registrado y propiedad marcada como abonada.'
						: 'Movimiento registrado.',
			)
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.')
		} finally {
			setGuardando(false)
		}
	}

	async function handleDelete(movimiento: MovimientoDiario) {
		setError('')
		try {
			await eliminarMovimiento(movimiento.movimiento_id)
			await cargarMes()
			setFeedback('Movimiento eliminado.')
		} catch (e) {
			setError(mensajeDe(e, 'No se pudo eliminar el movimiento.'))
		}
	}

	return {
		mes,
		setMes,
		anio,
		cambiarAnio,
		monthOptions,
		yearOptions,
		periodoLabel,
		esPeriodoActual,
		movimientos,
		retiros,
		resumen,
		propiedadOptions,
		loading,
		error,
		feedback,
		movimientoModalOpen,
		retiroModalOpen,
		form,
		setForm,
		formError,
		guardando,
		abrirMovimiento,
		abrirRetiro,
		cerrarModales,
		handleTipoChange,
		handleSubmit,
		handleDelete,
		requierePropiedad,
		formatCurrency,
		formatDate,
	}
}
