"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './registro.module.css';

export default function CrearAgencia() {
  const router = useRouter();
  const [form, setForm] = useState({
    nit: '',
    nombre: '',
    apellido: '',
    fecha_de_nacimiento: '',
    dpi: '',
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function validate() {
    // Only validate the fields present on this form
    if (!String(form.nit || '').trim()) return 'El NIT es obligatorio.';
    if (!String(form.nombre || '').trim()) return 'El nombre es obligatorio.';
    if (!String(form.apellido || '').trim()) return 'El apellido es obligatorio.';
    if (!String(form.fecha_de_nacimiento || '').trim()) return 'La fecha de nacimiento es obligatoria.';
    if (!String(form.dpi || '').trim()) return 'El DPI es obligatorio.';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    // Si todo está bien, avanzamos al siguiente paso (credenciales)
    router.push('/recuperar2/credenciales');
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear Agencia Virtual</h1>
        <p className={styles.subtitle}>Completa los datos para crear tu Agencia Virtual</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          
          <div className={styles.row}>
            <label className={styles.label}>
              <span className={styles.labelText}>NIT</span>
              <input name="nit" value={form.nit} onChange={handleChange} className={styles.input} required />
            </label>
            </div>

          <div className={styles.row}>
            <label className={styles.label}>
              <span className={styles.labelText}>Nombre</span>
              <input name="nombre" value={form.nombre} onChange={handleChange} className={styles.input} required />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Apellido</span>
              <input name="apellido" value={form.apellido} onChange={handleChange} className={styles.input} required />
            </label>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>Fecha de Nacimiento</span>
            <input name="fecha_de_nacimiento" type="date" value={form.fecha_de_nacimiento} onChange={handleChange} className={styles.input} required />
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>DPI</span>
            <input name="dpi" value={form.dpi} onChange={handleChange} className={styles.input} required />
          </label>

          {error && <div className={styles.error}>{error}</div>}

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
      </div>
    </div>
  );
}