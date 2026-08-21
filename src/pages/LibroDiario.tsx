import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import StatusBadge from '../components/StatusBadge'
import Table from '../components/Table'
import { cuentaOptions, tipoOptions, useLibroDiarioController } from '../controllers/useLibroDiarioController'
import type { MovimientoDiario, TipoMovimiento } from '../types/libroDiario'
import styles from './LibroDiario.module.css'

/** Cada movimiento ocupa una sola de las tres columnas de importe. */
function montoDe(movimiento: MovimientoDiario, tipo: TipoMovimiento, formatCurrency: (value: number) => string) {
  return movimiento.tipo === tipo ? formatCurrency(movimiento.monto) : ''
}

function LibroDiario() {
  const {
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
  } = useLibroDiarioController()

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.toolbar}>
          <div>
            <h2>Libro diario</h2>
            <p>
              {esPeriodoActual
                ? 'Movimientos de caja del período seleccionado.'
                : `${periodoLabel} ya cerró: se puede consultar, pero no registrar movimientos.`}
            </p>
          </div>
          <div className={styles.filters}>
            <Select label="Mes" options={monthOptions} value={mes} onChange={(event) => setMes(event.target.value)} />
            <Select label="Año" options={yearOptions} value={anio} onChange={(event) => cambiarAnio(event.target.value)} />
            <Button onClick={abrirMovimiento} disabled={!esPeriodoActual}>Registrar movimiento</Button>
          </div>
        </div>

        {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
        {error ? <div className={styles.error}>{error}</div> : null}
      </Card>

      {loading ? <Card><div className={styles.emptyState}>Cargando el libro diario...</div></Card> : null}

      {!loading && movimientos.length === 0 ? (
        <Card><div className={styles.emptyState}>No hay movimientos registrados en {periodoLabel}.</div></Card>
      ) : null}

      {!loading && movimientos.length > 0 ? (
        <Table
          headers={['Fecha', 'A qué corresponde', 'Efectivo', 'Depósito', 'Egresos', 'Cuenta', 'Acciones']}
          footer={(
            <tr>
              <td colSpan={2}>Estado de la caja · {periodoLabel}</td>
              <td>{formatCurrency(resumen.total_efectivo)}</td>
              <td>{formatCurrency(resumen.total_transferencias)}</td>
              <td>{formatCurrency(resumen.total_egresos)}</td>
              <td colSpan={2} />
            </tr>
          )}
        >
          {movimientos.map((movimiento) => (
            <tr key={movimiento.movimiento_id}>
              <td>{formatDate(movimiento.fecha)}</td>
              <td>{movimiento.concepto}</td>
              <td className={styles.ingreso}>{montoDe(movimiento, 'INGRESO', formatCurrency)}</td>
              <td className={styles.deposito}>{montoDe(movimiento, 'DEPOSITO', formatCurrency)}</td>
              <td className={styles.egreso}>{montoDe(movimiento, 'EGRESO', formatCurrency)}</td>
              <td>{movimiento.cuenta ? <StatusBadge variant="info">{movimiento.cuenta}</StatusBadge> : '—'}</td>
              <td>
                <Button variant="danger" onClick={() => void handleDelete(movimiento)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </Table>
      ) : null}

      <section className={styles.twoColumn}>
        <Card title="Estado de la caja" subtitle={periodoLabel}>
          <div className={styles.summaryGrid}>
            <div><span>Total ingresos en efectivo</span><strong>{formatCurrency(resumen.total_efectivo)}</strong></div>
            <div><span>Total ingresos por transferencia</span><strong>{formatCurrency(resumen.total_transferencias)}</strong></div>
            <div><span>Total egresos</span><strong>{formatCurrency(resumen.total_egresos)}</strong></div>
            <div><span>Retirado de caja</span><strong>{formatCurrency(resumen.total_retiros)}</strong></div>
            {/* Los cobros por transferencia no pasan por la caja, por eso no suman acá. */}
            <div className={styles.totalBox}><span>Total en caja</span><strong>{formatCurrency(resumen.total_caja)}</strong></div>
          </div>
        </Card>

        <Card title="Retiros de caja" subtitle="Dinero que se saca de la caja de la inmobiliaria">
          <div className={styles.retiroActions}>
            <Button variant="secondary" onClick={abrirRetiro} disabled={!esPeriodoActual}>Registrar retiro</Button>
          </div>

          {retiros.length === 0 ? (
            <div className={styles.emptyState}>No hubo retiros en {periodoLabel}.</div>
          ) : (
            <div className={styles.retiroList}>
              {retiros.map((retiro) => (
                <article key={retiro.movimiento_id}>
                  <div>
                    <strong>{retiro.concepto}</strong>
                    <span>{formatDate(retiro.fecha)}{retiro.cuenta ? ' · ' + retiro.cuenta : ''}</span>
                  </div>
                  <div className={styles.retiroMonto}>
                    <strong>{formatCurrency(retiro.monto)}</strong>
                    <Button variant="ghost" onClick={() => void handleDelete(retiro)}>Eliminar</Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Modal
        open={movimientoModalOpen}
        title="Registrar movimiento"
        onClose={cerrarModales}
        footer={(
          <>
            <Button variant="ghost" onClick={cerrarModales}>Cancelar</Button>
            <Button type="submit" form="movimiento-form" disabled={guardando}>Guardar</Button>
          </>
        )}
      >
        <form
          id="movimiento-form"
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <Select label="Tipo" options={tipoOptions} value={form.tipo} onChange={(event) => handleTipoChange(event.target.value as TipoMovimiento)} />
          <p className={styles.hint}>Fecha: {formatDate(form.fecha)}</p>

          {requierePropiedad(form.tipo) ? (
            // El piso y el depto ya vienen en la dirección de la propiedad.
            <Select label="Propiedad" options={propiedadOptions} value={form.propiedadId} onChange={(event) => setForm((current) => ({ ...current, propiedadId: event.target.value }))} />
          ) : (
            <Input label="A qué corresponde" placeholder="Ej: Monotributo" value={form.concepto} onChange={(event) => setForm((current) => ({ ...current, concepto: event.target.value }))} />
          )}

          <Input label="Monto" type="number" min={0} step="0.01" value={form.monto} onChange={(event) => setForm((current) => ({ ...current, monto: event.target.value }))} />

          {/* El egreso sale de la caja. El resumen es del período que se está mirando,
              así que el disponible solo se muestra si ese período es el mes en curso. */}
          {form.tipo === 'EGRESO' && esPeriodoActual ? (
            <p className={styles.hint}>Disponible en caja: {formatCurrency(resumen.total_caja)}</p>
          ) : null}

          {/* Solo el depósito va a una cuenta: el efectivo y el egreso no la tienen. */}
          {form.tipo === 'DEPOSITO' ? (
            <Select
              label="Cuenta a la que se transfirió"
              options={cuentaOptions}
              value={form.cuenta}
              onChange={(event) => setForm((current) => ({ ...current, cuenta: event.target.value }))}
            />
          ) : null}

          {requierePropiedad(form.tipo) ? (
            <p className={styles.hint}>Al guardar, la propiedad queda marcada como abonada.</p>
          ) : null}
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>

      <Modal
        open={retiroModalOpen}
        title="Registrar retiro de caja"
        onClose={cerrarModales}
        footer={(
          <>
            <Button variant="ghost" onClick={cerrarModales}>Cancelar</Button>
            <Button type="submit" form="retiro-form" disabled={guardando}>Guardar</Button>
          </>
        )}
      >
        <form
          id="retiro-form"
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <p className={styles.hint}>Fecha: {formatDate(form.fecha)}</p>
          <Input label="Monto" type="number" min={0} step="0.01" value={form.monto} onChange={(event) => setForm((current) => ({ ...current, monto: event.target.value }))} />
          {esPeriodoActual ? (
            <p className={styles.hint}>Disponible en caja: {formatCurrency(resumen.total_caja)}</p>
          ) : null}
          {formError ? <div className={styles.error}>{formError}</div> : null}
        </form>
      </Modal>
    </div>
  )
}

export default LibroDiario
