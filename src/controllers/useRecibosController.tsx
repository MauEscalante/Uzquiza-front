import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatPercent } from '../services/api'
import { descargarExcelMock, generarRecibo, listHistorialIngreso } from '../services/recibosService'
import { getContratosSnapshot } from '../services/contratosService'
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

function resolveContratoBase() {
	const contratos = getContratosSnapshot()
	return contratos.find((contrato) => contrato.estado === 'Activo') ?? contratos[0] ?? null
}

export function useRecibosController() {
	const [recibos, setRecibos] = useState<Recibo[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [feedback, setFeedback] = useState('')
	const [form, setForm] = useState<FormState>(emptyForm)

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

		void loadRecibos()

		return () => {
			mounted = false
		}
	}, [])

	const sortedRecibos = useMemo(() => sortRecibosDescendente(recibos), [recibos])
	const latestRecibo = sortedRecibos[0] ?? null
	const previousRecibo = sortedRecibos[1] ?? null

	const totalIngresos = useMemo(() => recibos.reduce((total, recibo) => total + recibo.total, 0), [recibos])
	const cantidadRecibosActivos = recibos.length
	const aumentoMonetario = latestRecibo && previousRecibo ? latestRecibo.total - previousRecibo.total : 0
	const aumentoPorcentual = previousRecibo && previousRecibo.total > 0
		? ((latestRecibo?.total ?? 0) - previousRecibo.total) / previousRecibo.total * 100
		: 0

	async function handleGenerate() {
		setError('')

		if (!form.mes || !form.anio) {
			setError('Seleccioná un mes y un año para generar el recibo.')
			return
		}

		const contrato = resolveContratoBase()

		if (!contrato) {
			setError('No hay contratos disponibles para generar recibos.')
			return
		}

		const payload: ReciboFormValues = {
			mes: form.mes,
			anio: form.anio,
		}

		const created = await generarRecibo(payload)

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
