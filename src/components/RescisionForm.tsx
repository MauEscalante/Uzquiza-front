import Select from "./Select"
import styles from "../pages/Contratos.module.css"
import { formatCurrency, formatDate } from "../services/api"
import type { RescisionCalculo } from "../types/contrato"

interface RescisionFormProps {
    direccion: string
    /** Mes actual y mes siguiente, en formato "YYYY-MM". */
    mesesOptions: Array<{ label: string; value: string }>
    mesSeleccionado: string
    onMesChange: (value: string) => void
    calculo: RescisionCalculo | null
    loading?: boolean
    error?: string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function RescisionForm({
    direccion,
    mesesOptions,
    mesSeleccionado,
    onMesChange,
    calculo,
    loading,
    error,
    onSubmit,
}: RescisionFormProps) {
    return (
        <form id="rescision-form" className={styles.rescisionForm} onSubmit={onSubmit}>
            <div className={styles.rescisionPropiedad}>
                <span>Propiedad</span>
                <strong>{direccion}</strong>
            </div>

            {mesesOptions.length ? (
                <Select
                    label="Mes en que se va el inquilino"
                    name="mes-salida"
                    options={mesesOptions}
                    value={mesSeleccionado}
                    onChange={(event) => onMesChange(event.target.value)}
                />
            ) : (
                <div className={styles.error}>
                    Este contrato todavía no empezó: no hay un mes de salida válido.
                </div>
            )}

            <p className={styles.rescisionNota}>
                El día del mes es indistinto: se vaya a principio o a fin, el inquilino paga
                el mes completo. El contrato sigue activo y liquidando hasta que entregue
                las llaves.
            </p>

            {loading ? <div className={styles.emptyState}>Calculando...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {calculo && !loading && !error ? (
                <>
                    <div className={styles.detailGrid}>
                        <div><span>Se va el</span><strong>{formatDate(calculo.fecha_salida)}</strong></div>
                        <div><span>Fin pactado</span><strong>{formatDate(calculo.fecha_fin_original)}</strong></div>
                        <div><span>Meses restantes</span><strong>{calculo.meses_restantes}</strong></div>
                        <div><span>Alquiler tomado</span><strong>{formatCurrency(calculo.importe_vigente)}</strong></div>
                    </div>

                    {calculo.anticipada ? (
                        <div className={styles.rescisionResumen}>
                            <span>
                                {calculo.importe_estimado ? 'Penalidad estimada: ' : 'Penalidad: '}
                                {formatCurrency(calculo.importe_vigente)} × {calculo.meses_restantes}{' '}
                                {calculo.meses_restantes === 1 ? 'mes' : 'meses'} ×{' '}
                                {Math.round(calculo.porcentaje_penalidad * 100)}%
                            </span>
                            <strong className={styles.penalidad}>{formatCurrency(calculo.penalidad)}</strong>
                        </div>
                    ) : (
                        <div className={styles.rescisionResumen}>
                            <span>El contrato llega a término: no corresponde penalidad.</span>
                            <strong className={styles.sinPenalidad}>Sin penalidad</strong>
                        </div>
                    )}

                    {/*
                      El alquiler del mes de salida todavía no está cargado, así que este
                      número sale del último conocido. Por eso la penalidad no se guarda
                      ahora: se calcula en firme al entregar las llaves.
                    */}
                    {calculo.anticipada && calculo.importe_estimado ? (
                        <p className={styles.rescisionAviso}>
                            El alquiler de ese mes todavía no está cargado —se usó el vigente
                            desde {formatDate(calculo.importe_vigente_desde)}—, así que la
                            penalidad es una estimación. La definitiva se calcula al registrar
                            la entrega de llaves.
                        </p>
                    ) : null}
                </>
            ) : null}
        </form>
    )
}
