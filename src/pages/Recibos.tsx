import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Select from '../components/Select'
import { descargarExcelMock, generarRecibo, listRecibos } from '../services/recibosService'
import { listContratos } from '../services/contratosService'
import { formatCurrency } from '../services/api'
import type { Contrato } from '../types/contrato'
import type { Recibo, ReciboFormValues } from '../types/recibo'
import styles from './Recibos.module.css'

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const monthOptions = months.map((month) => ({ label: month, value: month }))
const yearOptions = ['2025', '2026', '2027'].map((year) => ({ label: year, value: year }))

function Recibos() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [form, setForm] = useState<ReciboFormValues>({ contrato: '', inquilino: '', mes: 'Julio', anio: '2026' })

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const [recibosData, contratosData] = await Promise.all([listRecibos(), listContratos()])
        if (mounted) {
          setRecibos(recibosData)
          setContratos(contratosData)
          if (contratosData[0]) {
            setForm({ contrato: contratosData[0].codigo, inquilino: contratosData[0].inquilino, mes: 'Julio', anio: '2026' })
          }
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

    void loadData()

    return () => {
      mounted = false
    }
  }, [])

  const currentContract = useMemo(() => contratos.find((contrato) => contrato.codigo === form.contrato) ?? contratos[0], [contratos, form.contrato])

  const importeAlquiler = currentContract?.importeActual ?? 0
  const comision = Math.round(importeAlquiler * 0.05)
  const otrosConceptos = 5000
  const total = importeAlquiler + comision + otrosConceptos

  async function handleGenerate() {
    if (!form.contrato || !form.inquilino) {
      setFeedback('Seleccioná contrato e inquilino antes de generar el recibo.')
      return
    }

    const created = await generarRecibo(form)
    setRecibos((current) => [created, ...current])
    setFeedback('Recibo generado correctamente. Más adelante se conectará con FastAPI.')
  }

  async function handleDownloadExcel() {
    const message = await descargarExcelMock()
    setFeedback(message)
  }

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Recibos</h2>
            <p>Generación mock con exportación preparada para FastAPI.</p>
          </div>
          {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>

      <section className={styles.twoColumn}>
        <Card title="Datos del recibo" subtitle="Seleccioná la información para generar el comprobante">
          <div className={styles.form}>
            <Select
              label="Contrato"
              options={contratos.map((contrato) => ({ label: `${contrato.codigo} - ${contrato.propiedad}`, value: contrato.codigo }))}
              value={form.contrato}
              onChange={(event) => {
                const selected = contratos.find((contrato) => contrato.codigo === event.target.value)
                setForm({
                  contrato: event.target.value,
                  inquilino: selected?.inquilino ?? '',
                  mes: form.mes,
                  anio: form.anio,
                })
              }}
            />
            <Select
              label="Inquilino"
              options={Array.from(new Set(contratos.map((contrato) => contrato.inquilino)))
                .filter(Boolean)
                .map((inquilino) => ({ label: inquilino, value: inquilino }))}
              value={form.inquilino}
              onChange={(event) => setForm((current) => ({ ...current, inquilino: event.target.value }))}
            />
            <Select label="Mes" options={monthOptions} value={form.mes} onChange={(event) => setForm((current) => ({ ...current, mes: event.target.value }))} />
            <Select label="Año" options={yearOptions} value={form.anio} onChange={(event) => setForm((current) => ({ ...current, anio: event.target.value }))} />
          </div>

          <div className={styles.actions}>
            <Button onClick={() => void handleGenerate()}>Generar recibo</Button>
            <Button variant="secondary" onClick={() => void handleDownloadExcel()}>Descargar Excel</Button>
          </div>
        </Card>

        <Card title="Resumen" subtitle="Importes calculados a partir del contrato seleccionado">
          <div className={styles.summaryGrid}>
            <div><span>Importe del alquiler</span><strong>{formatCurrency(importeAlquiler)}</strong></div>
            <div><span>Comisión</span><strong>{formatCurrency(comision)}</strong></div>
            <div><span>Otros conceptos</span><strong>{formatCurrency(otrosConceptos)}</strong></div>
            <div className={styles.totalBox}><span>Total</span><strong>{formatCurrency(total)}</strong></div>
          </div>
        </Card>
      </section>

      <Card title="Recibos generados" subtitle="Historial mock disponible">
        {loading ? <div className={styles.emptyState}>Cargando recibos...</div> : null}
        {!loading && recibos.length === 0 ? <div className={styles.emptyState}>Todavía no hay recibos generados.</div> : null}
        {!loading && recibos.length > 0 ? (
          <div className={styles.receiptList}>
            {recibos.map((recibo) => (
              <article key={recibo.id}>
                <strong>{recibo.contrato}</strong>
                <p>{recibo.inquilino} - {recibo.mes} {recibo.anio}</p>
                <span>{formatCurrency(recibo.total)} · {recibo.estado}</span>
              </article>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default Recibos