package com.CertAPI.backend.service;

import com.CertAPI.backend.model.DTE;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Servicio para generar PDF de visualización de DTEs
 * El PDF es solo para visualización, el documento oficial es el XML
 */
@Service
public class PDFGeneratorService {
    
    private static final DateTimeFormatter FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    
    /**
     * Genera un PDF de una factura certificada
     */
    public byte[] generarPDFFactura(DTE dte) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);
        
        // Título
        Paragraph title = new Paragraph("FACTURA ELECTRÓNICA")
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER);
        document.add(title);
        
        // Número de autorización
        if (dte.getNumeroAutorizacion() != null) {
            Paragraph autorizacion = new Paragraph("Autorización SAT: " + dte.getNumeroAutorizacion())
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
            document.add(autorizacion);
        }
        
        document.add(new Paragraph("\n"));
        
        // Datos del emisor
        document.add(new Paragraph("DATOS DEL EMISOR").setBold());
        Table emisorTable = new Table(2);
        emisorTable.addCell("NIT:");
        emisorTable.addCell(dte.getNitEmisor());
        emisorTable.addCell("Nombre:");
        emisorTable.addCell(dte.getNombreEmisor());
        document.add(emisorTable);
        
        document.add(new Paragraph("\n"));
        
        // Datos del receptor
        document.add(new Paragraph("DATOS DEL RECEPTOR").setBold());
        Table receptorTable = new Table(2);
        receptorTable.addCell("NIT:");
        receptorTable.addCell(dte.getNitReceptor() != null ? dte.getNitReceptor() : "CF");
        receptorTable.addCell("Nombre:");
        receptorTable.addCell(dte.getNombreReceptor() != null ? dte.getNombreReceptor() : "Consumidor Final");
        document.add(receptorTable);
        
        document.add(new Paragraph("\n"));
        
        // Datos de la factura
        document.add(new Paragraph("DATOS DE LA FACTURA").setBold());
        Table facturaTable = new Table(2);
        facturaTable.addCell("Fecha de Emisión:");
        facturaTable.addCell(dte.getFechaEmision().format(FORMATTER));
        facturaTable.addCell("Tipo de Documento:");
        facturaTable.addCell(dte.getTipoDocumento());
        facturaTable.addCell("Moneda:");
        facturaTable.addCell(dte.getMoneda());
        facturaTable.addCell("Total:");
        facturaTable.addCell(String.format("%.2f", dte.getMontoTotal()));
        document.add(facturaTable);
        
        document.add(new Paragraph("\n"));
        
        // Estado
        document.add(new Paragraph("Estado: " + dte.getEstado().toString()).setBold());
        
        if (dte.getFechaCertificacion() != null) {
            document.add(new Paragraph("Fecha de Certificación: " + 
                dte.getFechaCertificacion().format(FORMATTER)));
        }
        
        // UUID
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("UUID: " + dte.getUuid())
            .setFontSize(8));
        
        // Nota legal
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("Este documento es una representación impresa de la Factura Electrónica. " +
            "El documento tributario oficial es el archivo XML certificado por la SAT.")
            .setFontSize(8)
            .setItalic()
            .setTextAlignment(TextAlignment.CENTER));
        
        document.close();
        return baos.toByteArray();
    }
}
