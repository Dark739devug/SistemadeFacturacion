"use client"

import { useState, useEffect } from "react"
import api from "../services/api" // Asegúrate de que este path sea correcto
import { 
  Plus, Search, FileText, CheckCircle, Clock, AlertCircle, 
  X, Pencil, Trash2, ShieldCheck, Loader2, Building2, Lock 
} from "lucide-react"
import "./Facturas.css" // Asegúrate de tener este archivo o usar los estilos en línea

const Facturas = () => {
  // === ESTADOS ===
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para Modal Crear/Editar
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    numeroFactura: "",
    serie: "",
    nombreCliente: "",
    nitCliente: "",
    direccionCliente: "",
    subtotal: "",
    iva: "",
    total: "",
    detalles: [{ linea: 1, descripcion: "", cantidad: 1, precioUnitario: "", subtotal: "", descuento: 0 }],
  })

  // Estados para Modal Certificar
  const [showCertifyModal, setShowCertifyModal] = useState(false)
  const [selectedFacturaId, setSelectedFacturaId] = useState(null)
  const [emisores, setEmisores] = useState([])
  const [selectedEmisorNit, setSelectedEmisorNit] = useState("")
  const [certifyingLoading, setCertifyingLoading] = useState(false)

  // === CARGA INICIAL ===
  useEffect(() => {
    loadFacturas()
    loadEmisores()
  }, [])

  const loadFacturas = async () => {
    try {
      const response = await api.get("/facturas")
      setFacturas(response.data)
    } catch (error) {
      console.error("Error cargando facturas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmisores = async () => {
    try {
      const response = await api.get("/emisores")
      const activos = (response.data || []).filter(e => e.activo)
      setEmisores(activos)
      // Preseleccionar el primero
      if (activos.length > 0) setSelectedEmisorNit(activos[0].nitEmisor)
    } catch (error) {
      console.error("Error cargando emisores:", error)
    }
  }

  // === LÓGICA DE CERTIFICACIÓN ===
  const handleOpenCertify = (idFactura) => {
    if (emisores.length === 0) {
      alert("No hay emisores activos. Registre una empresa en el módulo de Emisores primero.")
      return
    }
    setSelectedFacturaId(idFactura)
    setShowCertifyModal(true)
  }

  const handleConfirmCertify = async () => {
    if (!selectedEmisorNit) return alert("Debe seleccionar un emisor.")

    setCertifyingLoading(true)
    try {
      const response = await api.post(`/facturas/${selectedFacturaId}/certificar?nitEmisor=${selectedEmisorNit}`)
      
      alert(`¡Éxito! Factura Certificada.\nAutorización: ${response.data.numeroAutorizacion}`)
      setShowCertifyModal(false)
      loadFacturas() // Recargar lista
    } catch (error) {
      console.error("Error certificando:", error)
      const msg = error.response?.data?.message || "Error interno al certificar."
      alert("Fallo la certificación: " + msg)
    } finally {
      setCertifyingLoading(false)
    }
  }

  // === LÓGICA CRUD (Crear, Editar, Borrar) ===
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        subtotal: Number.parseFloat(formData.subtotal),
        iva: Number.parseFloat(formData.iva),
        total: Number.parseFloat(formData.total),
        detalles: formData.detalles.map((d, index) => ({
          linea: index + 1,
          descripcion: d.descripcion,
          cantidad: Number.parseFloat(d.cantidad),
          precioUnitario: Number.parseFloat(d.precioUnitario),
          descuento: Number.parseFloat(d.descuento) || 0,
          subtotal: Number.parseFloat(d.subtotal),
          codigoProducto: d.codigoProducto || null,
          unidadMedida: d.unidadMedida || null,
        })),
      }

      if (editingId) {
        await api.put(`/facturas/${editingId}`, payload)
      } else {
        await api.post("/facturas", payload)
      }

      setShowModal(false)
      resetForm()
      loadFacturas()
    } catch (error) {
      console.error("Error guardando:", error)
      alert("Error al guardar. Verifique los datos.")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar factura? Esto solo se permite si no ha sido certificada.")) return
    try {
      await api.delete(`/facturas/${id}`)
      loadFacturas()
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar.")
    }
  }

  // === HELPERS DEL FORMULARIO ===
  const resetForm = () => {
    setFormData({ numeroFactura: "", serie: "", nombreCliente: "", nitCliente: "", direccionCliente: "", subtotal: "", iva: "", total: "", detalles: [{ linea: 1, descripcion: "", cantidad: 1, precioUnitario: "", subtotal: "", descuento: 0 }] })
    setEditingId(null)
  }

  const handleEdit = (f) => {
    // BLOQUEO DE SEGURIDAD: No editar si ya está certificada
    if (f.estadoCertificacion === "CERTIFICADA") {
        alert("⚠️ ACCIÓN DENEGADA\nNo se puede editar una factura que ya fue certificada ante la SAT.")
        return
    }

    setFormData({
      numeroFactura: f.numeroFactura,
      serie: f.serie,
      nombreCliente: f.nombreCliente,
      nitCliente: f.nitCliente,
      direccionCliente: f.direccionCliente || "",
      subtotal: f.subtotal,
      iva: f.iva,
      total: f.total,
      detalles: f.detalles
    })
    setEditingId(f.idFactura)
    setShowModal(true)
  }

  // Cálculos de totales
  const addDetalle = () => setFormData({...formData, detalles: [...formData.detalles, { linea: formData.detalles.length + 1, descripcion: "", cantidad: 1, precioUnitario: "", subtotal: "", descuento: 0 }]})
  const removeDetalle = (i) => { const d = formData.detalles.filter((_, idx) => idx !== i); setFormData({...formData, detalles: d}); recalcularTotales(d) }
  const updateDetalle = (i, f, v) => { 
    const d = [...formData.detalles]; d[i][f] = v; 
    if(["cantidad","precioUnitario","descuento"].includes(f)){ 
        d[i].subtotal = ((d[i].cantidad * d[i].precioUnitario) - d[i].descuento).toFixed(2) 
    } 
    setFormData({...formData, detalles: d}); recalcularTotales(d) 
  }
  const recalcularTotales = (d) => { 
    const s = d.reduce((acc, x) => acc + (parseFloat(x.subtotal)||0), 0); 
    const i = s * 0.12; 
    setFormData({...formData, subtotal: s.toFixed(2), iva: i.toFixed(2), total: (s+i).toFixed(2)}) 
  }

  // === RENDERIZADO ===
  const getStatusBadge = (estado) => {
    const badges = { 
        CERTIFICADA: { icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4", text: "Certificada" }, 
        PENDIENTE: { icon: Clock, color: "#f59e0b", bg: "#fffbeb", text: "Pendiente" }, 
        ERROR: { icon: AlertCircle, color: "#ef4444", bg: "#fef2f2", text: "Error" } 
    }
    const badge = badges[estado] || badges["PENDIENTE"]
    const Icon = badge.icon
    return <span className="status-badge" style={{ backgroundColor: badge.bg, color: badge.color }}><Icon size={14} /> {badge.text}</span>
  }

  const filteredFacturas = facturas.filter(f => 
    f.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="facturas-page">
      <div className="page-header">
        <div><h1>Facturas</h1><p>Gestión de ventas</p></div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}><Plus size={20} /> Nueva</button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? <div className="loading">Cargando...</div> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredFacturas.map((f) => (
                <tr key={f.idFactura}>
                  <td>{f.numeroFactura}</td>
                  <td>{f.nombreCliente} <br/><small>{f.nitCliente}</small></td>
                  <td>Q {parseFloat(f.total).toFixed(2)}</td>
                  <td>{getStatusBadge(f.estadoCertificacion)}</td>
                  <td>
                    <div className="action-buttons">
                      
                      {/* SI ES PENDIENTE: Muestra todas las opciones */}
                      {f.estadoCertificacion === "PENDIENTE" && (
                        <>
                            <button className="btn-icon-certify" onClick={() => handleOpenCertify(f.idFactura)} title="Certificar">
                                <ShieldCheck size={16} />
                            </button>
                            <button className="btn-icon-edit" onClick={() => handleEdit(f)} title="Editar">
                                <Pencil size={16} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => handleDelete(f.idFactura)} title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </>
                      )}

                      {/* SI ESTÁ CERTIFICADA: Muestra candado (Bloqueado) */}
                      {f.estadoCertificacion === "CERTIFICADA" && (
                        <div className="locked-actions" title="Documento protegido fiscalmente">
                            <Lock size={16} className="icon-lock" />
                            <span style={{fontSize:'11px', color:'#64748b', marginLeft:'4px'}}>Bloqueada</span>
                        </div>
                      )}

                      {/* SI ES ERROR: Permite borrar para reintentar */}
                      {f.estadoCertificacion === "ERROR" && (
                         <button className="btn-icon-delete" onClick={() => handleDelete(f.idFactura)} title="Eliminar error">
                            <Trash2 size={16} />
                         </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingId ? "Editar" : "Nueva"} Factura</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={24}/></button></div>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group"><label>Número</label><input value={formData.numeroFactura} onChange={e=>setFormData({...formData, numeroFactura:e.target.value})} required/></div>
                    <div className="form-group"><label>Serie</label><input value={formData.serie} onChange={e=>setFormData({...formData, serie:e.target.value})} required/></div>
                    <div className="form-group"><label>Cliente</label><input value={formData.nombreCliente} onChange={e=>setFormData({...formData, nombreCliente:e.target.value})} required/></div>
                    <div className="form-group"><label>NIT</label><input value={formData.nitCliente} onChange={e=>setFormData({...formData, nitCliente:e.target.value})} required/></div>
                    <div className="form-group full-width"><label>Dirección</label><input value={formData.direccionCliente} onChange={e=>setFormData({...formData, direccionCliente:e.target.value})}/></div>
                </div>
                
                <div className="detalles-section">
                    <div className="section-header"><h3>Detalles</h3><button type="button" className="btn-secondary" onClick={addDetalle}>+ Item</button></div>
                    {formData.detalles.map((d,i)=>(
                        <div key={i} className="detalle-row">
                            <input placeholder="Desc" value={d.descripcion} onChange={e=>updateDetalle(i,'descripcion',e.target.value)} required/>
                            <input type="number" placeholder="Cant" value={d.cantidad} onChange={e=>updateDetalle(i,'cantidad',e.target.value)} style={{maxWidth:'70px'}} required/>
                            <input type="number" placeholder="Precio" value={d.precioUnitario} onChange={e=>updateDetalle(i,'precioUnitario',e.target.value)} style={{maxWidth:'100px'}} required/>
                            <input value={d.subtotal} readOnly style={{maxWidth:'100px', background:'#f1f5f9'}}/>
                            {formData.detalles.length > 1 && <button type="button" className="btn-danger-icon" onClick={() => removeDetalle(i)}><X size={14}/></button>}
                        </div>
                    ))}
                </div>
                <div className="totales-section">
                    <div className="total-row"><span>Total:</span><strong>Q {formData.total || "0.00"}</strong></div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CERTIFICACIÓN */}
      {showCertifyModal && (
        <div className="modal-overlay" onClick={() => setShowCertifyModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><ShieldCheck size={24} className="icon-blue"/> Certificar</h2>
              <button className="close-btn" onClick={() => setShowCertifyModal(false)}><X size={24}/></button>
            </div>
            <div className="modal-body">
              <p>Seleccione la empresa emisora:</p>
              <div className="form-group">
                <div className="select-wrapper">
                    <Building2 size={18} className="input-icon"/>
                    <select value={selectedEmisorNit} onChange={e => setSelectedEmisorNit(e.target.value)} className="full-select">
                        {emisores.map(e => (
                            <option key={e.nitEmisor} value={e.nitEmisor}>{e.nombreComercial} ({e.nitEmisor})</option>
                        ))}
                    </select>
                </div>
              </div>
              <div className="warning-box"><small>Esta acción es irreversible ante la SAT.</small></div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCertifyModal(false)} disabled={certifyingLoading}>Cancelar</button>
              <button className="btn-primary" onClick={handleConfirmCertify} disabled={certifyingLoading}>
                {certifyingLoading ? <><Loader2 className="spin" size={16}/> Procesando...</> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Facturas