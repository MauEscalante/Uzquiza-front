import { useEffect, useMemo, useState } from 'react'
import { mensajeDe, normalizarTexto } from '../services/api'
import { getClienteHistorial, listClientes, updateCliente } from '../services/clientesService'
import type { Cliente, ClienteUpdateValues, ClienteValorHistorico } from '../types/cliente'

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
      } catch (e) {
        if (mounted) {
          setError(mensajeDe(e, 'No se pudieron cargar los clientes.'))
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
    const normalizedSearch = normalizarTexto(search)

    if (!normalizedSearch) {
      return clientes
    }

    return clientes.filter((cliente) => [
      cliente.nombre,
      cliente.apellido,
      // El nombre completo en los dos órdenes: la tabla muestra Nombre y Apellido en
      // columnas contiguas, así que se busca "Diego Palmer" tal como se lee.
      `${cliente.nombre} ${cliente.apellido}`,
      `${cliente.apellido} ${cliente.nombre}`,
      cliente.dni,
      cliente.telefono,
      cliente.email,
      cliente.direccion,
      // Los propietarios no tienen domicilio personal cargado: a ellos se los busca
      // por la dirección de la propiedad que poseen.
      cliente.direccion_propiedades,
      cliente.cuil,
      cliente.nacionalidad,
      cliente.tipo,
      // normalizarTexto absorbe los null de los campos opcionales.
    ].some((value) => normalizarTexto(value).includes(normalizedSearch)))
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

    if (!editingCliente) {
      return
    }

    if (!form.nombre || !form.apellido || !form.dni || !form.telefono || !form.email?.trim()) {
      setFormError('Nombre, apellido, DNI, teléfono y email son obligatorios.')
      return
    }

    try {
      const saved = await updateCliente(editingCliente.cliente_num, form)
      setClientes((current) => current.map((cliente) => (
        cliente.cliente_num === editingCliente.cliente_num ? saved : cliente
      )))
      setFeedback('Cliente actualizado correctamente.')
    } catch (e) {
      setFormError(mensajeDe(e, 'No se pudo actualizar el cliente.'))
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
    historial,
    historialLoading,
    historialError,
    filteredClientes,
    openEditModal,
    openDetailModal,
    handleSubmit,
  }
}
