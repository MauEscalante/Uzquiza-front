import Input from "./Input"
import Select from "./Select"
import styles from "../pages/Contratos.module.css"
import GarantesForm from "./GarantesForm"

export const tipoAjusteOptions = [
    { label: 'IPC', value: 'IPC' },
    { label: 'ICL', value: 'ICL' },
    { label: 'Fijo', value: 'Fijo' },
]

export const periodicidadOptions = [
    { label: 'Trimestral', value: 'Trimestral' },
    { label: 'Cuatrimestral', value: 'Cuatrimestral' },
    { label: 'Semestral', value: 'Semestral' },
]

export const tipoGarantias = [
    { label: 'Seguro de caucion', value: 'GPremier' },
    { label: 'Garantia Propietaria', value: 'Garantia Propietaria' },
    { label: 'Garantes', value: 'Garantes' },
]

interface ContratoFormProps {
    form: any
    setForm: (updater: (current: any) => any) => void
    formError?: string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ContratoForm({ form, setForm, formError, onSubmit }: ContratoFormProps) {
    // Función helper para manejar cambios de input
    const handleFieldChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value
        }))
    }
    return (
        <form id="contrato-form" className={styles.form} onSubmit={onSubmit}>
            <Input 
                label="Propiedad" 
                value={form.propiedad} 
                onChange={handleFieldChange('propiedad')} 
            />
            <Input 
                label="Inquilino" 
                value={form.inquilino} 
                onChange={handleFieldChange('inquilino')} 
            />
            <Input 
                label="Fecha de inicio" 
                type="date" 
                value={form.fechaInicio} 
                onChange={handleFieldChange('fechaInicio')} 
            />
            <Input 
                label="Fecha de finalización" 
                type="date" 
                value={form.fechaFin} 
                onChange={handleFieldChange('fechaFin')} 
            />
            <Input 
                label="Importe inicial" 
                type="number" 
                value={form.importeActual} 
                onChange={handleFieldChange('importeActual')} 
            />
            <Select 
                label="Tipo de ajuste" 
                options={tipoAjusteOptions} 
                value={form.tipoAjuste} 
                onChange={handleFieldChange('tipoAjuste')} 
            />
            <Select 
                label="Periodicidad" 
                options={periodicidadOptions} 
                value={form.periodicidad} 
                onChange={handleFieldChange('periodicidad')} 
            />
            <Select 
                label="Garantia" 
                options={tipoGarantias} 
                value={form.garantia} 
                onChange={handleFieldChange('garantia')} 
            />
            {/* OPCIONES SEGÚN GARANTÍA */}
            {form.garantia === "Garantia Propietaria" && (
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem', marginTop: '1rem' }}>
                    <Input
                        label="Propietario garante"
                        placeholder="Ej: Juan García López"
                        value={form.garante}
                        onChange={handleFieldChange('garante')}
                    />
                    <Input
                        label="DNI del garante"
                        placeholder="Ej: 12345678A"
                        value={form.dniGarante}
                        onChange={handleFieldChange('dniGarante')}
                    />
                </div>
            )}

            {form.garantia === "Seguro de Caucción" && (
                <div >
                    <Input
                        label="Compañía aseguradora"
                        placeholder="Ej: AXA, Zurich, MAPFRE"
                        value={form.aseguradora}
                        onChange={handleFieldChange('aseguradora')}
                    />
                    <Input
                        label="Número de póliza"
                        placeholder="Ej: POL-2024-001234"
                        value={form.numeroPoliza}
                        onChange={handleFieldChange('numeroPoliza')}
                    />
                </div>
            )}

            {form.garantia === "Garantes" && (
                <GarantesForm form={form} handleFieldChange={handleFieldChange}/>
            )}
            {formError ? (
                <div className={styles.error}>{formError}</div>
            ) : null}
        </form>
    )
}