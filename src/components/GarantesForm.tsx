import React from 'react';
import Input from './Input';
import styles from '../pages/Contratos.module.css';

interface GarantesFormProps {
    index: number;
    form: any;
    handleFieldChange: (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
}

export default function GarantesForm({ index, form, handleFieldChange }: GarantesFormProps) {
    return (
        <>
            {index > 1 ? <div className={styles.sectionDivider} /> : null}
            <h4 className={styles.sectionTitle}>Garante {index}</h4>
            <Input
                label="Nombre"
                placeholder="Ej: Juan García López"
                value={form[`nombreGarante${index}`] ?? ''}
                onChange={handleFieldChange(`nombreGarante${index}`)}
            />
            <Input
                label="Sueldo"
                type="number"
                placeholder="Ej: 2000"
                value={form[`sueldoGarante${index}`] ?? ''}
                onChange={handleFieldChange(`sueldoGarante${index}`)}
            />
            <Input
                label="Teléfono"
                placeholder="Ej: +34 612 345 678"
                value={form[`telefonoGarante${index}`] ?? ''}
                onChange={handleFieldChange(`telefonoGarante${index}`)}
            />
        </>
    )
}
