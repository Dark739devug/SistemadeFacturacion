'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './login.module.css';
import apiCerti from '../services/API_Certi_API'; // Tu instancia de Axios

/**
 * Componente Modal para solicitar las credenciales de la API 2 (Certificador).
 */
export default function CertiLoginModal({ isOpen, onClose, onSuccess, initialEmail = '' }) {
    const [formData, setFormData] = useState({
        username: '', 
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 

    // LÓGICA DE RESETEO: Resetea los campos a vacío al abrir el modal.
    useEffect(() => {
        if (isOpen) {
             // Forzamos el reseteo a campos vacíos.
             setFormData({ 
                 username: '', 
                 password: '' 
             });
             setShowPassword(false); 
        }
    }, [isOpen]); 


    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCertiLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const payload = {
            username: formData.username, // <--- CLAVE DE ACCESO DE LA API 2
            password: formData.password
        };

        // 💡 PUNTO DE DEPURACIÓN: Muestra el objeto exacto que se envía al backend.
        console.log("PAYLOAD ENVIADO A API 2 (Certificador):", payload);

        try {
            // 🎯 LLAMADA A LA API 2 USANDO 'username' COMO CLAVE
            const response = await apiCerti.post('/auth/login', payload);

            const parsed = response.data;
            const token = parsed.token || parsed.accessToken || parsed.jwt || parsed.access_token;
            
            if (!token) {
                throw new Error("Respuesta exitosa, pero no se recibió el token de certificación.");
            }

            localStorage.setItem('certiToken', token);
            localStorage.setItem('certiUserEmail', formData.username); 

            toast.success("Credenciales de certificación guardadas exitosamente.", { position: 'top-center' });
            onSuccess(token);
        } catch (error) {
            // 🛑 MANEJO DE ERROR 401
            const responseData = error.response?.data || {};
            let errorMsg = 'Credenciales de Certificación incorrectas. Por favor, verifica el usuario y la contraseña.';
            
            if (responseData.message || responseData.error) {
                 errorMsg = responseData.message || responseData.error;
            } else if (error.message.includes('401')) {
                 errorMsg = 'Error 401: Credenciales inválidas. Revisa el usuario y la contraseña.';
            }

            toast.error(errorMsg, { position: 'top-center' });
            console.error('Error en Login de Certificación:', error.response || error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Botón de cerrar deshabilitado durante la carga */}
                <button className={styles.modalCloseButton} onClick={onClose} disabled={loading}>
                    &times;
                </button>
                <div className={styles.header}>
                    <h2 className={styles.formTitle} style={{ color: 'var(--accent)' }}>Acceso Certificador</h2>
                    <p className={styles.formSubtitle}>
                        Ingresa el **usuario y contraseña** para obtener el token de certificación.
                    </p>
                </div>

                <form onSubmit={handleCertiLogin} className={styles.formContainer} style={{ padding: '2rem 1.5rem', boxShadow: 'none' }}>
                    
                    {/* CAMPO DE USUARIO (tipo text, name='username') */}
                    <div className={styles.inputContainer}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                            <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
                        </svg>
                        <input
                            type="text" 
                            name="username" // Name para el handleChange
                            placeholder="Usuario Certificador"
                            value={formData.username}
                            onChange={handleChange} 
                            required
                            disabled={loading}
                            className={styles.input}
                        />
                    </div>

                    {/* CAMPO DE CONTRASEÑA (Con icono de ojo) */}
                    <div className={styles.inputContainer}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 2a5 5 0 0 1 5 5v3a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3v-3a5 5 0 0 1 5 -5m0 12a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2m0 -10a3 3 0 0 0 -3 3v3h6v-3a3 3 0 0 0 -3 -3" />
                        </svg>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Contraseña Certificador"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={styles.input}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-pressed={showPassword}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            disabled={loading}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg"  
                                    width="28"  
                                    height="28"  
                                    viewBox="0 0 24 24"  
                                    fill="currentColor"  
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 4c4.29 0 7.863 2.429 10.665 7.154l.22 .379l.045 .1l.03 .083l.014 .055l.014 .082l.011 .1v.11l-.014 .111a.992 .992 0 0 1 -.026 .11l-.039 .108l-.036 .075l-.016 .03c-2.764 4.836 -6.3 7.38 -10.555 7.499l-.313 .004c-4.396 0 -8.037 -2.549 -10.868 -7.504a1 1 0 0 1 0 -.992c2.831 -4.955 6.472 -7.504 10.868 -7.504zm0 5a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg"  
                                    width="28"  
                                    height="28"
                                    viewBox="0 0 24 24"  
                                    fill="none"  
                                    stroke="currentColor"  
                                    strokeWidth="2"  
                                    strokeLinecap="round"  
                                    strokeLinejoin="round"  
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4" />
                                    <path d="M3 15l2.5 -3.8" />
                                    <path d="M21 14.976l-2.492 -3.776" />
                                    <path d="M9 17l.5 -4" />
                                    <path d="M15 17l-.5 -4" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Obteniendo Token...' : 'Obtener Token de Certificación'}
                    </button>
                    
                    <button 
                        type="button" 
                        className={`${styles.link} ${styles.centerLinks}`} 
                        onClick={onClose}
                        disabled={loading}
                        style={{ marginTop: '0.5rem', color: 'var(--muted)' }}
                    >
                        Saltar por ahora (Continuar sin token de certificación)
                    </button>
                </form>
            </div>
        </div>
    );
}