import Button from '../components/Button'
import Card from '../components/Card'
import Select from '../components/Select'
import { monthOptions, useRecibosController, yearOptions } from '../controllers/useRecibosController.tsx'
import styles from './Recibos.module.css'

function Recibos() {
  const {
    loading,
    error,
    feedback,
    recibos,
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
  } = useRecibosController()

  return (
    <div className={styles.page}>
      <section className={styles.toolbar}>
        <div>
          <h2>Recibos</h2>
          <p>Generá recibos, revisá el historial y exportá la información disponible.</p>
        </div>
        {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}

      <section className={styles.twoColumn}>
        <Card title="Datos del recibo" subtitle="Selecciona el mes y año de los recibos a generar">
          <div className={styles.form}>
            <Select label="Mes" options={monthOptions} value={form.mes} onChange={(event) => setForm((current) => ({ ...current, mes: event.target.value }))} />
            <Select label="Año" options={yearOptions} value={form.anio} onChange={(event) => setForm((current) => ({ ...current, anio: event.target.value }))} />
          </div>

          <div className={styles.actions}>
            <Button onClick={() => void handleGenerate()}>Generar recibo</Button>
            <Button variant="secondary" onClick={() => void handleDownloadExcel()}>Descargar Excel</Button>
          </div>
        </Card>

        <Card title="Resumen" subtitle="Importes calculados a partir del ultimo ajuste">
          <div className={styles.summaryGrid}>
            <div><span>Ingresos totales</span><strong>{formatCurrency(totalIngresos)}</strong></div>
            <div><span>Cantidad de recibos activos</span><strong>{cantidadRecibosActivos}</strong></div>
            <div><span>Aumento porcentual respecto al mes anterior</span><strong>{formatPercent(aumentoPorcentual)}</strong></div>
            <div><span>Aumento monetario respecto al mes anterior</span><strong>{formatCurrency(aumentoMonetario)}</strong></div>
          </div>
        </Card>
      </section>

      <Card title="Historial de ingresos por comisiones" >
        {loading ? <div className={styles.emptyState}>Cargando recibos...</div> : null}
        {!loading && recibos.length === 0 ? <div className={styles.emptyState}>Todavía no hay historial de ingresos por comisiones.</div> : null}
        {!loading && recibos.length > 0 ? (
          <div className={styles.receiptList}>
            {recibos.map((recibo) => (
              <article key={recibo.id}>
                <strong>{recibo.mes + " " + recibo.anio}</strong>
                <span>{"Ingresos por comisiones: "}{formatCurrency(recibo.total)} </span>
              </article>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default Recibos