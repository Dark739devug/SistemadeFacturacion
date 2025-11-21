'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './facturacion.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes del Modal (Asegúrate de que las rutas relativas sean correctas)
import CrearFacturaModal from './Crearfacturamodal';
import PDFPreviewModal from './PDFPreviewModal';
import ENDPOINTS from '../../lib/api'; // <--- RUTA CENTRALIZADA

// --- Funciones auxiliares (necesarias para el funcionamiento) ---

function limpiarToken(tokenSucio) {
  if (!tokenSucio) return null;
  let token = String(tokenSucio);
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1);
  }
  try {
    const objetoParseado = JSON.parse(token);
    if (typeof objetoParseado === 'string') return objetoParseado;
    if (objetoParseado.accessToken) return objetoParseado.accessToken;
    if (objetoParseado.token) return objetoParseado.token;
    return null;
  } catch {}
  return token;
}

// --- Componente Principal ---

export default function Factura() {
  const router = useRouter();
  
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('FechaDesc');
  const [paginaActual, setPaginaActual] = useState(1);
  const facturasPorPagina = 10;
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    cargarFacturas();
  }, []);

  async function cargarFacturas() {
    setCargando(true);
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { Accept: 'application/json' };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      // 🟢 USO DE ENDPOINTS: Cargar todas las facturas
      const respuesta = await fetch(ENDPOINTS.facturas, { headers: cabeceras });

      if (!respuesta.ok) {
        if (respuesta.status === 401 || respuesta.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      const listaFacturas = Array.isArray(datos) ? datos : (datos.items || []);
      setFacturas(listaFacturas);
    } catch (error) {
      console.error('Error cargando facturas:', error);
      toast.error('Error al cargar las facturas.');
    } finally {
      setCargando(false);
    }
  }

  // ===== FUNCIÓN PARA GENERAR PDF CON LIBRERÍAS EXTERNAS =====
  // Nota: Estas librerías (jspdf, autotable) deben estar instaladas en tu proyecto (npm install jspdf jspdf-autotable)
  const generarFacturaPDF = async (factura, descargar = true) => {
    try {
      // Importación dinámica correcta para Next.js
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      // Colores
      const azulPrincipal = [30, 64, 175];
      const azulClaro = [239, 246, 255];
      const grisOscuro = [30, 41, 59];
      const grisClaro = [148, 163, 184];
      const amarillo = [251, 191, 36];
      const verde = [16, 185, 129];
      const rojo = [239, 68, 68];
      
      // Configuración
      const margen = 15;
      const anchoUtil = 180;
      let y = margen;
      
      // ===== ENCABEZADO =====
      doc.setFillColor(...azulPrincipal);
      doc.rect(0, 0, 210, 45, 'F');
      
      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA ELECTRÓNICA', 105, 20, { align: 'center' });
      
      // Número de factura
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`No. ${factura.numeroFactura}`, 105, 28, { align: 'center' });
      
      // Badge de estado
      const estadoColor = factura.nombreEstado === 'Borrador' ? amarillo : 
                          factura.nombreEstado === 'Certificada' ? verde : grisClaro;
      doc.setFillColor(...estadoColor);
      doc.roundedRect(75, 32, 60, 8, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Estado: ${factura.nombreEstado.toUpperCase()}`, 105, 37.5, { align: 'center' });
      
      y = 52;
      
      // ===== INFORMACIÓN EMISOR Y RECEPTOR =====
      doc.setFillColor(241, 245, 249);
      doc.rect(margen, y, anchoUtil, 7, 'F');
      
      // Encabezados
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('EMISOR', margen + 5, y + 5);
      doc.text('RECEPTOR', margen + 95, y + 5);
      
      y += 10;
      
      // Datos emisor y receptor
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(factura.nombreEstablecimiento, margen + 5, y);
      doc.text(factura.razonSocialCliente, margen + 95, y);
      
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Guatemala, Guatemala', margen + 5, y);
      doc.text(`NIT: ${factura.nitCliente}`, margen + 95, y);
      
      // Marco
      doc.setDrawColor(226, 232, 240);
      doc.rect(margen, 52, anchoUtil, 18);
      doc.line(margen + 90, 52, margen + 90, 70);
      
      y = 75;
      
      // ===== INFORMACIÓN DE LA FACTURA =====
      doc.setFillColor(248, 250, 252);
      doc.rect(margen, y, anchoUtil, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margen, y, anchoUtil, 24);
      
      // Formatear fecha
      const fecha = new Date(factura.fechaEmision);
      const fechaFormateada = fecha.toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Primera fila
      doc.text('Tipo de Documento:', margen + 3, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.tipoDocumento, margen + 40, y + 6);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha de Emisión:', margen + 93, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(fechaFormateada, margen + 130, y + 6);
      
      // Segunda fila
      doc.setFont('helvetica', 'bold');
      doc.text('Serie:', margen + 3, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.serie || 'N/A', margen + 40, y + 12);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Correlativo:', margen + 93, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(String(factura.correlativo || 'N/A'), margen + 130, y + 12);
      
      // Tercera fila
      doc.setFont('helvetica', 'bold');
      doc.text('Usuario Creación:', margen + 3, y + 18);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.usuarioCreacion, margen + 40, y + 18);
      
      doc.setFont('helvetica', 'bold');
      doc.text('No. Autorización:', margen + 93, y + 18);
      doc.setFont('helvetica', 'normal');
      doc.text(factura.numeroAutorizacion || 'Pendiente', margen + 130, y + 18);
      
      y = 105;
      
      
      doc.setTextColor(...grisOscuro);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE PRODUCTOS', margen, y);
      
      y += 5;
      
      // Preparar datos para la tabla
      const productosData = factura.detalles.map(det => [
        det.numeroLinea,
        `${det.nombreProducto}\n${det.descripcionProducto}`,
        det.cantidad,
        det.unidadMedida,
        `Q${det.precioUnitario.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${det.descuento}%`,
        `Q${det.montoIva.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `Q${det.totalLinea.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      
      // Usar autoTable correctamente
      autoTable(doc, {
        startY: y,
        head: [['No.', 'Producto', 'Cant.', 'U.M.', 'Precio Unit.', 'Desc.', 'IVA', 'Total']],
        body: productosData,
        theme: 'striped',
        headStyles: {
          fillColor: azulPrincipal,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: grisOscuro
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 50 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'center', cellWidth: 15 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 15 },
          6: { halign: 'right', cellWidth: 20 },
          7: { halign: 'right', cellWidth: 25, fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: margen, right: margen }
      });
      
      // Obtener la posición Y después de la tabla
      y = doc.lastAutoTable.finalY + 10;
      
      // ===== TOTALES =====
      const totales = [
        ['Subtotal:', `Q${factura.subtotal.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Descuentos:', `-Q${factura.totalDescuentos.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Subtotal con Descuento:', `Q${factura.subtotalConDescuento.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['IVA (12%):', `Q${factura.totalIva.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['TOTAL A PAGAR:', `Q${factura.totalFactura.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
      ];
      
      autoTable(doc, {
        startY: y,
        body: totales,
        theme: 'plain',
        bodyStyles: {
          fontSize: 10,
          textColor: grisOscuro
        },
        columnStyles: {
          0: { halign: 'right', cellWidth: 135, fontStyle: 'bold' },
          1: { halign: 'right', cellWidth: 45 }
        },
        didParseCell: function(data) {
          if (data.row.index === 4) {
            data.cell.styles.fontSize = 12;
            data.cell.styles.textColor = azulPrincipal;
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.row.index === 1) {
            data.cell.styles.textColor = rojo;
          }
        },
        didDrawCell: function(data) {
          if (data.row.index === 4 && data.section === 'body') {
            doc.setDrawColor(...azulPrincipal);
            doc.setLineWidth(0.5);
            doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
          }
        },
        margin: { left: margen, right: margen }
      });
      
      // Fondo para el total
      const finalY = doc.lastAutoTable.finalY;
      doc.setFillColor(...azulClaro);
      doc.rect(margen + 135, finalY - 10, 45, 10, 'F');
      
      // ===== OBSERVACIONES =====
      if (factura.observaciones && factura.observaciones.trim()) {
        y = doc.lastAutoTable.finalY + 8;
        doc.setTextColor(...grisOscuro);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones:', margen, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const observacionesLineas = doc.splitTextToSize(factura.observaciones, anchoUtil - 10);
        doc.text(observacionesLineas, margen, y + 5);
      }
      
      // ===== PIE DE PÁGINA =====
      const altoPagina = doc.internal.pageSize.height;
      y = altoPagina - 20;
      
      doc.setDrawColor(...grisClaro);
      doc.setLineWidth(0.3);
      doc.line(margen, y, 195, y);
      
      y += 5;
      doc.setTextColor(...grisClaro);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const ahora = new Date().toLocaleString('es-GT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Documento generado electrónicamente • ${ahora}`, 105, y, { align: 'center' });
      doc.text('Sistema de Facturación Electrónica - Guatemala', 105, y + 4, { align: 'center' });
      
      // Guardar o retornar el PDF según el parámetro
      if (descargar) {
        doc.save(`Factura_${factura.numeroFactura}.pdf`);
        return null;
      } else {
        // Retornar blob para previsualización
        return doc.output('blob');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  };

  // Función para descargar la factura en PDF
  async function descargarFacturaPDF(idFactura) {
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { Accept: 'application/json' };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      toast.info('Generando PDF...');

      // 🟢 USO DE ENDPOINTS: Obtener factura completa por ID
      const respuesta = await fetch(ENDPOINTS.clientePorId(idFactura), { headers: cabeceras });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const facturaCompleta = await respuesta.json();

      if (!facturaCompleta.detalles || facturaCompleta.detalles.length === 0) {
        toast.error('La factura no tiene productos para mostrar');
        return;
      }

      await generarFacturaPDF(facturaCompleta, true);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('No se pudo generar el PDF de la factura.');
    }
  }

  // Función para previsualizar la factura en PDF
  async function previsualizarFacturaPDF(idFactura) {
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { Accept: 'application/json' };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      toast.info('Generando vista previa...');

      // 🟢 USO DE ENDPOINTS: Obtener factura completa por ID
      const respuesta = await fetch(ENDPOINTS.clientePorId(idFactura), { headers: cabeceras });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const facturaCompleta = await respuesta.json();

      if (!facturaCompleta.detalles || facturaCompleta.detalles.length === 0) {
        toast.error('La factura no tiene productos para mostrar');
        return;
      }

      // Generar el PDF como blob
      const pdfBlob = await generarFacturaPDF(facturaCompleta, false);
      
      // Limpiar URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Crear URL del blob
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setPdfPreviewOpen(true);
      
      toast.success('Vista previa generada');
    } catch (error) {
      console.error('Error generando vista previa:', error);
      toast.error('No se pudo generar la vista previa.');
    }
  }

  // Limpiar URL del PDF cuando se cierra el modal
  const cerrarPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfPreviewOpen(false);
  };

  const facturasFiltradas = useMemo(() => {
    let resultado = [...facturas];

    if (textoBusqueda) {
      const busqueda = textoBusqueda.toLowerCase();
      resultado = resultado.filter(f =>
        (f.numeroFactura || '').toLowerCase().includes(busqueda) ||
        (f.razonSocialCliente || '').toLowerCase().includes(busqueda) ||
        (f.nitCliente || '').toLowerCase().includes(busqueda)
      );
    }

    if (filtroEstado !== 'Todos') {
      resultado = resultado.filter(f => f.nombreEstado === filtroEstado);
    }

    if (filtroFecha) {
      resultado = resultado.filter(f => {
        const fechaFactura = new Date(f.fechaEmision).toISOString().split('T')[0];
        return fechaFactura === filtroFecha;
      });
    }

    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case 'FechaDesc':
          return new Date(b.fechaEmision) - new Date(a.fechaEmision);
        case 'FechaAsc':
          return new Date(a.fechaEmision) - new Date(b.fechaEmision);
        case 'MontoDesc':
          return (b.totalFactura || 0) - (a.totalFactura || 0);
        case 'MontoAsc':
          return (a.totalFactura || 0) - (b.totalFactura || 0);
        default:
          return 0;
      }
    });

    return resultado;
  }, [facturas, textoBusqueda, filtroEstado, filtroFecha, ordenamiento]);

  const totalPaginas = Math.max(1, Math.ceil(facturasFiltradas.length / facturasPorPagina));
  const facturasPaginaActual = facturasFiltradas.slice(
    (paginaActual - 1) * facturasPorPagina,
    paginaActual * facturasPorPagina
  );

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(monto || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const abrirModal = () => {
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const alCrearFactura = (nuevaFactura) => {
    setFacturas(prev => [nuevaFactura, ...prev]);
    cargarFacturas();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Facturas</h1>
          <p className={styles.descripcion}>Gestiona todas tus facturas en un solo lugar</p>
        </div>
        <button className={styles.boton} onClick={abrirModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M9 12h6" />
            <path d="M12 9v6" />
          </svg>
          Crear Factura
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.inputGroup}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>
          <input
            type="search"
            placeholder="Buscar factura o cliente..."
            className={styles.input}
            value={textoBusqueda}
            onChange={(e) => {
              setTextoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <select 
          className={styles.select}
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">Estado: Todos</option>
          <option value="Borrador">Borrador</option>
          <option value="Certificada">Certificada</option>
          <option value="Anulado">Anulado</option>
          <option value="Pendiente">Pendiente</option>
        </select>

        <input
          type="date"
          className={styles.input}
          value={filtroFecha}
          onChange={(e) => {
            setFiltroFecha(e.target.value);
            setPaginaActual(1);
          }}
        />

        <select 
          className={styles.select}
          value={ordenamiento}
          onChange={(e) => setOrdenamiento(e.target.value)}
        >
          <option value="FechaDesc">Ordenar: Fecha (recientes)</option>
          <option value="FechaAsc">Fecha (antiguas)</option>
          <option value="MontoDesc">Monto (mayor)</option>
          <option value="MontoAsc">Monto (menor)</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {cargando ? (
          <div className={styles.loader}>Cargando facturas...</div>
        ) : (
          <>
            <table className={styles.factura}>
              <thead>
                <tr>
                  <th>No. Factura</th>
                  <th>Cliente</th>
                  <th>Fecha Emisión</th>
                  <th>Monto Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasPaginaActual.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.empty}>
                      No hay facturas para mostrar
                    </td>
                  </tr>
                ) : (
                  facturasPaginaActual.map((factura) => (
                    <tr key={factura.idFactura}>
                      <td><strong>#{factura.numeroFactura}</strong></td>
                      <td>{factura.razonSocialCliente || '-'}</td>
                      <td>{formatearFecha(factura.fechaEmision)}</td>
                      <td><strong>{formatearMoneda(factura.totalFactura)}</strong></td>
                      <td>
                        <span className={
                          factura.nombreEstado === 'Certificada' ? styles.statusActive :
                          factura.nombreEstado === 'Borrador' ? styles.statusPending :
                          factura.nombreEstado === 'Anulado' || factura.nombreEstado === 'Anulada' ? styles.statusInactive :
                          styles.statusPending
                        }>
                          {factura.nombreEstado}
                          {factura.numeroAutorizacion && <small> ✓</small>}
                        </span>
                      </td>
                      <td className={styles.actionsCol}>
                        <button 
                          className={styles.iconBtn}
                          onClick={() => previsualizarFacturaPDF(factura.idFactura)}
                          title="Previsualizar PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                            <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
                            <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6" />
                            <path d="M17 18h2" />
                            <path d="M20 15h-3v6" />
                            <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z" />
                          </svg>
                        </button>

                        <button 
                          className={styles.iconBtn}
                          onClick={() => descargarFacturaPDF(factura.idFactura)}
                          title="Descargar PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                            <path d="M7 11l5 5l5 -5" />
                            <path d="M12 4l0 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                {`Mostrando ${Math.min((paginaActual - 1) * facturasPorPagina + 1, facturasFiltradas.length)} a ${Math.min(paginaActual * facturasPorPagina, facturasFiltradas.length)} de ${facturasFiltradas.length} resultados`}
              </div>

              <div className={styles.pageControls}>
                <button 
                  className={styles.navBtn}
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                >
                  «
                </button>

                <button 
                  className={styles.navBtn}
                  onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                >
                  ‹
                </button>

                {(() => {
                  const pages = [];
                  const start = Math.max(1, paginaActual - 2);
                  const end = Math.min(totalPaginas, paginaActual + 2);

                  for (let p = start; p <= end; p++) {
                    pages.push(p);
                  }

                  if (start > 1) {
                    pages.unshift(1);
                    if (start > 2) pages.splice(1, 0, 'dots-start');
                  }

                  if (end < totalPaginas) {
                    if (end < totalPaginas - 1) pages.push('dots-end');
                    pages.push(totalPaginas);
                  }

                  return pages.map((p, i) => {
                    if (p === 'dots-start' || p === 'dots-end') {
                      return <span key={p + i} style={{ padding: '0 6px', color: '#94a3b8' }}>…</span>;
                    }

                    return (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${paginaActual === p ? styles.active : ''}`}
                        onClick={() => setPaginaActual(p)}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}

                <button 
                  className={styles.navBtn}
                  onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  ›
                </button>

                <button 
                  className={styles.navBtn}
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CrearFacturaModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSuccess={alCrearFactura}
      />

      <PDFPreviewModal
        isOpen={pdfPreviewOpen}
        onClose={cerrarPreview}
        pdfUrl={pdfUrl}
      />

      <ToastContainer position="bottom-right" />
    </div>
  );
}