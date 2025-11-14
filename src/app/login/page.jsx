'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { ToastContainer, toast } from 'react-toastify';


export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
const handleChange = (e) => {
  setFormData({
      ...formData,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();
  
try {
  const response = await fetch('http://localhost:9090/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

  // leer cuerpo como texto y intentar extraer token si viene en JSON
  const raw = await response.text();

  let token = null;
 

  if (response.ok && raw) {
    try {
      const parsed = JSON.parse(raw);
     const token = parsed.token || parsed.accessToken || parsed.jwt || parsed.access_token || null;
     const nombre = parsed.nombre || parsed.name || '';
     const email = parsed.email || formData.email || '';
     const rol = parsed.rol || parsed.role || '';
     if (token) {
       localStorage.setItem('accessToken', token);
       localStorage.setItem('nombre', nombre);
       localStorage.setItem('email', email);
       localStorage.setItem('rol', rol);
       toast.success(`Bienvenido ${nombre}`, { position: 'top-center' });
       router.push('/dashboard');
       return;
     }
    } catch (e) {
      // no JSON
      token = raw.trim();
    }
  }

  else {
    // intentar mostrar mensaje de backend si lo hay
    let serverMsg = 'Credenciales incorrectas';
    try {
      const parsed = JSON.parse(raw || '{}');
      serverMsg = parsed.message || parsed.error || serverMsg;
    } catch (e) {}
    toast.error(serverMsg, { position: 'top-center' });
  }

}
catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(' Ocurrió un error. Intenta nuevamente.', { position: 'top-center' });
    }

};



return (
<div className={styles.loginContainer}>
  <div className={styles.logoContainer}>
    <img src="/factura.png" alt="Logo" className={styles.logo} />
  </div>

  <form  onSubmit={handleSubmit} className={styles.formContainer}>
    <h2 className={styles.title}>Iniciar Sesión</h2>
    <div className={styles.inputContainer}> 
    
      <svg  xmlns="http://www.w3.org/2000/svg" 
       width="24"  
       height="24"  
       viewBox="0 0 24 24" 
       fill="currentColor" 
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
        <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
        </svg>
         
    <input
      type="email"
      name="email"
      placeholder="Correo Electrónico"
      value={formData.email}
      onChange={handleChange}
      required
      className={styles.input}
    />
    </div>

    <div className={styles.inputContainer}>
        <svg  xmlns="http://www.w3.org/2000/svg"  
        width="24"  
        height="24"  
        viewBox="0 0 24 24"  
        fill="currentColor"  
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2a5 5 0 0 1 5 5v3a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3v-3a5 5 0 0 1 5 -5m0 12a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2m0 -10a3 3 0 0 0 -3 3v3h6v-3a3 3 0 0 0 -3 -3" /></svg>
        
    <input
    type={showPassword ? 'text' : 'password'}
    name="password"
    placeholder="Contraseña"
    value={formData.password}
    onChange={handleChange}
    required
    className={styles.input}
  />
        <button
        type="button"
        className={styles.eyeButton}
        onClick={() => setShowPassword(!showPassword)}
        aria-pressed={showPassword}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {showPassword ? (
          
          <svg  xmlns="http://www.w3.org/2000/svg"  
          width="28"  
          height="28"  
          viewBox="0 0 24 24"  
          fill="currentColor"  
      >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 4c4.29 0 7.863 2.429 10.665 7.154l.22 .379l.045 .1l.03 .083l.014 .055l.014 .082l.011 .1v.11l-.014 .111a.992 .992 0 0 1 -.026 .11l-.039 .108l-.036 .075l-.016 .03c-2.764 4.836 -6.3 7.38 -10.555 7.499l-.313 .004c-4.396 0 -8.037 -2.549 -10.868 -7.504a1 1 0 0 1 0 -.992c2.831 -4.955 6.472 -7.504 10.868 -7.504zm0 5a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" /></svg>
        ) : (
          
          <svg  xmlns="http://www.w3.org/2000/svg" 
           width="28"  
           height="28"
           viewBox="0 0 24 24"  
           fill="none"  
           stroke="currentColor"  
           strokeWidth="2"  
           strokeLinecap="round"  
           strokeLinejoin="round"  
           >
            <path stroke="none" 
            d="M0 0h24v24H0z" 
            fill="none"/>
            <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
            <path d="M3 15l2.5 -3.8" />
            <path d="M21 14.976l-2.492 -3.776" />
            <path d="M9 17l.5 -4" />
            <path d="M15 17l-.5 -4" />
            </svg>
        )}
      </button>
    </div>
     

    <button type="submit"className={styles.button}>Iniciar sesión</button>
      <div className={styles.linksContainer}>
    <a href="/recuperar1" className={styles.link}>¿Olvidaste tu contraseña?</a>
    <a href="/registro" className={styles.link}>¿Crear  cuenta?</a>
    <a href="/recuperar3" className={styles.link}>¿Olvidaste tu correo electrónico de Agencia Virtual?</a>
  </div>
  </form>
   <ToastContainer position="top-center" />
</div>

);}