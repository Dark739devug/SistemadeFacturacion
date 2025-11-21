'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EditarUsuarioModal from './EditarUsuarioModal';
import EliminarUsuarioModal from './EliminarUsuarioModal';
import styles from './usuarios.module.css';
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
    if (parsed.token) return parsed.token;
    if (parsed.accessToken) return parsed.accessToken;
    return null;
  } catch {}
  return t;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioActualId, setUsuarioActualId] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    obtenerUsuarioActual();
  }, []);

  function obtenerUsuarioActual() {
    try {
      const stored = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!stored) return;

      // Intentar parsear si es JSON, si no, decodificar el JWT
      try {
        const parsed = JSON.parse(stored);
        if (parsed.idUsuario) {
          setUsuarioActualId(parsed.idUsuario);
          return;
        }
      } catch (jsonError) {
        // No es JSON, podría ser un JWT directo
      }

      // Intentar decodificar como JWT
      const token = normalizeToken(stored);
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          const idUsuario = decoded.idUsuario || decoded.userId || decoded.user_id || decoded.id || decoded.sub;
          if (idUsuario) {
            setUsuarioActualId(parseInt(idUsuario, 10));
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  }

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);
      
      const headers = { 
        'Accept': 'application/json'
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(ENDPOINTS.usuarios, { headers });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : data.items || []);
      toast.success('Usuarios cargados exitosamente');
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  function abrirModalEditar(usuario) {
    setUsuarioSeleccionado(usuario);
    setModalEditar(true);
  }

  function cerrarModalEditar() {
    setModalEditar(false);
    setUsuarioSeleccionado(null);
  }

  function abrirModalEliminar(usuario) {
    if (usuario.idUsuario === usuarioActualId || usuario.id === usuarioActualId) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    setUsuarioSeleccionado(usuario);
    setModalEliminar(true);
  }

  function cerrarModalEliminar() {
    setModalEliminar(false);
    setUsuarioSeleccionado(null);
  }

  function handleUsuarioActualizado() {
    cargarUsuarios();
    cerrarModalEditar();
  }

  function handleUsuarioEliminado() {
    cargarUsuarios();
    cerrarModalEliminar();
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Usuarios</h1>
          <p className={styles.subtitle}>Administra los usuarios del sistema</p>
        </div>
        <button className={styles.refreshBtn} onClick={cargarUsuarios}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
          <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg> Recargar
        </button>
      </div>

      <div className={styles.tableContainer}>
        {usuarios.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const esUsuarioActual = usuario.idUsuario === usuarioActualId || usuario.id === usuarioActualId;
                const rolNombre = usuario.nombreRol || 'Facturación';
                const correo = usuario.email || 'N/A';
                
                return (
                  <tr key={usuario.idUsuario || usuario.id}>
                    <td>{usuario.idUsuario || usuario.id}</td>
                    <td>
                      {usuario.nombre} {usuario.apellido || ''}
                      {esUsuarioActual && <span className={styles.badge}>Tú</span>}
                    </td>
                    <td>{correo}</td>
                    <td>
                      <span className={`${styles.rolBadge} ${styles[rolNombre.toLowerCase().replace('ó', 'o')]}`}>
                        {rolNombre}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${usuario.activo ? styles.activo : styles.inactivo}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      {usuario.fechaCreacion 
                        ? new Date(usuario.fechaCreacion).toLocaleDateString('es-GT')
                        : 'N/A'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.btnEditar}
                          onClick={() => abrirModalEditar(usuario)}
                          title="Editar usuario"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                          </svg>
                        </button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => abrirModalEliminar(usuario)}
                          disabled={esUsuarioActual}
                          title={esUsuarioActual ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 6h18" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M10 11v6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 11v6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 6l1-2h4l1 2" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalEditar && (
        <EditarUsuarioModal
          isOpen={modalEditar}
          onClose={cerrarModalEditar}
          usuario={usuarioSeleccionado}
          onSuccess={handleUsuarioActualizado}
        />
      )}

      {modalEliminar && (
        <EliminarUsuarioModal
          isOpen={modalEliminar}
          onClose={cerrarModalEliminar}
          usuario={usuarioSeleccionado}
          onSuccess={handleUsuarioEliminado}
        />
      )}
    </div>
  );
}