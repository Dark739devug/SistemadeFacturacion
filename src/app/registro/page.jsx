"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './registro.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ENDPOINTS from '../services/api';

export default function CrearAgencia() {  
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const fieldLabels = {
    nombre: 'Nombre',
    apellido: 'Apellido',
    email: 'Correo Electrónico',
    contrasena: 'Contraseña'
  };
  const [success, setSuccess] = useState(false);

  function validateField(name, value) {
    const v = String(value || '').trim();
    if (name === 'nombre' || name === 'apellido') {
      if (!v) return 'Campo obligatorio.';
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v)) return 'Solo letras y espacios.';
      return '';
    }
    if (name === 'email') {
      if (!v) return 'Campo obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingrese un correo válido.';
      return '';
    }
    if (name === 'contrasena') {
      if (!v) return 'Campo obligatorio.';
      if (v.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
      return '';
    }
    return '';
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: newValue }));
    const fieldError = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  }

  function validate() {
    const validation = {};
    ['nombre','apellido','email','contrasena'].forEach(k => {
      const err = validateField(k, form[k]);
      if (err) validation[k] = err;
    });
    return validation;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    const hasErrors = Object.keys(validation).length > 0;
    if (hasErrors) {
      setErrors(validation);
      // encontrar el primer campo con error en el orden deseado
      const order = ['nombre','apellido','email','contrasena'];
      const firstKey = order.find(k => validation[k]);
      const firstMsg = firstKey ? `${fieldLabels[firstKey]}: ${validation[firstKey]}` : 'Hay errores en el formulario.';
      toast.error(firstMsg);
      // intentar enfocar el campo
      try {
        const el = document.getElementsByName(firstKey)[0];
        if (el && typeof el.focus === 'function') el.focus();
      } catch (e) {}
      return;
    }
    setError('');

    try {
      const response = await fetch(ENDPOINTS.registro, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          contrasena: form.contrasena,
          idRol: 2
        })
      });

      if (!response.ok) {
        // Intenta leer el mensaje de error del backend si está disponible y loguearlo
        let errorMsg = 'Error al registrar usuario';
        let text = '';
        try {
          text = await response.text();
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            // no-json response, use raw text
            if (text) errorMsg = text;
          }
        } catch (e) {
          // ignore
        }
        console.error('Registro fallido:', response.status, response.statusText, text);
        setError(errorMsg);
        return;
      }

      // Si el registro es exitoso, mostrar mensaje y luego redirigir al login
      setSuccess(true);
      // esperar 2.5s para mostrar el mensaje y luego redirigir
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error al conectar con el servidor: ' + (err?.message || String(err)));
    }
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear Usuario</h1>
        <p className={styles.subtitle}>Completa los datos para crear un Usuario</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <label className={styles.label}>
              <span className={styles.labelText}>Nombre</span>
              <input name="nombre" value={form.nombre || ''} onChange={handleChange} className={`${styles.input} ${errors.nombre ? styles.invalid : ''}`} required />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Apellido</span>
              <input name="apellido" value={form.apellido || ''} onChange={handleChange} className={`${styles.input} ${errors.apellido ? styles.invalid : ''}`} required />
            </label>
          </div>

          <div className={styles.row}>
            <label className={`${styles.label} ${styles.col}`}>
              <span className={styles.labelText}>Correo Electrónico</span>
              <div className={styles.fieldWithIcon}>
                <span className={styles.fieldIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5l9 6 9-6" stroke="#0f1724" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="#0f1724" strokeWidth="1.2"/></svg>
                </span>
                <input name="email" type="email" value={form.email || ''} onChange={handleChange} className={`${styles.input} ${styles.withLeftIcon} ${errors.email ? styles.invalid : ''}`} required />
              </div>
            </label>

            <label className={`${styles.label} ${styles.col}`}>
              <span className={styles.labelText}>Contraseña</span>
              <div className={styles.passwordFieldWrap}>
                <input name="contrasena" type={showPassword ? 'text' : 'password'} value={form.contrasena || ''} onChange={handleChange} className={`${styles.input} ${styles.passwordInput} ${errors.contrasena ? styles.invalid : ''}`} required />
                <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.58 10.59A3 3 0 0113.41 13.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.backButton} onClick={() => router.push('/login')}>
              <span style={{display:'inline-block', marginRight:8, verticalAlign:'middle'}} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="#0f1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Regresar
            </button>
            <button type="submit" className={styles.button}>
              <span style={{display:'inline-block', marginRight:8, verticalAlign:'middle'}} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Crear Usuario
            </button>
          </div>
        </form>
        <ToastContainer position="bottom-center" />
        {success && (
          <div className={styles.successOverlay} role="status" aria-live="polite">
            <div className={styles.successBox}>
              <div className={styles.successIcon} aria-hidden>
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.2" fill="#ecfdf5"/><path d="M7 13l3 3 7-7" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className={styles.successText}>
                <strong>Solicitud creada correctamente</strong>
                <div>Gracias por utilizar el sistemas de Factura Guate .</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}