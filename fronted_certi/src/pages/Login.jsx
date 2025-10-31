// src/pages/LoginPage.jsx

import React, { useState } from 'react';
// Importamos el estilo CSS
import '../assets/styles/LoginPage.css'; 
// Importamos el servicio de autenticación
import { login } from '../services/userService.js';
// ⬇️ Descomentar e importar useNavigate para la redirección
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    // ⬇️ Inicializar el hook de navegación
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpiar error al enviar

        try {
            // Llama a tu función de servicio que se conecta a Spring Boot
            const response = await login(username, password); 
            
            console.log('Autenticación exitosa. Token guardado en localStorage.', response);
            
            // ⬇️ Redirigir al usuario al área protegida
            navigate('/dashboard'); 
            // Eliminamos el 'alert' simulado, ya que la redirección lo reemplaza.

        } catch (err) {
            // Maneja la respuesta de error de tu API de Spring Boot
            // El backend típicamente retorna un código de estado 401 (Unauthorized)
            setError('Credenciales inválidas. Por favor, verifica el usuario y la contraseña.');
            // console.error(err); // Opcional: ver el error completo en consola
        }
    };

    return (
        // Contenedor principal con el estilo del fondo
        <div className="login-page-container">
            <div className="login-form-card">
                <h2>Iniciar Sesión</h2>
                
                {/* Muestra el mensaje de error si existe */}
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;