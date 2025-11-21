"use client"

import { useState, useEffect, useRef } from "react"
import api from "../services/api"
import { 
  Shield, FileCheck, AlertCircle, CheckCircle, Clock, 
  Search, Upload, Copy, RefreshCw, FileText 
} from "lucide-react"
import "./Certificar.css"

const Certificar = () => {
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  
  // Datos
  const [emisores, setEmisores] = useState([])
  const [emisorSeleccionado, setEmisorSeleccionado] = useState("")
  
  // Formulario Manual
  const [formData, setFormData] = useState({
    xmlDTE: "",
    nitEmisor: "",
  })
  
  // Resultados
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  // ---------------------------------------------------------
  // 1. CARGA INICIAL DE EMISORES
  // ---------------------------------------------------------
  useEffect(() => {
    loadEmisores()
  }, [])

  const loadEmisores = async () => {
    setLoadingData(true)
    try {
      const res = await api.get("/emisores") 
      const activos = (res?.data ?? []).filter((e) => e.activo)
      setEmisores(activos)
    } catch (error) {
      console.error("Error cargando emisores:", error)
      alert("No se pudieron cargar los emisores. Verifique que el backend esté corriendo.")
    } finally {
      setLoadingData(false)
    }
  }

  // ---------------------------------------------------------
  // 2. PARSER XML ROBUSTO (Soporta namespaces gte:)
  // ---------------------------------------------------------
  const extraerNitDelXML = (xmlString) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, "text/xml")
      
      // Buscamos la etiqueta Emisor con o sin namespace gte:
      const emisorNode = 
        xmlDoc.getElementsByTagName("gte:Emisor")[0] || 
        xmlDoc.getElementsByTagName("Emisor")[0]

      if (!emisorNode) return null

      // Buscamos el atributo NITEmisor
      const nit = emisorNode.getAttribute("NITEmisor")
      return nit
    } catch (e) {
      console.error("Error parseando XML", e)
      return null
    }
  }

  // ---------------------------------------------------------
  // 3. MANEJO DEL FORMULARIO
  // ---------------------------------------------------------
  const handleXmlChange = (e) => {
    const xml = e.target.value
    const nitDetectado = extraerNitDelXML(xml)
    
    setFormData(prev => ({
      ...prev,
      xmlDTE: xml,
      // Si detectamos NIT en el XML, lo pre-seleccionamos en el estado local
      // Pero NO forzamos el dropdown si el usuario ya eligió otro manualmente
      nitEmisor: nitDetectado || prev.nitEmisor
    }))

    // Intentar sincronizar el dropdown si encontramos el NIT
    if (nitDetectado) {
      const emisorEncontrado = emisores.find(e => e.nitEmisor === nitDetectado)
      if (emisorEncontrado) {
        setEmisorSeleccionado(emisorEncontrado.nitEmisor) // Usamos NIT como value del select
      }
    }
  }

  const handleFileParams = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const xmlContent = event.target.result
      // Simulamos el evento de cambio manual
      handleXmlChange({ target: { value: xmlContent } })
    }
    reader.readAsText(file)
  }

  // ---------------------------------------------------------
  // 4. ENVIAR A CERTIFICAR (POST AL BACKEND)
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.xmlDTE.trim()) return alert("El XML es obligatorio")
    if (!formData.nitEmisor) return alert("Debe haber un NIT de emisor asociado")

    setLoading(true)
    setResult(null)

    try {
      // Payload exacto para tu DTERequestDTO
      const payload = {
        nitEmisor: formData.nitEmisor,
        xmlDTE: formData.xmlDTE
      }

      console.log("Enviando a CertAPI...", payload)

      // LLAMADA AL CONTROLLER QUE ARREGLAMOS
      const res = await api.post("/certificacion/certificar", payload)

      setResult({ 
        success: true, 
        data: res.data 
      })

    } catch (error) {
      console.error(error)
      const msg = error?.response?.data?.mensaje || 
                  error?.response?.data?.message || // Por si el GlobalExceptionHandler responde
                  error?.message || 
                  "Error desconocido al certificar"
      
      setResult({ success: false, message: msg })
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // 5. UTILIDADES UI
  // ---------------------------------------------------------
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copiado al portapapeles")
  }

  const limpiarFormulario = () => {
    setFormData({ xmlDTE: "", nitEmisor: "" })
    setEmisorSeleccionado("")
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="certificar-page">
      <div className="page-header">
        <div className="header-content">
          <h1><Shield className="icon-title"/> Certificador FEL</h1>
          <p>Ambiente de Pruebas y Certificación Manual</p>
        </div>
        <button onClick={loadEmisores} className="btn-refresh" title="Recargar Emisores">
          <RefreshCw size={18} className={loadingData ? "spin" : ""} />
        </button>
      </div>

      <div className="certificar-layout">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="form-section">
          
          {/* 1. SELECCIÓN DE EMISOR */}
          <div className="card-panel">
            <div className="panel-header">
              <h3>1. Emisor Firmante</h3>
              <span className="step-badge">Requerido</span>
            </div>
            
            <div className="form-group">
              <label>Seleccione la empresa que firma:</label>
              <select
                className="input-select"
                value={emisorSeleccionado}
                onChange={(e) => {
                  setEmisorSeleccionado(e.target.value)
                  setFormData(prev => ({ ...prev, nitEmisor: e.target.value }))
                }}
                disabled={loading}
              >
                <option value="">-- Seleccione Emisor --</option>
                {emisores.map((e) => (
                  <option key={e.idEmisor || e.nitEmisor} value={e.nitEmisor}>
                    {e.nombreComercial} (NIT: {e.nitEmisor})
                  </option>
                ))}
              </select>
              <small className="hint">
                El NIT seleccionado se usará para buscar la firma electrónica (.p12) en el servidor.
              </small>
            </div>
          </div>

          {/* 2. CARGA DE XML */}
          <div className="card-panel">
            <div className="panel-header">
              <h3>2. Documento XML</h3>
              <button 
                type="button" 
                className="btn-text"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Cargar Archivo
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileParams}
              style={{ display: "none" }}
            />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <textarea
                  className="xml-input"
                  rows={15}
                  value={formData.xmlDTE}
                  onChange={handleXmlChange}
                  placeholder='Pegue aquí el XML generado por el sistema de facturación... &#10;<gte:GTDocumento...>'
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={limpiarFormulario}>
                  Limpiar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || !formData.xmlDTE || !formData.nitEmisor}
                >
                  {loading ? (
                    <><div className="spinner-mini"></div> Procesando...</>
                  ) : (
                    <><CheckCircle size={18} /> Certificar Documento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="result-section-container">
          {!result && (
            <div className="empty-state">
              <FileText size={48} opacity={0.2} />
              <p>Los resultados de la certificación aparecerán aquí</p>
            </div>
          )}

          {result && (
            <div className={`result-card ${result.success ? "success" : "error"}`}>
              <div className="result-header">
                {result.success ? (
                  <>
                    <div className="icon-bg success"><CheckCircle size={24} /></div>
                    <div>
                      <h3>¡Certificación Exitosa!</h3>
                      <p className="timestamp">{new Date().toLocaleString()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="icon-bg error"><AlertCircle size={24} /></div>
                    <div>
                      <h3>Error de Certificación</h3>
                      <p>No se pudo procesar el documento</p>
                    </div>
                  </>
                )}
              </div>

              <div className="result-body">
                {result.success ? (
                  <>
                    <div className="data-grid">
                      <div className="data-item">
                        <label>UUID (Folio Fiscal)</label>
                        <div className="value-copy">
                          <span>{result.data.uuid}</span>
                          <button onClick={() => copyToClipboard(result.data.uuid)}><Copy size={14}/></button>
                        </div>
                      </div>
                      <div className="data-item">
                        <label>No. Autorización</label>
                        <span>{result.data.numeroAutorizacion}</span>
                      </div>
                      <div className="data-item">
                        <label>Fecha Certificación</label>
                        <span>{result.data.fechaCertificacion}</span>
                      </div>
                    </div>

                    <div className="xml-preview-container">
                      <div className="preview-header">
                        <label>XML Certificado (Firmado)</label>
                        <button onClick={() => copyToClipboard(result.data.xmlCertificado)}>
                          <Copy size={14}/> Copiar XML
                        </button>
                      </div>
                      <textarea 
                        readOnly 
                        value={result.data.xmlCertificado} 
                        className="xml-output"
                      />
                    </div>
                  </>
                ) : (
                  <div className="error-detail">
                    <strong>Detalle del error:</strong>
                    <p>{result.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Certificar