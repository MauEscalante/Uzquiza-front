import Input from "./Input"
import Select from "./Select"
import Button from "./Button"
import styles from "../pages/Contratos.module.css"
import GarantesForm from "./GarantesForm"
import InquilinoForm from "./InquilinoForm"
import { emptyInquilino, type InquilinoFormValue } from "../types/contrato"

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

    // Al elegir Seguro de caución, la compañía es siempre GPremier por defecto
    const handleGarantiaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        setForm((current) => ({
            ...current,
            garantia: value,
            ...(value === 'GPremier' ? { aseguradora: 'GPremier' } : {}),
        }))
    }

    // Manejo de la lista dinámica de inquilinos (co-inquilinos)
    const handleInquilinoChange = (index: number, field: keyof InquilinoFormValue) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((current) => {
            const inquilinos = [...current.inquilinos]
            inquilinos[index] = { ...inquilinos[index], [field]: event.target.value }
            return { ...current, inquilinos }
        })
    }

    const addInquilino = () => {
        setForm((current) => ({
            ...current,
            inquilinos: [...current.inquilinos, emptyInquilino],
        }))
    }

    const removeInquilino = (index: number) => {
        setForm((current) => ({
            ...current,
            inquilinos: current.inquilinos.filter((_: InquilinoFormValue, i: number) => i !== index),
        }))
    }
    return (
        <form id="contrato-form" className={styles.form} onSubmit={onSubmit}>
            <Input
                label="Propiedad"
                value={form.propiedad}
                onChange={handleFieldChange('propiedad')}
            />
            <div className={styles.sectionDivider} />
            {form.inquilinos.map((inquilino: InquilinoFormValue, index: number) => (
                <InquilinoForm
                    key={index}
                    index={index}
                    inquilino={inquilino}
                    onChange={(field) => handleInquilinoChange(index, field)}
                    onRemove={() => removeInquilino(index)}
                    canRemove={form.inquilinos.length > 1}
                />
            ))}
            <div className={styles.addButtonRow}>
                <Button type="button" variant="secondary" onClick={addInquilino}>
                    + Agregar otro inquilino
                </Button>
            </div>
            <div className={styles.sectionDivider} />

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
                onChange={handleGarantiaChange}
            />
            {/* OPCIONES SEGÚN GARANTÍA */}
            {form.garantia === "Garantia Propietaria" && (
                <>
                    <div className={styles.sectionDivider} />
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
                    <Input
                        label="Dirección de la propiedad en garantía"
                        placeholder="Ej: Av. Siempre Viva 742"
                        value={form.direccionGarantia}
                        onChange={handleFieldChange('direccionGarantia')}
                    />
                </>
            )}

            {form.garantia === "GPremier" && (
                <>
                    <div className={styles.sectionDivider} />
                    <Input
                        label="Compañía aseguradora"
                        value="GPremier"
                        disabled
                        readOnly
                    />
                   
                </>
            )}

            {form.garantia === "Garantes" && (
                <>
                    <div className={styles.sectionDivider} />
                    <GarantesForm index={1} form={form} handleFieldChange={handleFieldChange} />
                    <GarantesForm index={2} form={form} handleFieldChange={handleFieldChange} />
                    <GarantesForm index={3} form={form} handleFieldChange={handleFieldChange} />
                </>
            )}
            {formError ? (
                <div className={styles.error}>{formError}</div>
            ) : null}
        </form>
    )
}