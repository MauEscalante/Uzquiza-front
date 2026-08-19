import { useRef } from "react"
import Input from "./Input"
import Select from "./Select"
import Button from "./Button"
import styles from "../pages/Contratos.module.css"
import GarantesForm from "./GarantesForm"
import InquilinoForm from "./InquilinoForm"
import GarantePropietarioForm from "./GarantePropietarioForm"
import { emptyGarantePropietario, emptyInquilino, type GarantePropietarioFormValue, type InquilinoFormValue } from "../types/contrato"
import type { PropiedadResumen } from "../services/contratosService"

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
    propiedades: PropiedadResumen[]
}

export default function ContratoForm({ form, setForm, formError, onSubmit, propiedades }: ContratoFormProps) {
    // Función helper para manejar cambios de input
    const handleFieldChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value
        }))
    }

    // El depósito arranca igual al importe inicial y se mantiene sincronizado
    // hasta que el usuario lo edite a mano.
    const depositoTouched = useRef(false)

    const handleImporteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setForm((current) => ({
            ...current,
            importeActual: value,
            deposito: depositoTouched.current ? current.deposito : value,
        }))
    }

    const handleDepositoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        depositoTouched.current = true
        handleFieldChange('deposito')(event)
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

    // Manejo de la lista dinámica de garantes propietarios
    const handleGarantePropietarioChange = (index: number, field: keyof GarantePropietarioFormValue) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((current) => {
            const garantesPropietarios = [...current.garantesPropietarios]
            garantesPropietarios[index] = { ...garantesPropietarios[index], [field]: event.target.value }
            return { ...current, garantesPropietarios }
        })
    }

    const addGarantePropietario = () => {
        setForm((current) => ({
            ...current,
            garantesPropietarios: [...current.garantesPropietarios, emptyGarantePropietario],
        }))
    }

    const removeGarantePropietario = (index: number) => {
        setForm((current) => ({
            ...current,
            garantesPropietarios: current.garantesPropietarios.filter((_: GarantePropietarioFormValue, i: number) => i !== index),
        }))
    }

    const propiedadOptions = [
        { label: 'Seleccioná una propiedad', value: '' },
        ...propiedades.map((propiedad) => ({
            label: propiedad.direccion,
            value: String(propiedad.propiedad_id),
        })),
    ]

    return (
        <form id="contrato-form" className={styles.form} onSubmit={onSubmit}>
            <Select
                label="Propiedad"
                options={propiedadOptions}
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
                onChange={handleImporteChange}
            />
            <Input
                label="Depósito"
                type="number"
                value={form.deposito}
                onChange={handleDepositoChange}
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
                <>
                    <div className={styles.sectionDivider} />
                    <Input
                        label="Dirección de la propiedad en garantía"
                        placeholder="Ej: Av. Siempre Viva 742"
                        value={form.direccionGarantia}
                        onChange={handleFieldChange('direccionGarantia')}
                    />
                    <div className={styles.sectionDivider} />
                    {form.garantesPropietarios.map((garante: GarantePropietarioFormValue, index: number) => (
                        <GarantePropietarioForm
                            key={index}
                            index={index}
                            garante={garante}
                            onChange={(field) => handleGarantePropietarioChange(index, field)}
                            onRemove={() => removeGarantePropietario(index)}
                            canRemove={form.garantesPropietarios.length > 1}
                        />
                    ))}
                    <div className={styles.addButtonRow}>
                        <Button type="button" variant="secondary" onClick={addGarantePropietario}>
                            + Agregar otro garante
                        </Button>
                    </div>
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