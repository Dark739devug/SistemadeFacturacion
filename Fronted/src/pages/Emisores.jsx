"use client"

import { useState, useEffect, useRef } from "react"
import api from "../services/api"
import { 
  Plus, Search, Building2, X, Mail, 
  Key, Trash2, RefreshCw, CheckCircle, AlertCircle, Upload, Filter 
} from "lucide-react"
import "./Emisores.css"

const Emisores = () => {
  const [emisores, setEmisores] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false) 
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // "all", "active", "inactive"
  
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = useRef(null)
  
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
    setLoading(true)
    try {
      const response = await api.get("/emisores")
      setEmisores(response.data)
    } catch (error) {
      console.error("Error cargando emisores:", error)
      alert("No se pudo conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.post("/emisores/registrar", formData)
      
      setShowModal(false)
      setFormData({
        nitEmisor: "",
        nombreComercial: "",
        correoEmisor: "",
        firmaElectronica: "",
      })
      loadEmisores() 
      alert("Emisor registrado exitosamente")
    } catch (error) {
      console.error("Error creando emisor:", error)
      const msg = error.response?.data || "Error al crear el emisor."
      alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleEstado = async (nit, estadoActual) => {
    const nuevoEstado = !estadoActual
    const confirmMsg = nuevoEstado 
      ? "¿Desea activar este emisor?" 
      : "¿Desea desactivar este emisor?"
    
    if (!window.confirm(confirmMsg)) return

    try {
      await api.patch(`/emisores/${nit}/activo`, null, {
        params: { activo: nuevoEstado }
      })

      setEmisores(prev => prev.map(e => 
        e.nitEmisor === nit ? { ...e, activo: nuevoEstado } : e
      ))

    } catch (error) {
      console.error("Error cambiando estado:", error)
      const mensajeServidor = error.response?.data || "Error desconocido";
      alert(`No se pudo cambiar el estado. El servidor dice: ${mensajeServidor}`)
      loadEmisores()
    }
  }

  const eliminarEmisor = async (nit) => {
    if (!window.confirm(`¿Está seguro de eliminar al emisor ${nit}?`)) return

    try {
      await api.delete(`/emisores/${nit}`)
      setEmisores(prev => prev.filter(e => e.nitEmisor !== nit))
    } catch (error) {
      console.error("Error eliminando:", error)
      const msg = error.response?.data || "Error al eliminar.";
      alert(msg)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFormData(prev => ({ ...prev, firmaElectronica: "FIRMA_CARGADA_DEMO" })) 
    alert("Archivo seleccionado correctamente.")
  }

  // --- LÓGICA DE FILTRADO COMBINADO ---
  const filteredEmisores = emisores.filter((e) => {
    // 1. Filtro Texto
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      e.nitEmisor.toLowerCase().includes(searchLower) ||
      e.nombreComercial.toLowerCase().includes(searchLower);
    
    // 2. Filtro Estado
    let matchesStatus = true;
    if (filterStatus === "active") matchesStatus = e.activo === true;
    if (filterStatus === "inactive") matchesStatus = e.activo === false;

    return matchesSearch && matchesStatus;
  })

  return (
    <div className="emisores-page">
      <div className="page-header">
        <div className="header-title">
          <h1><Building2 className="icon-header"/> Emisores</h1>
          <p>Gestión de empresas autorizadas</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nuevo Emisor
        </button>
      </div>

      {/* TOOLBAR REESTRUCTURADO PARA QUE NO SEA GIGANTE */}
      <div className="toolbar">
        <div className="toolbar-controls">
            <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
                type="text"
                placeholder="Buscar NIT o Nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <div className="filter-container">
                <Filter size={18} className="filter-icon"/>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>
            </div>
        </div>

        <button className="btn-icon refresh-btn" onClick={loadEmisores} title="Recargar">
          <RefreshCw size={20} className={loading ? "spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando emisores...</p>
        </div>
      ) : (
        <div className="emisores-grid">
          {filteredEmisores.length === 0 ? (
            <div className="empty-state">
              <Building2 size={64} strokeWidth={1} />
              <h3>No se encontraron emisores</h3>
              <p>Intente ajustar los filtros.</p>
            </div>
          ) : (
            filteredEmisores.map((emisor) => (
              <div key={emisor.nitEmisor} className={`emisor-card ${!emisor.activo ? 'disabled' : ''}`}>
                
                <div className="card-header">
                  <div className="company-icon">
                    <Building2 size={24} />
                  </div>
                  <span className={`status-badge ${emisor.activo ? 'active' : 'inactive'}`}>
                    {emisor.activo ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                    {emisor.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="card-body">
                  <h3>{emisor.nombreComercial}</h3>
                  <div className="info-row">
                    <span className="label">NIT:</span>
                    <span className="value mono">{emisor.nitEmisor}</span>
                  </div>
                  <div className="info-row">
                    <span className="label"><Mail size={14}/></span>
                    <span className="value">{emisor.correoEmisor}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className={`btn-toggle ${emisor.activo ? 'danger-text' : 'success-text'}`}
                    onClick={() => toggleEstado(emisor.nitEmisor, emisor.activo)}
                  >
                    {emisor.activo ? "Desactivar" : "Activar"}
                  </button>
                  
                  <button 
                    className="btn-delete"
                    onClick={() => eliminarEmisor(emisor.nitEmisor)}
                    title="Eliminar Emisor"
                  >
                    <Trash2 size={18} />
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
              <h2>Registrar Nuevo Emisor</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-body">
                <div className="form-group">
                  <label>NIT (Sin guiones)</label>
                  <input
                    type="text"
                    value={formData.nitEmisor}
                    onChange={(e) => setFormData({ ...formData, nitEmisor: e.target.value })}
                    placeholder="Ej: 123456789"
                    required
                    maxLength={15}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre Comercial</label>
                  <input
                    type="text"
                    value={formData.nombreComercial}
                    onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                    placeholder="Ej: Mi Empresa S.A."
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
                  <label>Firma Electrónica</label>
                  <div className="signature-input-container">
                    <input 
                        type="text" 
                        className="input-signature"
                        value={formData.firmaElectronica}
                        onChange={(e) => setFormData({ ...formData, firmaElectronica: e.target.value })}
                        placeholder="Contraseña certificado"
                        required
                    />
                    <button type="button" className="btn-upload-mini" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={16}/>
                    </button>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        style={{display:'none'}} 
                        onChange={handleFileUpload}
                    />
                  </div>
                  <small className="hint">
                    <Key size={12}/> Llave para firmar XML ante SAT.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Guardando..." : "Guardar"}
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