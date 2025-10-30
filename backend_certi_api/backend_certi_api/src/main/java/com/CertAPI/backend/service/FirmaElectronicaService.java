package com.CertAPI.backend.service;

import org.apache.xml.security.Init;
import org.apache.xml.security.signature.XMLSignature;
import org.apache.xml.security.transforms.Transforms;
import org.apache.xml.security.utils.Constants;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.security.KeyPair;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Servicio para firma electrónica de documentos XML según estándar XMLDSig
 * Implementa Xades-BES según requerimientos de la SAT Guatemala
 */
@Service
public class FirmaElectronicaService {
    
    static {
        Init.init();
    }
    
    private final KeyPair keyPair;
    
    public FirmaElectronicaService(KeyPair keyPair) {
        this.keyPair = keyPair;
    }
    
    /**
     * Firma un documento XML con XMLDSig
     */
    public String firmarXML(String xmlContent) throws Exception {
        // Parse XML
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xmlContent.getBytes("UTF-8")));
        
        // Crear firma XML
        XMLSignature signature = new XMLSignature(doc, "", 
            XMLSignature.ALGO_ID_SIGNATURE_RSA_SHA256);
        
        Element root = doc.getDocumentElement();
        root.appendChild(signature.getElement());
        
        // Agregar transformaciones
        Transforms transforms = new Transforms(doc);
        transforms.addTransform(Transforms.TRANSFORM_ENVELOPED_SIGNATURE);
        transforms.addTransform(Transforms.TRANSFORM_C14N_EXCL_OMIT_COMMENTS);
        
        // Agregar referencia al documento
        signature.addDocument("", transforms, Constants.ALGO_ID_DIGEST_SHA1);
        
        // Agregar información de la clave
        signature.addKeyInfo(keyPair.getPublic());
        
        // Firmar
        signature.sign(keyPair.getPrivate());
        
        // Convertir a String
        return documentToString(doc);
    }
    
    /**
     * Verifica la firma de un XML
     */
    public boolean verificarFirma(String xmlFirmado) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlFirmado.getBytes("UTF-8")));
            
            Element signatureElement = (Element) doc.getElementsByTagNameNS(
                Constants.SignatureSpecNS, "Signature").item(0);
            
            if (signatureElement == null) {
                return false;
            }
            
            XMLSignature signature = new XMLSignature(signatureElement, "");
            return signature.checkSignatureValue(keyPair.getPublic());
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Genera un hash SHA-256 del contenido
     */
    public String generarHash(String content) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(content.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(hash);
    }
    
    private String documentToString(Document doc) throws Exception {
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.getBuffer().toString();
    }
}
