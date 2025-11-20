import React from 'react';
import styles from './pdf-preview-modal.module.css';

export default function PDFPreviewModal({ isOpen, onClose, pdfUrl }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Previsualización de Factura</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className={styles.iframe}
              title="Vista previa de factura"
            />
          ) : (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Cargando vista previa...</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cerrar
          </button>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              download 
              className={styles.btnPrimary}
              onClick={() => {
                // Descargar y cerrar después de un momento
                setTimeout(onClose, 500);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}