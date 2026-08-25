import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, formatCurrency, formatPercent } from '../services/api'
import { contarContratosActivos } from '../services/contratosService'
import {
	descargarPlanilla,
	getAjuste,
	listHistorialIngreso,
	solicitarAjuste,
} from '../services/recibosService'
import { currentMonthName, currentYearValue, mesANumero, monthOrder } from './periodo'
import type { Recibo } from '../types/recibo'

interface FormState {
	mes: string
	anio: string
}

const emptyForm: FormState = {
	mes: currentMonthName,
	anio: currentYearValue,
}

function sortRecibosDescendente(recibos: Recibo[]) {
	return [...recibos].sort((a, b) => {
		const first = Number(a.anio) * 12 + (monthOrder.get(a.mes) ?? 0)
		const second = Number(b.anio) * 12 + (monthOrder.get(b.mes) ?? 0)
		return second - first
	})
}

// El ajuste tarda más de un minuto (openpyxl parsea las 120 hojas y se consulta
// el IPC contra un servicio externo), así que se sigue por polling.
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

function sleep(ms: number) {
	return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function useRecibosController() {
	const [recibos, setRecibos] = useState<Recibo[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [feedback, setFeedback] = useState('')
	const [form, setForm] = useState<FormState>(emptyForm)
	const [cantidadRecibosActivos, setCantidadRecibosActivos] = useState(0)
	const [generating, setGenerating] = useState(false)
	const mountedRef = useRef(true)

	useEffect(() => {
		mountedRef.current = true

		async function loadRecibos() {
			try {
				const data = await listHistorialIngreso()
				if (mountedRef.current) {
					setRecibos(data)
				}
			} catch {
				if (mountedRef.current) {
					setError('No se pudieron cargar los recibos.')
				}
			} finally {
				if (mountedRef.current) {
					setLoading(false)
				}
			}
		}

		async function loadContratosActivos() {
			try {
				const total = await contarContratosActivos()
				if (mountedRef.current) {
					setCantidadRecibosActivos(total)
				}
			} catch {
				// El historial ya muestra su propio error; la métrica queda en 0.
			}
		}

		void loadRecibos()
		void loadContratosActivos()

		return () => {
			mountedRef.current = false
		}
	}, [])

	const sortedRecibos = useMemo(() => sortRecibosDescendente(recibos), [recibos])

	// El back no expone estos totales: se derivan de los dos últimos meses del
	// historial de ingresos.
	const { totalIngresos, aumentoMonetario, aumentoPorcentual } = useMemo(() => {
		const actual = sortedRecibos[0]?.total ?? 0

		// Con un solo mes cargado no hay contra qué comparar: mostrar el total del
		// mes como si fuera todo aumento sería mentir.
		if (sortedRecibos.length < 2) {
			return { totalIngresos: actual, aumentoMonetario: 0, aumentoPorcentual: 0 }
		}

		const anterior = sortedRecibos[1].total
		const diferencia = actual - anterior

		return {
			totalIngresos: actual,
			aumentoMonetario: diferencia,
			// formatPercent divide por 100, así que va en puntos porcentuales.
			aumentoPorcentual: anterior ? (diferencia / anterior) * 100 : 0,
		}
	}, [sortedRecibos])

	async function handleGenerate() {
		setError('')
		setFeedback('')

		if (!form.mes || !form.anio) {
			setError('Seleccioná un mes y un año para generar el recibo.')
			return
		}

		setGenerating(true)

		try {
			const ajuste = await solicitarAjuste(mesANumero(form.mes), Number(form.anio))
			setFeedback('Ajuste encolado, esperando que termine...')

			const limite = Date.now() + POLL_TIMEOUT_MS

			while (Date.now() < limite) {
				await sleep(POLL_INTERVAL_MS)

				if (!mountedRef.current) {
					return
				}

				const estadoActual = await getAjuste(ajuste.ajuste_id)

				if (estadoActual.estado === 'completado') {
					setFeedback(
						`Ajuste completado: ${estadoActual.contratos_ajustados ?? 0} contratos ajustados, `
						+ `${estadoActual.propiedades_marcadas_adeuda ?? 0} propiedades marcadas como adeuda.`,
					)
					return
				}

				if (estadoActual.estado === 'fallido') {
					setError(`El ajuste falló: ${estadoActual.error ?? 'sin detalle'}`)
					setFeedback('')
					return
				}

				setFeedback('Ajuste en proceso...')
			}

			setFeedback('')
			setError('El ajuste sigue corriendo y tardó más de lo esperado. Revisalo más tarde.')
		} catch (caught) {
			setFeedback('')

			if (caught instanceof ApiError && caught.status === 409) {
				setError('Ya hay un ajuste en curso. Esperá a que termine antes de lanzar otro.')
				return
			}

			setError(caught instanceof ApiError ? caught.message : 'No se pudo generar el ajuste.')
		} finally {
			if (mountedRef.current) {
				setGenerating(false)
			}
		}
	}

	async function handleDownloadExcel() {
		setError('')

		try {
			await descargarPlanilla()
			setFeedback('Planilla descargada.')
		} catch {
			setError('No se pudo descargar la planilla.')
		}
	}

	return {
		loading,
		error,
		feedback,
		generating,
		recibos: sortedRecibos,
		form,
		setForm,
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
