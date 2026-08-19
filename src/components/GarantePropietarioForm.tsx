import React from 'react';
import Input from './Input';
import Button from './Button';
import styles from '../pages/Contratos.module.css';
import type { GarantePropietarioFormValue } from '../types/contrato';

interface GarantePropietarioFormProps {
    index: number;
    garante: GarantePropietarioFormValue;
    onChange: (field: keyof GarantePropietarioFormValue) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export default function GarantePropietarioForm({ index, garante, onChange, onRemove, canRemove }: GarantePropietarioFormProps) {
    return (
        <>
            {index > 0 ? <div className={styles.sectionDivider} /> : null}
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Garante {index + 1}</h4>
                {canRemove ? (
                    <Button type="button" variant="danger" onClick={onRemove}>
                        Quitar
                    </Button>
                ) : null}
            </div>
            <Input
                label="Nombre"
                placeholder="Ej: Juan"
                value={garante.nombre}
                onChange={onChange('nombre')}
            />
            <Input
                label="Apellido"
                placeholder="Ej: García López"
                value={garante.apellido}
                onChange={onChange('apellido')}
            />
            <Input
                label="DNI"
                placeholder="Ej: 30123456"
                value={garante.dni}
                onChange={onChange('dni')}
            />
            <Input
                label="Teléfono"
                placeholder="Ej: 1155253547"
                value={garante.telefono}
                onChange={onChange('telefono')}
            />
        </>
    )
}
