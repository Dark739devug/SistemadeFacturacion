"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { Search, Users, UserCheck, UserX, Pencil, Trash2, X, UserPlus } from "lucide-react"
import "./Usuarios.css"

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombreCompleto: "",
    email: "",
    idRol: 2,
  })

  useEffect(() => {
    loadUsuarios()
    loadRoles()
  }, [])

  const loadUsuarios = async () => {
    try {
      const response = await api.get("/usuarios")
      setUsuarios(response.data)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await api.get("/roles")
      setRoles(response.data)
    } catch (error) {
      console.error("Error cargando roles:", error)

      // fallback
      setRoles([
        { id: 1, nombre: "ADMIN" },
        { id: 2, nombre: "USER" },
      ])
    }
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (usuario) => {
    setFormData({
      username: usuario.username,
      password: "",
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      idRol: usuario.rol?.id || usuario.rol?.idRol || 2,
    })

    setEditingId(usuario.idUsuario)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        const dataToSend = {
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          idRol: formData.idRol,
        }

        await api.put(`/usuarios/${editingId}`, dataToSend)
      } else {
        const dataToSend = {
          username: formData.username,
          password: formData.password,
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          idRol: formData.idRol,
        }

        await api.post("/auth/register", dataToSend)
      }

      setShowModal(false)
      resetForm()
      loadUsuarios()
    } catch (error) {
      console.error("Error guardando usuario:", error)
      alert(error.response?.data?.message || "Error al guardar el usuario")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return

    try {
      await api.delete(`/usuarios/${id}`)
      loadUsuarios()
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      alert(error.response?.data?.mensaje || "Error al eliminar el usuario")
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      nombreCompleto: "",
      email: "",
      idRol: 2,
    })
    setEditingId(null)
  }

  const toggleEstado = async (id, activo) => {
    try {
      const endpoint = activo ? `/usuarios/${id}/desactivar` : `/usuarios/${id}/activar`
      await api.put(endpoint)
      loadUsuarios()
    } catch (error) {
      console.error("Error cambiando estado:", error)
    }
  }

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestión de usuarios del sistema</p>
        </div>

        <button className="btn-primary" onClick={handleCreate}>
          <UserPlus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : (
        <div className="usuarios-grid">
          {filteredUsuarios.length === 0 ? (
            <div className="empty-state">
              <Users size={48} style={{ opacity: 0.3 }} />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            filteredUsuarios.map((usuario) => (
              <div key={usuario.idUsuario} className="usuario-card">
                <div className="usuario-header">
                  <div className="usuario-avatar">
                    {usuario.nombreCompleto?.charAt(0) || "U"}
                  </div>

                  <div className={`status-indicator ${usuario.activo ? "active" : "inactive"}`}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </div>
                </div>

                <div className="usuario-body">
                  <h3>{usuario.nombreCompleto}</h3>
                  <p className="username">@{usuario.username}</p>
                  <p className="email">{usuario.email}</p>
                  <div className="role-badge">{usuario.rol?.nombre || "USER"}</div>
                </div>

                <div className="usuario-actions">
                  <button className="btn-icon-edit" onClick={() => handleEdit(usuario)} title="Editar">
                    <Pencil size={16} />
                  </button>

                  <button
                    className={`toggle-btn ${usuario.activo ? "deactivate" : "activate"}`}
                    onClick={() => toggleEstado(usuario.idUsuario, usuario.activo)}
                  >
                    {usuario.activo ? (
                      <>
                        <UserX size={16} />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Activar
                      </>
                    )}
                  </button>

                  <button
                    className="btn-icon-delete"
                    onClick={() => handleDelete(usuario.idUsuario)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false)
            resetForm()
          }}
        >
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>

              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingId && (
                <div className="form-group">
                  <label>Usuario *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ej: jperez"
                    required
                    minLength={3}
                  />
                  <small>Mínimo 3 caracteres, sin espacios</small>
                </div>
              )}

              {!editingId && (
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formData.idRol}
                  onChange={(e) => setFormData({ ...formData, idRol: Number.parseInt(e.target.value) })}
                  required
                >
                  {roles.map((rol) => (
                    <option key={rol.id || rol.idRol} value={rol.id || rol.idRol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
                  {editingId ? "Actualizar Usuario" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
