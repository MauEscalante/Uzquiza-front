import React from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import styles from '../pages/Propiedades.module.css';
import type { PropietarioFormValue, PropietarioResumen } from '../types/propiedad';

interface PropietarioFormProps {
    index: number;
    propietario: PropietarioFormValue;
    disponibles: PropietarioResumen[];
    /** El porcentaje solo se pide cuando la propiedad tiene más de un propietario. */
    mostrarPorcentaje: boolean;
    onChange: (field: keyof PropietarioFormValue) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export default function PropietarioForm({ index, propietario, disponibles, mostrarPorcentaje, onChange, onRemove, canRemove }: PropietarioFormProps) {
    const esNuevo = propietario.clienteNum === ''

    const opciones = [
        { label: '+ Cargar propietario nuevo', value: '' },
        ...disponibles.map((disponible) => ({
            label: `${disponible.apellido}, ${disponible.nombre} — ${disponible.dni}`,
            value: String(disponible.cliente_num),
        })),
    ]

    return (
        <>
            {index > 0 ? <div className={styles.sectionDivider} /> : null}
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Propietario {index + 1}</h4>
                {canRemove ? (
                    <Button type="button" variant="danger" onClick={onRemove}>
                        Quitar
                    </Button>
                ) : null}
            </div>
            <Select
                label="Propietario"
                options={opciones}
                value={propietario.clienteNum}
                onChange={onChange('clienteNum')}
            />
            {mostrarPorcentaje ? (
                <Input
                    label="Porcentaje de la comisión (%)"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Ej: 60"
                    value={propietario.porcentaje}
                    onChange={onChange('porcentaje')}
                />
            ) : null}
            {esNuevo ? (
                <>
                    <Input
                        label="Nombre"
                        placeholder="Ej: Juan"
                        value={propietario.nombre}
                        onChange={onChange('nombre')}
                    />
                    <Input
                        label="Apellido"
                        placeholder="Ej: García López"
                        value={propietario.apellido}
                        onChange={onChange('apellido')}
                    />
                    <Input
                        label="Teléfono"
                        placeholder="Ej: 1155253547"
                        value={propietario.telefono}
                        onChange={onChange('telefono')}
                    />
                    <Input
                        label="Nacionalidad"
                        placeholder="Ej: Argentina"
                        value={propietario.nacionalidad}
                        onChange={onChange('nacionalidad')}
                    />
                    <Input
                        label="DNI"
                        placeholder="Ej: 30123456"
                        value={propietario.dni}
                        onChange={onChange('dni')}
                    />
                    <Input
                        label="CUIL"
                        placeholder="Ej: 20-30123456-9"
                        value={propietario.cuil}
                        onChange={onChange('cuil')}
                    />
                    <Input
                        label="Domicilio legal"
                        placeholder="Ej: Av. Siempre Viva 742"
                        value={propietario.domicilioLegal}
                        onChange={onChange('domicilioLegal')}
                    />
                    <Input
                        label="Domicilio electrónico"
                        type="email"
                        placeholder="Ej: juan.garcia@email.com"
                        value={propietario.domicilioElectronico}
                        onChange={onChange('domicilioElectronico')}
                    />
                </>
            ) : null}
        </>
    )
}
