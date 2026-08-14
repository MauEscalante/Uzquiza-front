import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatPercent } from '../services/api'
import { descargarExcelMock, generarRecibo, listHistorialIngreso, obtenerRecibosAjustar, obtenerRecibosReAjustar, obtenerResumen } from '../services/recibosService'
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
			console.log('Cargando resumen...')
			const resumen = await obtenerResumen();
			setTotalIngresos(resumen.totalIngresos);
			setCantidadRecibosActivos(resumen.cantidadRecibosActivos);
			setAumentoPorcentual(resumen.aumentoPorcentual);
			setAumentoMonetario(resumen.aumentoMonetario);
		};

		void loadRecibos()
		void cargarResumen()
		return () => {
			mounted = false
		}
	}, [])

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

		//obtengo que recibos tengo que hacer el ajuste inicial
		const recibosAjustar = await obtenerRecibosAjustar(payload.mes, payload.anio)
		//obtengo recibos q tienen re ajuste
		const recibosReAjuste = await obtenerRecibosReAjustar(payload.mes, payload.anio)
		//generate recibo
		const created = await generarRecibo(payload, recibosAjustar, recibosReAjuste)


	}

	async function handleDownloadExcel() {
		setError('')
		const response = await descargarExcelMock()
		setFeedback(response)
	}

	return {
		loading,
		error,
		feedback,
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
