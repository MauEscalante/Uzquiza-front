import Input from "./Input"
import styles from "../pages/Contratos.module.css"
import { formatCurrency, formatDate } from "../services/api"
import type { RescisionCalculo } from "../types/contrato"

interface EntregaLlavesFormProps {
    direccion: string
    /** Salida comprometida al registrarse el aviso, para contrastar con la real. */
    fechaSalidaAgendada: string | null
    fecha: string
    onFechaChange: (value: string) => void
    /** Solo se usa cuando el cálculo viene con `importe_estimado`. */
    importe: string
    onImporteChange: (value: string) => void
    calculo: RescisionCalculo | null
    loading?: boolean
    error?: string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function EntregaLlavesForm({
    direccion,
    fechaSalidaAgendada,
    fecha,
    onFechaChange,
    importe,
    onImporteChange,
    calculo,
    loading,
    error,
    onSubmit,
}: EntregaLlavesFormProps) {
    // El mes de la entrega manda sobre el que se avisó: si se corrió, ese mes se paga
    // entero igual, y el cálculo de abajo ya viene hecho contra el mes correcto.
    const mesCorrido = Boolean(
        calculo && fechaSalidaAgendada && calculo.fecha_salida !== fechaSalidaAgendada,
    )

    return (
        <form id="entrega-llaves-form" className={styles.rescisionForm} onSubmit={onSubmit}>
            <div className={styles.rescisionPropiedad}>
                <span>Propiedad</span>
                <strong>{direccion}</strong>
            </div>

            <Input
                label="Fecha de entrega de llaves"
                name="fecha-entrega"
                type="date"
                value={fecha}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => onFechaChange(event.target.value)}
            />

            {fechaSalidaAgendada ? (
                <p className={styles.rescisionNota}>
                    Salida agendada al registrarse el aviso: {formatDate(fechaSalidaAgendada)}.
                </p>
            ) : null}

            {loading ? <div className={styles.emptyState}>Calculando...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {calculo && !loading ? (
                <>
                    {/*
                      El tramo de valor_historico no cubre el mes de la entrega: el ajuste
                      de ese mes no se cargó. Se pide el alquiler en vez de calcular la
                      penalidad sobre un valor viejo.
                    */}
                    {calculo.importe_estimado ? (
                        <>
                            <p className={styles.rescisionAviso}>
                                Todavía no está cargado el alquiler de{' '}
                                {formatDate(calculo.fecha_salida)}. Indicá cuánto pagó ese mes
                                para calcular la penalidad; el último valor conocido es{' '}
                                {formatCurrency(calculo.importe_vigente)}, vigente desde{' '}
                                {formatDate(calculo.importe_vigente_desde)}.
                            </p>
                            <Input
                                label="Alquiler del mes de salida"
                                name="importe-alquiler"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={String(calculo.importe_vigente)}
                                value={importe}
                                onChange={(event) => onImporteChange(event.target.value)}
                            />
                        </>
                    ) : null}

                    <div className={styles.detailGrid}>
                        <div><span>Mes que paga</span><strong>{formatDate(calculo.fecha_salida)}</strong></div>
                        <div><span>Fin pactado</span><strong>{formatDate(calculo.fecha_fin_original)}</strong></div>
                        <div><span>Meses restantes</span><strong>{calculo.meses_restantes}</strong></div>
                        <div>
                            <span>Alquiler tomado</span>
                            <strong>
                                {calculo.importe_estimado && importe
                                    ? formatCurrency(Number(importe))
                                    : formatCurrency(calculo.importe_vigente)}
                            </strong>
                        </div>
                    </div>

                    {mesCorrido ? (
                        <p className={styles.rescisionAviso}>
                            La entrega cayó en un mes posterior al avisado, así que ese mes se
                            paga entero y los meses restantes se contaron desde ahí.
                        </p>
                    ) : null}

                    {calculo.anticipada ? (
                        <div className={styles.rescisionResumen}>
                            <span>
                                {formatCurrency(
                                    calculo.importe_estimado && importe
                                        ? Number(importe)
                                        : calculo.importe_vigente,
                                )}{' '}
                                × {calculo.meses_restantes}{' '}
                                {calculo.meses_restantes === 1 ? 'mes' : 'meses'} ×{' '}
                                {Math.round(calculo.porcentaje_penalidad * 100)}%
                            </span>
                            <strong className={styles.penalidad}>
                                {calculo.importe_estimado && importe
                                    ? formatCurrency(
                                        Number(importe) * calculo.meses_restantes * calculo.porcentaje_penalidad,
                                    )
                                    : formatCurrency(calculo.penalidad)}
                            </strong>
                        </div>
                    ) : (
                        <div className={styles.rescisionResumen}>
                            <span>El contrato llega a término: no corresponde penalidad.</span>
                            <strong className={styles.sinPenalidad}>Sin penalidad</strong>
                        </div>
                    )}
                </>
            ) : null}
        </form>
    )
}
