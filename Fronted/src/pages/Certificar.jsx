"use client"

import { useState, useEffect, useRef } from "react"
import api from "../services/api"
import { Shield, FileCheck, AlertCircle, CheckCircle, Clock, Search, Upload } from "lucide-react"
import "./Certificar.css"

const Certificar = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [facturas, setFacturas] = useState([])
  const [emisores, setEmisores] = useState([])
  const [emisorSeleccionado, setEmisorSeleccionado] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    xmlDTE: "",
    nitEmisor: "",
  })

  // ---------------------------------------------------------
  // CARGA INICIAL
  // ---------------------------------------------------------
  useEffect(() => {
    loadFacturas()
    loadEmisores()
  }, [])

  const loadFacturas = async () => {
    setLoadingFacturas(true)
    try {
      const res = await api.get("/facturas")
      setFacturas(res?.data ?? [])
    } catch {
      setFacturas([])
    } finally {
      setLoadingFacturas(false)
    }
  }

  const loadEmisores = async () => {
    try {
      const res = await api.get("/emisores")
      console.log("Emisores cargados:", res.data)
      setEmisores((res?.data ?? []).filter((e) => e?.activo))
    } catch {
      setEmisores([])
    }
  }

  // ---------------------------------------------------------
  // EXTRAER EMISOR DESDE XML
  // ---------------------------------------------------------
  const getEmisorFromXML = (xmlString) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, "text/xml")
      const emisorNode = xmlDoc.querySelector("Emisor")
      if (!emisorNode) return null

      const nitEmisor =
        emisorNode.getAttribute("NITEmisor") ||
        emisorNode.querySelector("NIT")?.textContent

      const nombreComercial =
        emisorNode.getAttribute("NombreComercial") ||
        emisorNode.querySelector("NombreComercial")?.textContent

      if (!nitEmisor) return null
      return { nitEmisor, nombreComercial }
    } catch {
      return null
    }
  }

  // ---------------------------------------------------------
  // VERIFICAR FIRMA ELECTRÓNICA
  // ---------------------------------------------------------
  const tieneFirmaElectronica = (xmlString) => {
    if (!xmlString) return false
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, "text/xml")
      return xmlDoc.querySelector("FirmaElectronica, Signature") !== null
    } catch {
      return false
    }
  }

  // ---------------------------------------------------------
  // GENERAR FIRMA ELECTRÓNICA ALEATORIA
  // ---------------------------------------------------------
  const generarFirmaElectronica = () => {
    return `<FirmaElectronica>${Math.random().toString(36).substring(2, 15)}</FirmaElectronica>`
  }

  // ---------------------------------------------------------
  // OBTENER NIT DEL EMISOR (XML o seleccionado o por defecto)
  // ---------------------------------------------------------
  const obtenerNitEmisor = (xmlDTE) => {
    if (emisorSeleccionado) {
      const emisor = emisores.find((e) => Number(e.idEmisor) === Number(emisorSeleccionado))
      if (!emisor) throw new Error("El emisor seleccionado no existe")
      return emisor.nitEmisor
    }

    const emisorXML = getEmisorFromXML(xmlDTE)
    if (emisorXML) return emisorXML.nitEmisor

    if (emisores.length > 0) return emisores[0].nitEmisor

    // Si no hay ningún emisor, usar uno genérico
    return "9999999-9"
  }

  // ---------------------------------------------------------
  // CERTIFICAR FACTURA INDIVIDUAL DESDE LISTA
  // ---------------------------------------------------------
  const certificarFactura = async (idFactura) => {
    if (!confirm("¿Desea certificar esta factura?")) return

    setLoading(true)
    try {
      const factura = facturas.find((f) => f.idFactura === idFactura)
      if (!factura) throw new Error("Factura no encontrada")

      let xmlDTE = factura.xmlDTE
      if (!tieneFirmaElectronica(xmlDTE)) xmlDTE += generarFirmaElectronica()

      const nitEmisor = obtenerNitEmisor(xmlDTE)

      console.log("Payload a certificar:", { xmlDTE, nitEmisor })

      const res = await api.post(`/facturas/${idFactura}/certificar`, { xmlDTE, nitEmisor })
      setResult({ success: true, data: res?.data })
      alert("Factura certificada exitosamente")
      loadFacturas()
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error?.message || "Error al certificar la factura"
      setResult({ success: false, message: msg })
      alert("Error: " + msg)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // CERTIFICAR DESDE XML (FORMULARIO)
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.xmlDTE.trim()) return alert("El XML no puede estar vacío")

    setLoading(true)
    setResult(null)

    try {
      // Separar múltiples XML por doble salto de línea
      const xmls = formData.xmlDTE.split(/\n\s*\n/).filter((x) => x.trim())
      const resultados = []

      for (let xml of xmls) {
        if (!tieneFirmaElectronica(xml)) xml += generarFirmaElectronica()
        const nitEmisor = obtenerNitEmisor(xml)
        const payload = { xmlDTE: xml, nitEmisor }
        const res = await api.post("/certificacion/certificar", payload)
        resultados.push(res?.data)
      }

      setResult({ success: true, data: resultados })
      setFormData({ xmlDTE: "", nitEmisor: "" })
      if (fileInputRef.current) fileInputRef.current.value = ""
      loadFacturas()
      alert("Todos los XML fueron certificados exitosamente")
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error?.message || "Error al certificar el DTE"
      setResult({ success: false, message: msg })
      alert("Error: " + msg)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // ACTUALIZAR NIT AUTOMÁTICAMENTE AL PEGAR XML
  // ---------------------------------------------------------
  useEffect(() => {
    if (formData.xmlDTE && !emisorSeleccionado) {
      const emisorXML = getEmisorFromXML(formData.xmlDTE)
      if (emisorXML) setFormData((prev) => ({ ...prev, nitEmisor: emisorXML.nitEmisor }))
    }
  }, [formData.xmlDTE, emisorSeleccionado])

  // ---------------------------------------------------------
  // BADGE ESTADO
  // ---------------------------------------------------------
  const getStatusBadge = (estado) => {
    const map = {
      CERTIFICADA: { icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4" },
      PENDIENTE: { icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
      ERROR: { icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" },
    }
    const badge = map[estado] || map.PENDIENTE
    const Icon = badge.icon
    return (
      <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
        <Icon size={14} /> {estado}
      </span>
    )
  }

  // ---------------------------------------------------------
  // FILTRO DE FACTURAS
  // ---------------------------------------------------------
  const filteredFacturas = facturas.filter((f) => {
    const term = searchTerm.toLowerCase()
    return (
      (f?.numeroFactura ?? "").toString().toLowerCase().includes(term) ||
      (f?.nombreCliente ?? "").toString().toLowerCase().includes(term)
    )
  })

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  const handleMultipleFilesUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const xmlContent = event.target.result
        setFormData((prev) => ({
          ...prev,
          xmlDTE: prev.xmlDTE ? prev.xmlDTE + "\n\n" + xmlContent : xmlContent,
        }))
      }
      reader.readAsText(file)
    })
  }

  return (
    <div className="certificar-page">
      <div className="page-header">
        <div>
          <h1>Certificar DTE</h1>
          <p>Gestión y certificación de documentos tributarios electrónicos.</p>
        </div>
      </div>

      {/* Selector de Emisor */}
      <div className={`emisor-selector-card ${emisorSeleccionado ? "selected" : "required"}`}>
        <div className="emisor-header">
          <h3>Seleccionar Emisor Certificador</h3>
          {!emisorSeleccionado ? (
            <span className="required-badge">REQUERIDO</span>
          ) : (
            <span className="selected-badge">✓ Seleccionado</span>
          )}
        </div>

        <select
          className={`emisor-select ${emisorSeleccionado ? "filled" : "empty"}`}
          value={emisorSeleccionado}
          onChange={(e) => {
            const id = e.target.value
            setEmisorSeleccionado(id)
            const emisor = emisores.find((x) => Number(x.idEmisor) === Number(id))
            setFormData((prev) => ({ ...prev, nitEmisor: emisor?.nitEmisor ?? "" }))
          }}
        >
          <option value="">-- Seleccione un emisor --</option>
          {emisores.map((e) => (
            <option key={e.idEmisor} value={e.idEmisor}>
              {e.nombreComercial} - NIT {e.nitEmisor}
            </option>
          ))}
        </select>
      </div>

      <div className="certificar-layout">
        {/* FORMULARIO */}
        <div className="form-section">
          <div className="info-box">
            <Shield size={24} />
            <div>
              <h3>Sistema FEL</h3>
              <p>Ingrese XML para certificar el documento tributario.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>NIT del Emisor</label>
              <input type="text" value={formData.nitEmisor} disabled />
            </div>

            <div className="form-group">
              <label>Cargar Archivo XML</label>
              <div className="file-upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml"
                  multiple
                  onChange={handleMultipleFilesUpload}
                  style={{ display: "none" }}
                  id="xml-file-input"
                />
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} /> Seleccionar archivo(s) .xml
                </button>
                <span className="file-hint">O pegue los XML directamente abajo</span>
              </div>
            </div>

            <div className="form-group">
              <label>XML del DTE</label>
              <textarea
                rows={12}
                value={formData.xmlDTE}
                onChange={(e) => setFormData({ ...formData, xmlDTE: e.target.value })}
                placeholder="Pegue aquí el XML sin formato o cargue un archivo arriba…"
              />
            </div>

            <button className="btn-primary btn-large" disabled={loading}>
              {loading ? <div className="spinner"></div> : <Shield size={20} />}
              {loading ? " Certificando…" : " Certificar DTE"}
            </button>
          </form>

          {/* RESULTADO */}
          {result && (
            <div className={`result-section ${result.success ? "success" : "error"}`}>
              <div className="result-header">
                {result.success ? <FileCheck size={28} /> : <AlertCircle size={28} />}
                <h3>{result.success ? "Certificación Exitosa" : "Error"}</h3>
              </div>

              <div className="result-body">
                {result.success ? (
                  Array.isArray(result.data) ? (
                    result.data.map((r, i) => (
                      <div key={i} className="result-item">
                        <b>UUID:</b> {r.uuid} | <b>Serie:</b> {r.serie} | <b>Número:</b> {r.numero} | <b>Autorización:</b> {r.numeroAutorizacion}
                        {r.xmlCertificado && (
                          <textarea className="xml-output" value={r.xmlCertificado} readOnly rows={6} />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="result-item"><b>UUID:</b> {result.data?.uuid}</div>
                      <div className="result-item"><b>Serie:</b> {result.data?.serie}</div>
                      <div className="result-item"><b>Número:</b> {result.data?.numero}</div>
                      <div className="result-item"><b>Autorización:</b> {result.data?.numeroAutorizacion}</div>
                      {result.data?.xmlCertificado && (
                        <textarea className="xml-output" value={result.data.xmlCertificado} readOnly rows={8} />
                      )}
                    </>
                  )
                ) : (
                  <p className="error-message">{result.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE FACTURAS */}
        <div className="facturas-list-section">
          <div className="section-header">
            <h3>Facturas</h3>
            <p>Certificaciones registradas</p>
          </div>

          <div className="search-bar-small">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loadingFacturas ? (
            <div className="loading-small">Cargando...</div>
          ) : filteredFacturas.length === 0 ? (
            <div className="empty-state-small">No hay facturas</div>
          ) : (
            <div className="facturas-list">
              {filteredFacturas.map((f) => (
                <div key={f.idFactura} className="factura-item">
                  <div className="factura-item-header">
                    <span className="factura-numero">{f.numeroFactura}</span>
                    {getStatusBadge(f.estadoCertificacion)}
                  </div>
                  <div className="factura-item-body">
                    <p>{f.nombreCliente}</p>
                    <p className="factura-total">Q {Number(f.total).toFixed(2)}</p>
                  </div>
                  {f.estadoCertificacion === "PENDIENTE" && (
                    <button
                      className="btn-certificar-small"
                      disabled={loading}
                      onClick={() => certificarFactura(f.idFactura)}
                    >
                      <Shield size={14} /> Certificar
                    </button>
                  )}
                  {f.uuidFel && <small className="factura-uuid">UUID: {f.uuidFel.substring(0, 20)}...</small>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Certificar
