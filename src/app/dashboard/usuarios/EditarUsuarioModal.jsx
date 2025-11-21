'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './editar-usuario-modal.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  try {
    const parsed = JSON.parse(t);
    if (typeof parsed === 'string') return parsed;
    if (parsed.token) return parsed.token;
    if (parsed.accessToken) return parsed.accessToken;
    return null;
  } catch {}
  return t;
}

export default function EditarUsuarioModal({ isOpen, onClose, usuario, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    rol: 'FACTURACION',
    activo: true
  });

  const [loginData, setLoginData] = useState({});

  useEffect(() => {
    if (isOpen && usuario) {
      cargarDatosUsuario();
    }
  }, [isOpen, usuario]);

  async function cargarDatosUsuario() {
    setLoadingDatos(true);

    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);

      const usuarioId = usuario.idUsuario || usuario.id;

      const headers = { 'Accept': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/usuarios/${usuarioId}`, { headers });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      let rolParaSelect = 'FACTURACION';
      if (data.nombreRol?.toLowerCase().includes('admin')) rolParaSelect = 'ADMIN';
      if (data.nombreRol?.toLowerCase().includes('factura')) rolParaSelect = 'FACTURACION';

      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        correo: data.email || '',
        rol: rolParaSelect,
        activo: data.activo !== undefined ? data.activo : true
      });

      setLoginData(data.login || {});
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del usuario');
    } finally {
      setLoadingDatos(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function validarFormulario() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.correo)) {
      toast.error('Correo electrónico inválido');
      return false;
    }

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);

      const usuarioId = usuario.idUsuario || usuario.id;

      // Construir el payload de manera más simple y limpia
      const payload = {
        idUsuario: usuarioId,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.correo.trim(),
        activo: formData.activo,
        rol: {
          idRol: formData.rol === 'ADMIN' ? 1 : 2,
          nombreRol: formData.rol,
          descripcion: formData.rol === 'ADMIN' ? 'Rol de administrador' : 'Rol de facturación',
          activo: true
        }
      };

      // Solo incluir el objeto login si existe y tiene idLogin
      if (loginData && loginData.idLogin) {
        payload.login = {
          idLogin: loginData.idLogin,
          email: formData.correo.trim(),
          usuario: formData.correo.trim(),
          ultimoLogin: loginData.ultimoLogin,
          fechaCreacion: loginData.fechaCreacion,
          passwordHash: loginData.passwordHash
        };
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE}/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error al actualizar usuario';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success('Usuario actualizado correctamente');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      // El toast de error ya se maneja arriba
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editar Usuario</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={loading}>×</button>
        </div>

        {loadingDatos ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Información Personal</h3>

                <div className={styles.fieldGroup}>
                  <label>Nombre *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={loading} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={loading} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Correo *</label>
                  <input type="email" name="correo" value={formData.correo} onChange={handleChange} required disabled={loading} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Rol *</label>
                  <select name="rol" value={formData.rol} onChange={handleChange} disabled={loading}>
                    <option value="FACTURACION">Facturación</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} disabled={loading} />
                    <span>Usuario activo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}