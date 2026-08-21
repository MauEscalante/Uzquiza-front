import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatPercent, mensajeDe } from '../services/api'
import { descargarExcel, esperarAjuste, generarRecibo, listHistorialIngreso, obtenerResumen } from '../services/recibosService'
import type { EstadoAjuste } from '../services/recibosService'
import type { Recibo, ReciboFormValues } from '../types/recibo'

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

const currentDate = new Date()
const currentYear = currentDate.getFullYear()

export const monthOptions = monthNames.map((month) => ({ label: month, value: month }))
export const yearOptions = Array.from({ length: 4 }, (_, index) => String(currentYear - 1 + index)).map((year) => ({
	label: year,
	value: year,
}))

interface FormState {
	mes: string
	anio: string
}

const emptyForm: FormState = {
	mes: monthNames[currentDate.getMonth()],
	anio: String(currentYear),
}

const monthOrder = new Map(monthNames.map((month, index) => [month, index]))

function sortRecibosDescendente(recibos: Recibo[]) {
	return [...recibos].sort((a, b) => {
		const first = Number(a.anio) * 12 + (monthOrder.get(a.mes) ?? 0)
		const second = Number(b.anio) * 12 + (monthOrder.get(b.mes) ?? 0)
		return second - first
	})
}



export function useRecibosController() {
	const [recibos, setRecibos] = useState<Recibo[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [feedback, setFeedback] = useState('')
	const [form, setForm] = useState<FormState>(emptyForm)
	const [totalIngresos, setTotalIngresos] = useState(0);
	const [cantidadRecibosActivos, setCantidadRecibosActivos] = useState(0);
	const [aumentoPorcentual, setAumentoPorcentual] = useState(0);
	const [aumentoMonetario, setAumentoMonetario] = useState(0);
	// Generar recibos reescribe la planilla y marca las propiedades como impagas,
	// así que al terminar hay que volver a pedir el historial y el resumen.
	const [generando, setGenerando] = useState(false);
	const [estadoAjuste, setEstadoAjuste] = useState<EstadoAjuste | null>(null);
	const [recarga, setRecarga] = useState(0);

	useEffect(() => {
		let mounted = true

		async function loadRecibos() {
			try {
				const data = await listHistorialIngreso()
				if (mounted) {
					setRecibos(data)
				}
			} catch {
				if (mounted) {
					setError('No se pudieron cargar los recibos.')
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		const cargarResumen = async () => {
			try {
				const resumen = await obtenerResumen()
				if (!mounted) return
				setTotalIngresos(resumen.totalIngresos)
				setCantidadRecibosActivos(resumen.cantidadRecibosActivos)
				setAumentoPorcentual(resumen.aumentoPorcentual)
				setAumentoMonetario(resumen.aumentoMonetario)
			} catch {
				if (mounted) {
					setError('No se pudo cargar el resumen.')
				}
			}
		};

		void loadRecibos()
		void cargarResumen()
		return () => {
			mounted = false
		}
	}, [recarga])

	const sortedRecibos = useMemo(() => sortRecibosDescendente(recibos), [recibos])


	async function handleGenerate() {
		setError('')

		if (!form.mes || !form.anio) {
			setError('Seleccioná un mes y un año para generar el recibo.')
			return
		}

		const payload: ReciboFormValues = {
			mes: form.mes,
			anio: form.anio,
		}

		// El backend resuelve solo qué contratos ajustar; antes se le mandaban dos
		// listas en el body que ignoraba por completo.
		setGenerando(true)
		setFeedback('')
		setEstadoAjuste('pendiente')
		try {
			// El POST solo encola: vuelve al instante con el trabajo. Ajustar la
			// planilla tarda más de un minuto, así que el progreso se consulta aparte.
			const encolado = await generarRecibo(payload)
			const terminado = await esperarAjuste(encolado.ajuste_id, setEstadoAjuste)
			setFeedback(
				`Recibos generados para ${payload.mes}/${payload.anio}: ` +
				`${terminado.contratos_ajustados ?? 0} contratos ajustados, ` +
				`${terminado.propiedades_marcadas_adeuda ?? 0} propiedades marcadas como impagas.`,
			)
			setRecarga((n) => n + 1)
		} catch (e) {
			setError(mensajeDe(e, 'No se pudieron generar los recibos.'))
		} finally {
			setGenerando(false)
			setEstadoAjuste(null)
		}
	}

	async function handleDownloadExcel() {
		setError('')
		try {
			setFeedback(await descargarExcel())
		} catch (e) {
			setError(mensajeDe(e, 'No se pudo descargar la planilla.'))
		}
	}

	return {
		loading,
		error,
		feedback,
		recibos: sortedRecibos,
		form,
		setForm,
		generando,
		estadoAjuste,
		handleGenerate,
		handleDownloadExcel,
		formatCurrency,
		formatPercent,
		totalIngresos,
		cantidadRecibosActivos,
		aumentoPorcentual,
		aumentoMonetario,
	}
}
