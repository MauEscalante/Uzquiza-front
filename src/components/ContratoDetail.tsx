import styles from "../pages/Contratos.module.css"
import { formatCurrency } from "../services/api"
import type { ContratoDetalle } from "../types/contrato"

interface ContratoDetailProps {
    contrato: ContratoDetalle | null
    loading?: boolean
    error?: string
}

function nombreCompleto(persona: { nombre: string; apellido: string }) {
    return `${persona.nombre} ${persona.apellido}`
}

export default function ContratoDetail({ contrato, loading, error }: ContratoDetailProps) {
    if (loading) {
        return <div className={styles.emptyState}>Cargando detalle...</div>
    }

    if (error) {
        return <div className={styles.error}>{error}</div>
    }

    if (!contrato) {
        return null
    }

    const propietarios = contrato.propietarios.length
        ? contrato.propietarios.map(nombreCompleto).join(', ')
        : 'Sin propietario registrado'

    const inquilinos = contrato.inquilinos.length
        ? contrato.inquilinos.map(nombreCompleto).join(', ')
        : 'Sin inquilinos registrados'

    return (
        <div className={styles.detailGrid}>
            <div><span>Propiedad</span><strong>{contrato.propiedad.direccion}</strong></div>
            <div><span>Propietario</span><strong>{propietarios}</strong></div>
            <div className={styles.sectionDivider} />
            <div><span>Inquilinos</span><strong>{inquilinos}</strong></div>
            <div className={styles.sectionDivider} />
            <div><span>Fecha de inicio</span><strong>{contrato.fecha_inicio}</strong></div>
            <div><span>Fecha de fin</span><strong>{contrato.fecha_fin}</strong></div>
            <div><span>Tipo de ajuste</span><strong>{contrato.tipo_ajuste}</strong></div>
            <div><span>Periodicidad</span><strong>{contrato.periodicidad}</strong></div>
            <div><span>Importe inicial</span><strong>{formatCurrency(contrato.importe_inicial)}</strong></div>
            <div><span>Depósito</span><strong>{contrato.deposito != null ? formatCurrency(contrato.deposito) : 'Sin depósito'}</strong></div>
            <div className={styles.sectionDivider} />
            {contrato.garantia === 'GPremier' ? (
                <div><span>Garantía</span><strong>Seguro de caución (GPremier)</strong></div>
            ) : (
                <>
                    <div><span>Garantía</span><strong>{contrato.garantia}</strong></div>
                    {contrato.direccion_garantia ? (
                        <div><span>Propiedad en garantía</span><strong>{contrato.direccion_garantia}</strong></div>
                    ) : null}
                    <div><span>Garantes</span><strong>{contrato.garantes.map(nombreCompleto).join(', ')}</strong></div>
                </>
            )}
        </div>
    )
}
