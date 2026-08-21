import { useEffect, useMemo, useState } from 'react'
import { listClientes, updateCliente } from '../services/clientesService'
import type { Cliente, ClienteUpdateValues } from '../types/cliente'

const emptyForm: ClienteUpdateValues = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  direccion: '',
  cuil: '',
  nacionalidad: '',
}

export function useClientesController() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [form, setForm] = useState<ClienteUpdateValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadClientes() {
      try {
        const data = await listClientes()
        if (mounted) {
          setClientes(data)
        }
      } catch {
        if (mounted) {
          setError('No se pudieron cargar los clientes.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadClientes()

    return () => {
      mounted = false
    }
  }, [])

  const filteredClientes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return clientes
    }

    // Varios campos son opcionales y llegan en null, por eso el String(value ?? '').
    return clientes.filter((cliente) => [cliente.nombre, cliente.apellido, cliente.dni, cliente.telefono, cliente.email, cliente.direccion, cliente.cuil, cliente.nacionalidad, cliente.tipo]
      .some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch)))
  }, [clientes, search])

  function openEditModal(cliente: Cliente) {
    setEditingCliente(cliente)
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      telefono: cliente.telefono,
      email: cliente.email ?? '',
      direccion: cliente.direccion ?? '',
      cuil: cliente.cuil ?? '',
      nacionalidad: cliente.nacionalidad ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  function openDetailModal(cliente: Cliente) {
    setSelectedCliente(cliente)
    setDetailOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingCliente) {
      return
    }

    if (!form.nombre || !form.apellido || !form.dni || !form.telefono) {
      setFormError('Nombre, apellido, DNI y teléfono son obligatorios.')
      return
    }

    try {
      const saved = await updateCliente(editingCliente.cliente_num, form)
      setClientes((current) => current.map((cliente) => (
        cliente.cliente_num === editingCliente.cliente_num ? saved : cliente
      )))
      setFeedback('Cliente actualizado correctamente.')
    } catch {
      setFormError('No se pudo actualizar el cliente.')
      return
    }

    setModalOpen(false)
    setEditingCliente(null)
    setForm(emptyForm)
  }

  return {
    loading,
    error,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    detailOpen,
    setDetailOpen,
    selectedCliente,
    form,
    setForm,
    formError,
    feedback,
    filteredClientes,
    openEditModal,
    openDetailModal,
    handleSubmit,
  }
}
