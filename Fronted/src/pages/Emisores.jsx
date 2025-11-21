"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { Plus, Search, Building2, X, Mail } from "lucide-react"
import "./Emisores.css"

const Emisores = () => {
  const [emisores, setEmisores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nitEmisor: "",
    nombreComercial: "",
    correoEmisor: "",
    firmaElectronica: "",
  })

  useEffect(() => {
    loadEmisores()
  }, [])

  const loadEmisores = async () => {
    try {
      const response = await api.get("/emisores")
      setEmisores(response.data)
    } catch (error) {
      console.error("Error cargando emisores:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/emisores", formData)
      setShowModal(false)
      setFormData({
        nitEmisor: "",
        nombreComercial: "",
        correoEmisor: "",
        firmaElectronica: "",
      })
      loadEmisores()
    } catch (error) {
      console.error("Error creando emisor:", error)
      alert("Error al crear el emisor")
    }
  }

  const toggleEstado = async (nit, activo) => {
    try {
      await api.patch(`/emisores/${nit}/activo?activo=${!activo}`)
      loadEmisores()
    } catch (error) {
      console.error("Error cambiando estado:", error)
    }
  }

  const filteredEmisores = emisores.filter(
    (e) =>
      e.nitEmisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="emisores-page">
      <div className="page-header">
        <div>
          <h1>Emisores</h1>
          <p>Gestión de emisores certificados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nuevo Emisor
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por NIT o nombre comercial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Cargando emisores...</div>
      ) : (
        <div className="emisores-grid">
          {filteredEmisores.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} style={{ opacity: 0.3 }} />
              <p>No se encontraron emisores</p>
            </div>
          ) : (
            filteredEmisores.map((emisor) => (
              <div key={emisor.id} className="emisor-card">
                <div className="emisor-header">
                  <div className="emisor-icon">
                    <Building2 size={24} />
                  </div>
                  <div className={`status-indicator ${emisor.activo ? "active" : "inactive"}`}>
                    {emisor.activo ? "Activo" : "Inactivo"}
                  </div>
                </div>

                <div className="emisor-body">
                  <h3>{emisor.nombreComercial}</h3>
                  <div className="emisor-info">
                    <p>
                      <strong>NIT:</strong> {emisor.nitEmisor}
                    </p>
                    <p className="email-info">
                      <Mail size={14} />
                      {emisor.correoEmisor}
                    </p>
                  </div>
                </div>

                <div className="emisor-actions">
                  <button
                    className={`toggle-btn ${emisor.activo ? "deactivate" : "activate"}`}
                    onClick={() => toggleEstado(emisor.nitEmisor, emisor.activo)}
                  >
                    {emisor.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Emisor</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>NIT del Emisor</label>
                <input
                  type="text"
                  value={formData.nitEmisor}
                  onChange={(e) => setFormData({ ...formData, nitEmisor: e.target.value })}
                  placeholder="12345678-9"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre Comercial</label>
                <input
                  type="text"
                  value={formData.nombreComercial}
                  onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                  placeholder="Empresa S.A."
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.correoEmisor}
                  onChange={(e) => setFormData({ ...formData, correoEmisor: e.target.value })}
                  placeholder="contacto@empresa.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Firma Electrónica (Base64 o PEM)</label>
                <textarea
                  value={formData.firmaElectronica}
                  onChange={(e) => setFormData({ ...formData, firmaElectronica: e.target.value })}
                  placeholder="Pegue aquí la firma electrónica en formato Base64 o PEM"
                  rows={6}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Emisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Emisores
