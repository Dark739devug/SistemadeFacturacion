'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './cliente.module.css';
// 🟢 IMPORTANTE: Importamos las rutas centralizadas
// Ajusta la ruta relativa si tu estructura de carpetas es diferente
import ENDPOINTS from '../../services/api'; 

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);

  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }

  try {
    const parsed = JSON.parse(t);
    if (typeof parsed === 'string') return parsed;
    if (parsed.accessToken) return parsed.accessToken;
    if (parsed.token) return parsed.token;
    if (parsed.jwt) return parsed.jwt;
    if (parsed.access_token) return parsed.access_token;
    return null;
  } catch {
    
  }
  return t;
}

export default function ClienteModal({ isOpen, onClose, cliente = null, onSuccess }) {
  const [formData, setFormData] = useState({
    nit: '',
    razonSocial: '',
    direccion: '',
    municipio: '',
    departamento: '',
    telefono: '',
    email: '',
    activo: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!cliente;

  useEffect(() => {
    if (cliente) {
      setFormData({
        nit: cliente.nit || '',
        razonSocial: cliente.razonSocial || '',
        direccion: cliente.direccion || '',
        municipio: cliente.municipio || '',
        departamento: cliente.departamento || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        activo: cliente.activo ?? true
      });
    } else {
      // Reset form cuando se abre para nuevo cliente
      setFormData({
        nit: '',
        razonSocial: '',
        direccion: '',
        municipio: '',
        departamento: '',
        telefono: '',
        email: '',
        activo: true
      });
    }
    setError(null);
  }, [cliente, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (!formData.nit || !formData.razonSocial) {
      setError('NIT y Razón Social son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const rawToken = localStorage.getItem('accessToken') || 
                       localStorage.getItem('token') || 
                       sessionStorage.getItem('accessToken') || 
                       sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 🟢 USO DE ENDPOINTS CENTRALIZADOS
      const url = isEditing 
        ? ENDPOINTS.clientePorId(cliente.idCliente) // PUT: Usar función para ID
        : ENDPOINTS.clientes;                       // POST: Usar ruta base

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          return;
        }
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const savedCliente = await res.json();
      toast.success(isEditing ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
      
      if (onSuccess) {
        onSuccess(savedCliente);
      }
      
      onClose();
    } catch (err) {
      console.error('Error guardando cliente:', err);
      setError(err.message || 'Error al guardar el cliente');
      toast.error('Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h1>
            <p className={styles.subtitle}>
              {isEditing ? 'Modifique los datos del cliente' : 'Ingrese los datos del cliente'}
            </p>
          </div>
          
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
              width="24" height="24" viewBox="0 0 24 24">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10m3.6 5.2a1 1 0 0 0 -1.4 .2l-2.2 2.933l-2.2 -2.933a1 1 0 1 0 -1.6 1.2l2.55 3.4l-2.55 3.4a1 1 0 1 0 1.6 1.2l2.2 -2.933l2.2 2.933a1 1 0 0 0 1.6 -1.2l-2.55 -3.4l2.55 -3.4a1 1 0 0 0 -.2 -1.4" />
            </svg>
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formContainer}>
            <div className={styles.fieldGroup}>
              <label>NIT *</label>
              <input 
                type="text" 
                name="nit"
                placeholder="Ejemplo: 1234567-8" 
                value={formData.nit}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Razón Social *</label>
              <input 
                type="text" 
                name="razonSocial"
                placeholder="Ejemplo: Comercial Los Andes, S.A." 
                value={formData.razonSocial}
                onChange={handleChange}
                required
                disabled={loading}
              />         
            </div>

            <div className={styles.fieldGroup}>
              <label>Dirección</label>
              <input 
                type="text" 
                name="direccion"
                placeholder="Ejemplo: 4ta Calle 5-25 Zona 1" 
                value={formData.direccion}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Municipio</label>
              <input 
                type="text" 
                name="municipio"
                placeholder="Ejemplo: La Esperanza" 
                value={formData.municipio}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Departamento</label>
              <input 
                type="text" 
                name="departamento"
                placeholder="Ejemplo: Quetzaltenango" 
                value={formData.departamento}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Teléfono</label>
              <input 
                type="text" 
                name="telefono"
                placeholder="Ejemplo: 50281685" 
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                name="email"
                placeholder="Ejemplo: contacto@ejemplo.com" 
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button 
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading 
                ? 'Guardando...' 
                : isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}