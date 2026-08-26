import { useEffect, useMemo, useState } from 'react'
import { createCliente, getClienteHistorial, listClientes, updateCliente } from '../services/clientesService'
import type { Cliente, ClienteFormValues, ClienteValorHistorico } from '../types/cliente'

const emptyForm: ClienteFormValues = {
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
  const [form, setForm] = useState<ClienteFormValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [historial, setHistorial] = useState<ClienteValorHistorico[]>([])
  const [historialLoading, setHistorialLoading] = useState(false)
  const [historialError, setHistorialError] = useState('')

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

    // Los campos opcionales del cliente (email, CUIL, dirección…) llegan como null
    // desde la base, así que el filtro descarta lo que no sea texto antes de bajar.
    return clientes.filter((cliente) => [cliente.nombre, cliente.apellido, cliente.dni, cliente.telefono, cliente.email, cliente.direccion, cliente.cuil, cliente.nacionalidad, cliente.tipo]
      .some((value) => typeof value === 'string' && value.toLowerCase().includes(normalizedSearch)))
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
      direccion: cliente.direccion,
      cuil: cliente.cuil,
      nacionalidad: cliente.nacionalidad,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function openDetailModal(cliente: Cliente) {
    // La ficha ya la tenemos de la fila; lo único que falta buscar es el historial.
    setSelectedCliente(cliente)
    setHistorial([])
    setHistorialError('')
    setDetailOpen(true)
    setHistorialLoading(true)

    try {
      setHistorial(await getClienteHistorial(cliente.cliente_num))
    } catch {
      setHistorialError('No se pudo cargar el historial de importes.')
    } finally {
      setHistorialLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombre || !form.apellido || !form.dni || !form.telefono || !form.email || !form.direccion || !form.cuil || !form.nacionalidad) {
      setFormError('Completá todos los campos del cliente.')
      return
    }

    const action = editingCliente ? updateCliente(editingCliente.cliente_num, form) : createCliente(form)
    const saved = await action

    if (editingCliente) {
      setClientes((current) => current.map((cliente) => (cliente.cliente_num === editingCliente.cliente_num ? saved : cliente)))
      setFeedback('Cliente actualizado correctamente.')
    } else {
      setClientes((current) => [saved, ...current])
      setFeedback('Cliente creado correctamente.')
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
    editingCliente,
    selectedCliente,
    form,
    setForm,
    formError,
    feedback,
    historial,
    historialLoading,
    historialError,
    filteredClientes,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleSubmit,
  }
}