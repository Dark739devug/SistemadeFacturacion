'use client';

import React from 'react';
import styles from './direccion-modal.module.css';

export default function DireccionModal({ isOpen, onClose, cliente }) {
  if (!isOpen || !cliente) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Dirección Completa</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.clienteInfo}>
            <strong>{cliente.razonSocial}</strong>
            <span className={styles.nit}>NIT: {cliente.nit}</span>
          </div>

          <div className={styles.direccionCompleta}>
            <div className={styles.campo}>
              <label>Dirección:</label>
              <p>{cliente.direccion || 'No especificada'}</p>
            </div>

            <div className={styles.campo}>
              <label>Municipio:</label>
              <p>{cliente.municipio || 'No especificado'}</p>
            </div>

            <div className={styles.campo}>
              <label>Departamento:</label>
              <p>{cliente.departamento || 'No especificado'}</p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}