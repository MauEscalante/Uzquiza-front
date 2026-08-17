import React from 'react';
import Input from './Input';
import styles from "../pages/Contratos.module.css"

interface GarantesFormProps {
    form: any;
    handleFieldChange: (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
}




export default function GarantesForm({ form, handleFieldChange }: GarantesFormProps) {
    return (
        <div className={styles.page}>
            <h4 >Garante 1</h4>
            <form className={styles.form}>
                <Input
                    label="Nombre"
                    placeholder="Ej: Juan García López"
                    value={form.nombreGarante}
                    onChange={handleFieldChange('nombreGarante')}
                />
                <Input
                    label="Sueldo"
                    type="number"
                    placeholder="Ej: 2000"
                    value={form.sueldo}
                    onChange={handleFieldChange('sueldo')}
                />
                <Input
                    label="Teléfono"
                    placeholder="Ej: +34 612 345 678"
                    value={form.telefono}
                    onChange={handleFieldChange('telefono')}
                />
            </form >
        </div>
    )
}