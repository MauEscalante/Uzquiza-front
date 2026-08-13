import { useEffect, useMemo, useState } from 'react'
import { createCliente, deleteCliente, listClientes, updateCliente } from '../services/clientesService'
import type { Cliente, ClienteFormValues } from '../types/cliente'

const emptyForm: ClienteFormValues = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
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
  const [form, setForm] = useState<ClienteFormValues>(emptyForm)
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

    return clientes.filter((cliente) => [cliente.numeroCliente, cliente.nombre, cliente.apellido, cliente.dni, cliente.telefono, cliente.email]
      .some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [clientes, search])

  function openCreateModal() {
    setEditingCliente(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(cliente: Cliente) {
    setEditingCliente(cliente)
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      telefono: cliente.telefono,
      email: cliente.email,
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

    if (!form.nombre || !form.apellido || !form.dni || !form.telefono || !form.email) {
      setFormError('Completá todos los campos del cliente.')
      return
    }

    const action = editingCliente ? updateCliente(editingCliente.id, form) : createCliente(form)
    const saved = await action

    if (editingCliente) {
      setClientes((current) => current.map((cliente) => (cliente.id === editingCliente.id ? saved : cliente)))
      setFeedback('Cliente actualizado correctamente.')
    } else {
      setClientes((current) => [saved, ...current])
      setFeedback('Cliente creado correctamente.')
    }

    setModalOpen(false)
    setEditingCliente(null)
    setForm(emptyForm)
  }

  async function handleDelete(cliente: Cliente) {
    const shouldDelete = window.confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`)
    if (!shouldDelete) {
      return
    }

    await deleteCliente(cliente.id)
    setClientes((current) => current.filter((entry) => entry.id !== cliente.id))
    setFeedback('Cliente eliminado.')
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
    editingCliente,
    selectedCliente,
    form,
    setForm,
    formError,
    feedback,
    filteredClientes,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleSubmit,
    handleDelete,
  }
}