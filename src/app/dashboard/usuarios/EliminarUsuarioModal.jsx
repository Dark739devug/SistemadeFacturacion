'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './eliminar-usuario-modal.module.css';
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

export default function EliminarUsuarioModal({ isOpen, onClose, usuario, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  async function handleEliminar() {
    if (confirmText.toUpperCase() !== 'ELIMINAR') {
      toast.error('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);

    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);

      if (!token) {
        toast.error('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      const usuarioId = usuario.idUsuario || usuario.id;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      const response = await fetch(ENDPOINTS.usuarioPorId(usuarioId), {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        let errorMessage = 'Error desconocido';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          } else {
            errorMessage = await response.text();
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }

        if (response.status === 401) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          throw new Error('Sesión expirada');
        }

        if (response.status === 403) {
          toast.error('No tienes permisos para eliminar este usuario');
          throw new Error('Sin permisos');
        }

        toast.error(`Error al eliminar usuario: ${errorMessage.substring(0, 100)}`);
        throw new Error(errorMessage);
      }

      toast.success('Usuario eliminado exitosamente');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      if (!err.message.includes('Sesión expirada') && !err.message.includes('Sin permisos')) {
        toast.error('Error al eliminar el usuario');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const nombreUsuario = usuario?.nombre || usuario?.nombreUsuario || 'este usuario';
  const correoUsuario = usuario?.correo || usuario?.email || '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWarning}>⚠️</div>
          <h2 className={styles.title}>Confirmar Eliminación</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.warningText}>
            ¿Estás seguro de que deseas eliminar este usuario?
          </p>

          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <strong>Nombre:</strong>
              <span>{nombreUsuario}</span>
            </div>
            {correoUsuario && (
              <div className={styles.infoRow}>
                <strong>Correo:</strong>
                <span>{correoUsuario}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <strong>ID:</strong>
              <span>{usuario?.idUsuario || usuario?.id}</span>
            </div>
          </div>

          <div className={styles.dangerZone}>
            <p className={styles.dangerText}>
              ⚠️ <strong>Esta acción no se puede deshacer.</strong>
            </p>
            <ul className={styles.consequencesList}>
              <li>Se eliminará toda la información del usuario</li>
              <li>El usuario perderá acceso al sistema inmediatamente</li>
              <li>Los registros asociados podrían verse afectados</li>
            </ul>
          </div>

          <div className={styles.confirmSection}>
            <label className={styles.confirmLabel}>
              Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
            </label>
            <input
              type="text"
              className={styles.confirmInput}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe ELIMINAR"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleEliminar}
            disabled={loading || confirmText.toUpperCase() !== 'ELIMINAR'}
          >
            {loading ? 'Eliminando...' : 'Eliminar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}