'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
//import {toast} from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const [showPassword, setShowPassword] = useState(false);

return (
<div className={styles.loginContainer}>
  <div className={styles.logoContainer}>
    <img src="/factura.png" alt="Logo" className={styles.logo} />
  </div>

  <form  className={styles.formContainer}>
    <div className={styles.formHeader}>
      <h2 className={styles.formTitle}>Accede a tu FacturaGuate</h2>
      <p className={styles.formSubtitle}>Ingresa con tu usuario y contraseña</p>
    </div>

    <div className={styles.inputGroup}>
      <div className={styles.inputIcon} aria-hidden>
        {/* user icon */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className={styles.inputWrap}>
        <input
          type="text"
          name="correo"
          placeholder="Correo electrónico"
          required
          className={styles.input}
          aria-label="correo electronico"
        />
      </div>
    </div>

    <div className={styles.inputGroup}>
      <div className={styles.inputIcon} aria-hidden>
        {/* lock icon */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className={styles.inputWrap}>
        <input
          type={showPassword ? 'text' : 'password'}
          name="contrasena"
          placeholder="Contraseña"
          required
          className={styles.input}
          aria-label="contraseña"
        />
        <button type="button" className={styles.eyeButton} onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {showPassword ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.58 10.59A3 3 0 0113.41 13.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
      </div>
    </div>

    <div className={styles.actions}>
      <button type="submit" className={styles.button}>INICIAR SESIÓN</button>
    </div>
    <div className={styles.linksContainer}>
    <a href="/recuperar1" className={styles.link}>¿Olvidaste tu contraseña?</a>
    <a href="/registro" className={styles.link}>¿No tienes una cuenta? Regístrate</a>
    <a href="/recuperar3" className={styles.link}>¿Olvidaste tu correo electrónico?</a>
  </div>
  </form>
</div>

);
}



  