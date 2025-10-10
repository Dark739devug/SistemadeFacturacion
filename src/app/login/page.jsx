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
    <div className={styles.inputContainer}> 
    
      <svg  xmlns="http://www.w3.org/2000/svg"  
      width="24"  
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"  
      stroke="currentColor" 
      className={styles.icon}
       stroke-width="1.75"  
       stroke-linecap="round"  
       stroke-linejoin="round"  
       class="icon icon-tabler icons-tabler-outline icon-tabler-user">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
         
    <input
      type="text"
      name="Usuario"
      placeholder="Usuario"
      // value={formData.Usuario}
      //onChange={handleChange}
      required
      className={styles.input}
    />
    </div>

    <div className={styles.inputContainer}>
      <svg  xmlns="http://www.w3.org/2000/svg" 
      className={styles.icon} 
      width="24"  
      height="24" 
      viewBox="0 0 24 24"  
      fill="none"  
      stroke="currentColor"  
      strokeWidth="2"  
      stroke-linecap="round"  
      stroke-linejoin="round"  
      class="icon icon-tabler icons-tabler-outline icon-tabler-lock-password">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
        <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
        <path d="M15 16h.01" />
        <path d="M12.01 16h.01" />
        <path d="M9.02 16h.01" />
    </svg>
    <input
      type="password"
      name="contrasena"
      placeholder="Contraseña"
     // value={formData.contrasena}
      //onChange={handleChange}
      required
      className={styles.input}
    />
    </div>

    <button className={styles.button}>Iniciar sesión</button>
      <div className={styles.linksContainer}>
    <a href="/recuperar1" className={styles.link}>¿Olvidaste tu contraseña?</a>
    <a href="/registro" className={styles.link}>¿Crear agencia Virtual?</a>
    <a href="/recuperar3" className={styles.link}>¿Olvidaste tu correo electrónico de Agencia Virtual?</a>
  </div>
  </form>
</div>

);
}