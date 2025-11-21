"use client"

import { useState, useEffect, useRef } from "react"
import api from "../services/api"
import { 
  Plus, Search, Building2, X, Mail, 
  Key, Trash2, RefreshCw, CheckCircle, AlertCircle, Upload 
} from "lucide-react"
import "./Emisores.css"

const Emisores = () => {
  const [emisores, setEmisores] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false) // Para spinners en botones
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    nitEmisor: "",
    nombreComercial: "",
    correoEmisor: "",
    firmaElectronica: "",
  })

  // ---------------------------------------------------------
  // CARGA INICIAL
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // CREAR EMISOR (POST)
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      // CORRECCIÓN: La ruta correcta es /emisores/registrar
      await api.post("/emisores/registrar", formData)
      
      setShowModal(false)
      setFormData({
        nitEmisor: "",
        nombreComercial: "",
        correoEmisor: "",
        firmaElectronica: "",
      })
      loadEmisores() // Recargar la lista
      alert("Emisor registrado exitosamente")
    } catch (error) {
      console.error("Error creando emisor:", error)
      const msg = error.response?.data || "Error al crear el emisor. Verifique si el NIT ya existe."
      alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // ---------------------------------------------------------
  // CAMBIAR ESTADO (PATCH) - ARREGLADO
  // ---------------------------------------------------------
  const toggleEstado = async (nit, estadoActual) => {
    const nuevoEstado = !estadoActual
    const confirmMsg = nuevoEstado 
      ? "¿Desea activar este emisor para firmar documentos?" 
      : "¿Desea desactivar este emisor? No podrá certificar facturas."
    
    if (!window.confirm(confirmMsg)) return

    try {
      // ARREGLO AQUÍ: Usamos 'params' para que Axios construya la URL correctamente
      // La sintaxis es: url, body (null), config
      await api.patch(`/emisores/${nit}/activo`, null, {
        params: {
          activo: nuevoEstado
        }
      })

      // Actualizamos localmente para que sea rápido (Optimistic UI)
      setEmisores(prev => prev.map(e => 
        e.nitEmisor === nit ? { ...e, activo: nuevoEstado } : e
      ))

    } catch (error) {
      console.error("Error cambiando estado:", error)
      
      // ARREGLO AQUÍ: Mostramos el mensaje exacto que devuelve Spring Boot
      const mensajeServidor = error.response?.data || "Error desconocido";
      alert(`No se pudo cambiar el estado. El servidor dice: ${mensajeServidor}`)
      
      loadEmisores() // Revertir si falló cargando de nuevo la lista real
    }
  }

  // ---------------------------------------------------------
  // ELIMINAR EMISOR (DELETE)
  // ---------------------------------------------------------
  const eliminarEmisor = async (nit) => {
    if (!window.confirm(`¿Está seguro de eliminar al emisor ${nit}? Esta acción no se puede deshacer.`)) return

    try {
      await api.delete(`/emisores/${nit}`)
      setEmisores(prev => prev.filter(e => e.nitEmisor !== nit))
    } catch (error) {
      console.error("Error eliminando:", error)
      const msg = error.response?.data || "Error al eliminar. Verifique que no tenga facturas asociadas.";
      alert(msg)
    }
  }

  // ---------------------------------------------------------
  // MANEJO DE ARCHIVO DE FIRMA
  // ---------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      // Simulación: Guardamos un string placeholder
      setFormData(prev => ({ ...prev, firmaElectronica: "CONTENIDO_DEL_ARCHIVO_CARGADO" })) 
      alert("Archivo cargado. (Simulado: El sistema real necesitaría convertir .p12 a Base64)")
    }
    // reader.readAsDataURL(file) 
    setFormData(prev => ({ ...prev, firmaElectronica: "FIRMA_CARGADA_DESDE_ARCHIVO_DEMO" }))
  }

  // ---------------------------------------------------------
  // FILTROS
  // ---------------------------------------------------------
  const filteredEmisores = emisores.filter(
    (e) =>
      e.nitEmisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="emisores-page">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-title">
          <h1><Building2 className="icon-header"/> Emisores</h1>
          <p>Gestión de empresas autorizadas para certificar</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nuevo Emisor
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="toolbar">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por NIT o Nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-icon" onClick={loadEmisores} title="Recargar">
          <RefreshCw size={20} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* LISTADO */}
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
              <p>Intente ajustar la búsqueda o agregue uno nuevo.</p>
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

      {/* MODAL DE CREACIÓN */}
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
                  <label>Firma Electrónica / Contraseña Certificado</label>
                  <div className="signature-input-container">
                    <input 
                        type="text" 
                        className="input-signature"
                        value={formData.firmaElectronica}
                        onChange={(e) => setFormData({ ...formData, firmaElectronica: e.target.value })}
                        placeholder="Ingrese la contraseña del certificado o el hash"
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
                    <Key size={12}/> Esta es la llave que se usará para firmar los XML ante la SAT.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Guardando..." : "Guardar Emisor"}
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