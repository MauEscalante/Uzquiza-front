import React from 'react';
import Input from './Input';
import Button from './Button';
import styles from '../pages/Contratos.module.css';
import type { InquilinoFormValue } from '../types/contrato';

interface InquilinoFormProps {
    index: number;
    inquilino: InquilinoFormValue;
    onChange: (field: keyof InquilinoFormValue) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export default function InquilinoForm({ index, inquilino, onChange, onRemove, canRemove }: InquilinoFormProps) {
    return (
        <>
            {index > 0 ? <div className={styles.sectionDivider} /> : null}
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Inquilino {index + 1}</h4>
                {canRemove ? (
                    <Button type="button" variant="danger" onClick={onRemove}>
                        Quitar
                    </Button>
                ) : null}
            </div>
            <Input
                label="Nombre completo"
                placeholder="Ej: Juan García López"
                value={inquilino.nombreCompleto}
                onChange={onChange('nombreCompleto')}
            />
            <Input
                label="Nacionalidad"
                placeholder="Ej: Argentina"
                value={inquilino.nacionalidad}
                onChange={onChange('nacionalidad')}
            />
            <Input
                label="DNI"
                placeholder="Ej: 30123456"
                value={inquilino.dni}
                onChange={onChange('dni')}
            />
            <Input
                label="CUIL"
                placeholder="Ej: 20-30123456-9"
                value={inquilino.cuil}
                onChange={onChange('cuil')}
            />
            <Input
                label="Domicilio legal"
                placeholder="Ej: Av. Siempre Viva 742"
                value={inquilino.domicilioLegal}
                onChange={onChange('domicilioLegal')}
            />
            <Input
                label="Domicilio electrónico"
                type="email"
                placeholder="Ej: juan.garcia@email.com"
                value={inquilino.domicilioElectronico}
                onChange={onChange('domicilioElectronico')}
            />
        </>
    )
}
