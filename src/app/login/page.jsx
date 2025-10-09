'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
//import {toast} from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    NIT: '',
    contraseña: ''
  
});


return (
<div className={styles.loginContainer}>
  <div className={styles.logoContainer}>
    <img src="/factura.png" alt="Logo" className={styles.logo} />
  </div>

  <form  className={styles.formContainer}>
    <h2 className={styles.title}>Iniciar Sesión</h2>
    <input
      type="text"
      name="Usuario"
      placeholder="Usuario"
      // value={formData.Usuario}
      //onChange={handleChange}
      required
      className={styles.input}
    />
    <input
      type="password"
      name="contrasena"
      placeholder="Contraseña"
     // value={formData.contrasena}
      //onChange={handleChange}
      required
      className={styles.input}
    />

    <button >Iniciar sesión</button>
      <div className={styles.linksContainer}>
    <a href="/recuperar1" className={styles.link}>¿Olvidaste tu contraseña?</a>
    <a href="/recuperar2" className={styles.link}>¿Crear agencia Virtual?</a>
    <a href="/recuperar3" className={styles.link}>¿Olvidaste tu correo electrónico de Agencia Virtual?</a>
  </div>
  </form>
</div>

);
}