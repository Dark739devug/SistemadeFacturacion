"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle, X, Pencil, Trash2 } from "lucide-react"
import "./Facturas.css"

const Facturas = () => {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

  useEffect(() => {
    loadFacturas()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        subtotal: Number.parseFloat(formData.subtotal),
        iva: Number.parseFloat(formData.iva),
        total: Number.parseFloat(formData.total),
        detalles: formData.detalles.map((d, index) => ({
          linea: index + 1, // Número de línea automático
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
      console.error("Error guardando factura:", error)
      const errorMsg = error.response?.data?.mensaje || error.response?.data?.message || "Error al guardar la factura"
      alert(errorMsg)
    }
  }

  const resetForm = () => {
    setFormData({
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
    setEditingId(null)
  }

  const handleEdit = (factura) => {
    setFormData({
      numeroFactura: factura.numeroFactura,
      serie: factura.serie,
      nombreCliente: factura.nombreCliente,
      nitCliente: factura.nitCliente,
      direccionCliente: factura.direccionCliente || "",
      subtotal: factura.subtotal.toString(),
      iva: factura.iva.toString(),
      total: factura.total.toString(),
      detalles: factura.detalles.map((d) => ({
        linea: d.linea,
        descripcion: d.descripcion,
        cantidad: d.cantidad.toString(),
        precioUnitario: d.precioUnitario.toString(),
        subtotal: d.subtotal.toString(),
        descuento: d.descuento || 0,
        codigoProducto: d.codigoProducto || "",
        unidadMedida: d.unidadMedida || "",
      })),
    })
    setEditingId(factura.idFactura)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta factura?")) return

    try {
      await api.delete(`/facturas/${id}`)
      loadFacturas()
    } catch (error) {
      console.error("Error eliminando factura:", error)
      alert(error.response?.data?.mensaje || "Error al eliminar la factura")
    }
  }

  const addDetalle = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          linea: formData.detalles.length + 1,
          descripcion: "",
          cantidad: 1,
          precioUnitario: "",
          subtotal: "",
          descuento: 0,
        },
      ],
    })
  }

  const removeDetalle = (index) => {
    const newDetalles = formData.detalles.filter((_, i) => i !== index)
    // Renumerar líneas
    const renumbered = newDetalles.map((d, i) => ({ ...d, linea: i + 1 }))
    setFormData({ ...formData, detalles: renumbered })
    recalcularTotales(renumbered)
  }

  const updateDetalle = (index, field, value) => {
    const newDetalles = [...formData.detalles]
    newDetalles[index][field] = value

    if (field === "cantidad" || field === "precioUnitario" || field === "descuento") {
      const cantidad = Number.parseFloat(newDetalles[index].cantidad) || 0
      const precio = Number.parseFloat(newDetalles[index].precioUnitario) || 0
      const descuento = Number.parseFloat(newDetalles[index].descuento) || 0
      newDetalles[index].subtotal = (cantidad * precio - descuento).toFixed(2)
    }

    setFormData({ ...formData, detalles: newDetalles })
    recalcularTotales(newDetalles)
  }

  const recalcularTotales = (detalles) => {
    const subtotal = detalles.reduce((acc, det) => acc + (Number.parseFloat(det.subtotal) || 0), 0)
    const iva = subtotal * 0.12
    const total = subtotal + iva

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2),
    }))
  }

  const getStatusBadge = (estado) => {
    const badges = {
      CERTIFICADA: { icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4", text: "Certificada" },
      PENDIENTE: { icon: Clock, color: "#f59e0b", bg: "#fffbeb", text: "Pendiente" },
      ERROR: { icon: AlertCircle, color: "#ef4444", bg: "#fef2f2", text: "Error" },
    }
    const badge = badges[estado] || badges["PENDIENTE"]
    const Icon = badge.icon

    return (
      <span className="status-badge" style={{ backgroundColor: badge.bg, color: badge.color }}>
        <Icon size={14} />
        {badge.text}
      </span>
    )
  }

  const filteredFacturas = facturas.filter(
    (f) =>
      f.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.nitCliente.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="facturas-page">
      <div className="page-header">
        <div>
          <h1>Facturas</h1>
          <p>Gestión de facturas electrónicas</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          <Plus size={20} />
          Nueva Factura
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por número, cliente o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Cargando facturas...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Serie</th>
                <th>Cliente</th>
                <th>NIT</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturas.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                    <p>No se encontraron facturas</p>
                  </td>
                </tr>
              ) : (
                filteredFacturas.map((factura) => (
                  <tr key={factura.idFactura}>
                    <td>{factura.numeroFactura}</td>
                    <td>{factura.serie}</td>
                    <td>{factura.nombreCliente}</td>
                    <td>{factura.nitCliente}</td>
                    <td>Q {Number.parseFloat(factura.total).toFixed(2)}</td>
                    <td>{getStatusBadge(factura.estadoCertificacion)}</td>
                    <td>{new Date(factura.fechaEmision).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {factura.estadoCertificacion === "PENDIENTE" && (
                          <button className="btn-icon-edit" onClick={() => handleEdit(factura)} title="Editar">
                            <Pencil size={16} />
                          </button>
                        )}
                        {factura.estadoCertificacion !== "CERTIFICADA" && (
                          <button
                            className="btn-icon-delete"
                            onClick={() => handleDelete(factura.idFactura)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Editar Factura" : "Nueva Factura"}</h2>
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
              <div className="form-grid">
                <div className="form-group">
                  <label>Número de Factura</label>
                  <input
                    type="text"
                    value={formData.numeroFactura}
                    onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Serie</label>
                  <input
                    type="text"
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nombre del Cliente</label>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>NIT del Cliente</label>
                  <input
                    type="text"
                    value={formData.nitCliente}
                    onChange={(e) => setFormData({ ...formData, nitCliente: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Dirección del Cliente</label>
                  <input
                    type="text"
                    value={formData.direccionCliente}
                    onChange={(e) => setFormData({ ...formData, direccionCliente: e.target.value })}
                  />
                </div>
              </div>

              <div className="detalles-section">
                <div className="section-header">
                  <h3>Detalles de la Factura</h3>
                  <button type="button" className="btn-secondary" onClick={addDetalle}>
                    <Plus size={16} />
                    Agregar Item
                  </button>
                </div>

                {formData.detalles.map((detalle, index) => (
                  <div key={index} className="detalle-row">
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={detalle.descripcion}
                      onChange={(e) => updateDetalle(index, "descripcion", e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={detalle.cantidad}
                      onChange={(e) => updateDetalle(index, "cantidad", e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      style={{ maxWidth: "100px" }}
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={detalle.precioUnitario}
                      onChange={(e) => updateDetalle(index, "precioUnitario", e.target.value)}
                      required
                      step="0.01"
                      min="0.01"
                      style={{ maxWidth: "120px" }}
                    />
                    <input
                      type="text"
                      placeholder="Subtotal"
                      value={detalle.subtotal}
                      readOnly
                      style={{ maxWidth: "120px", backgroundColor: "var(--secondary)" }}
                    />
                    {formData.detalles.length > 1 && (
                      <button type="button" className="btn-danger-icon" onClick={() => removeDetalle(index)}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="totales-section">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <strong>Q {formData.subtotal || "0.00"}</strong>
                </div>
                <div className="total-row">
                  <span>IVA (12%):</span>
                  <strong>Q {formData.iva || "0.00"}</strong>
                </div>
                <div className="total-row total">
                  <span>Total:</span>
                  <strong>Q {formData.total || "0.00"}</strong>
                </div>
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
                  {editingId ? "Actualizar" : "Crear"} Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Facturas
