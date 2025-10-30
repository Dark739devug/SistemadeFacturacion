package com.CertAPI.backend.service;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Servicio para generar XML de DTE según el esquema oficial de la SAT Guatemala
 * Basado en el esquema: https://github.com/fel-sat-gob-gt/cat
 */
@Service
public class XMLGeneratorService {
    
    private static final String NAMESPACE_URI = "http://www.sat.gob.gt/dte/fel/0.2.0";
    private static final String NAMESPACE_DS = "http://www.w3.org/2000/09/xmldsig#";
    
    /**
     * Genera un XML de DTE básico (Factura)
     */
    public String generarXMLFactura(String nitEmisor, String nombreEmisor, 
                                   String nitReceptor, String nombreReceptor,
                                   Double montoTotal, String moneda) throws Exception {
        
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();
        
        // Elemento raíz GTDocumento
        Element root = doc.createElementNS(NAMESPACE_URI, "gte:GTDocumento");
        root.setAttribute("xmlns:gte", NAMESPACE_URI);
        root.setAttribute("xmlns:ds", NAMESPACE_DS);
        root.setAttribute("Version", "0.1");
        doc.appendChild(root);
        
        // SAT
        Element sat = doc.createElement("gte:SAT");
        sat.setAttribute("ClaseDocumento", "dte");
        root.appendChild(sat);
        
        // DTE
        Element dte = doc.createElement("gte:DTE");
        dte.setAttribute("ID", "DatosCertificados");
        sat.appendChild(dte);
        
        // DatosEmision
        Element datosEmision = doc.createElement("gte:DatosEmision");
        datosEmision.setAttribute("ID", "DatosEmision");
        dte.appendChild(datosEmision);
        
        // DatosGenerales
        Element datosGenerales = doc.createElement("gte:DatosGenerales");
        datosGenerales.setAttribute("Tipo", "FACT");
        datosGenerales.setAttribute("FechaHoraEmision", 
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        datosGenerales.setAttribute("CodigoMoneda", moneda);
        datosEmision.appendChild(datosGenerales);
        
        // Emisor
        Element emisor = doc.createElement("gte:Emisor");
        emisor.setAttribute("NITEmisor", nitEmisor);
        emisor.setAttribute("NombreEmisor", nombreEmisor);
        emisor.setAttribute("CodigoEstablecimiento", "1");
        emisor.setAttribute("NombreComercial", nombreEmisor);
        emisor.setAttribute("AfiliacionIVA", "GEN");
        datosEmision.appendChild(emisor);
        
        // DireccionEmisor
        Element direccionEmisor = doc.createElement("gte:DireccionEmisor");
        Element direccion = doc.createElement("gte:Direccion");
        direccion.setTextContent("Ciudad de Guatemala");
        direccionEmisor.appendChild(direccion);
        Element codigoPostal = doc.createElement("gte:CodigoPostal");
        codigoPostal.setTextContent("01001");
        direccionEmisor.appendChild(codigoPostal);
        Element municipio = doc.createElement("gte:Municipio");
        municipio.setTextContent("Guatemala");
        direccionEmisor.appendChild(municipio);
        Element departamento = doc.createElement("gte:Departamento");
        departamento.setTextContent("Guatemala");
        direccionEmisor.appendChild(departamento);
        Element pais = doc.createElement("gte:Pais");
        pais.setTextContent("GT");
        direccionEmisor.appendChild(pais);
        emisor.appendChild(direccionEmisor);
        
        // Receptor
        Element receptor = doc.createElement("gte:Receptor");
        receptor.setAttribute("IDReceptor", nitReceptor);
        receptor.setAttribute("NombreReceptor", nombreReceptor);
        datosEmision.appendChild(receptor);
        
        // DireccionReceptor
        Element direccionReceptor = doc.createElement("gte:DireccionReceptor");
        Element direccionRec = doc.createElement("gte:Direccion");
        direccionRec.setTextContent("Ciudad de Guatemala");
        direccionReceptor.appendChild(direccionRec);
        Element codigoPostalRec = doc.createElement("gte:CodigoPostal");
        codigoPostalRec.setTextContent("01001");
        direccionReceptor.appendChild(codigoPostalRec);
        Element municipioRec = doc.createElement("gte:Municipio");
        municipioRec.setTextContent("Guatemala");
        direccionReceptor.appendChild(municipioRec);
        Element departamentoRec = doc.createElement("gte:Departamento");
        departamentoRec.setTextContent("Guatemala");
        direccionReceptor.appendChild(departamentoRec);
        Element paisRec = doc.createElement("gte:Pais");
        paisRec.setTextContent("GT");
        direccionReceptor.appendChild(paisRec);
        receptor.appendChild(direccionReceptor);
        
        // Items (ejemplo con un item)
        Element items = doc.createElement("gte:Items");
        datosEmision.appendChild(items);
        
        Element item = doc.createElement("gte:Item");
        item.setAttribute("NumeroLinea", "1");
        item.setAttribute("BienOServicio", "B");
        items.appendChild(item);
        
        Element cantidad = doc.createElement("gte:Cantidad");
        cantidad.setTextContent("1");
        item.appendChild(cantidad);
        
        Element unidadMedida = doc.createElement("gte:UnidadMedida");
        unidadMedida.setTextContent("UNI");
        item.appendChild(unidadMedida);
        
        Element descripcion = doc.createElement("gte:Descripcion");
        descripcion.setTextContent("Producto o Servicio");
        item.appendChild(descripcion);
        
        Element precioUnitario = doc.createElement("gte:PrecioUnitario");
        precioUnitario.setTextContent(String.format("%.2f", montoTotal));
        item.appendChild(precioUnitario);
        
        Element precio = doc.createElement("gte:Precio");
        precio.setTextContent(String.format("%.2f", montoTotal));
        item.appendChild(precio);
        
        Element descuento = doc.createElement("gte:Descuento");
        descuento.setTextContent("0.00");
        item.appendChild(descuento);
        
        Element impuestos = doc.createElement("gte:Impuestos");
        item.appendChild(impuestos);
        
        Element impuesto = doc.createElement("gte:Impuesto");
        impuestos.appendChild(impuesto);
        
        Element nombreCorto = doc.createElement("gte:NombreCorto");
        nombreCorto.setTextContent("IVA");
        impuesto.appendChild(nombreCorto);
        
        Element codigoUnidadGravable = doc.createElement("gte:CodigoUnidadGravable");
        codigoUnidadGravable.setTextContent("1");
        impuesto.appendChild(codigoUnidadGravable);
        
        Element montoGravable = doc.createElement("gte:MontoGravable");
        double base = montoTotal / 1.12;
        montoGravable.setTextContent(String.format("%.2f", base));
        impuesto.appendChild(montoGravable);
        
        Element montoImpuesto = doc.createElement("gte:MontoImpuesto");
        montoImpuesto.setTextContent(String.format("%.2f", montoTotal - base));
        impuesto.appendChild(montoImpuesto);
        
        Element total = doc.createElement("gte:Total");
        total.setTextContent(String.format("%.2f", montoTotal));
        item.appendChild(total);
        
        // Totales
        Element totales = doc.createElement("gte:Totales");
        datosEmision.appendChild(totales);
        
        Element totalImpuestos = doc.createElement("gte:TotalImpuestos");
        totales.appendChild(totalImpuestos);
        
        Element totalImpuesto = doc.createElement("gte:TotalImpuesto");
        totalImpuesto.setAttribute("NombreCorto", "IVA");
        totalImpuesto.setAttribute("TotalMontoImpuesto", String.format("%.2f", montoTotal - base));
        totalImpuestos.appendChild(totalImpuesto);
        
        Element granTotal = doc.createElement("gte:GranTotal");
        granTotal.setTextContent(String.format("%.2f", montoTotal));
        totales.appendChild(granTotal);
        
        // Convertir a String
        return documentToString(doc);
    }
    
    /**
     * Genera XML de anulación de DTE
     */
    public String generarXMLAnulacion(String nitEmisor, String numeroAutorizacion, 
                                     LocalDateTime fechaEmision, String motivo) throws Exception {
        
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();
        
        Element root = doc.createElementNS(NAMESPACE_URI, "gte:GTAnulacionDocumento");
        root.setAttribute("xmlns:gte", NAMESPACE_URI);
        root.setAttribute("Version", "0.1");
        doc.appendChild(root);
        
        Element sat = doc.createElement("gte:SAT");
        root.appendChild(sat);
        
        Element anulacionDTE = doc.createElement("gte:AnulacionDTE");
        anulacionDTE.setAttribute("ID", "DatosAnulacion");
        sat.appendChild(anulacionDTE);
        
        Element datosGenerales = doc.createElement("gte:DatosGenerales");
        datosGenerales.setAttribute("ID", "DatosAnulacion");
        datosGenerales.setAttribute("NumeroDocumentoAAnular", numeroAutorizacion);
        datosGenerales.setAttribute("NITEmisor", nitEmisor);
        datosGenerales.setAttribute("FechaEmisionDocumentoAnular", 
            fechaEmision.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        datosGenerales.setAttribute("FechaHoraAnulacion", 
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        datosGenerales.setAttribute("MotivoAnulacion", motivo);
        anulacionDTE.appendChild(datosGenerales);
        
        return documentToString(doc);
    }
    
    private String documentToString(Document doc) throws Exception {
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.getBuffer().toString();
    }
}
