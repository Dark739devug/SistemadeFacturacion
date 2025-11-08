// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import '../assets/styles/LoginPage.css'; 
import { login } from '../services/userService.js';
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpiar error al enviar

        try {
            // Creamos el objeto de credenciales correcto
            const credentials = { username, password };
            const response = await login(credentials); 
            
            console.log('Autenticación exitosa. Token guardado en localStorage.', response);
            
            // Redirigir al usuario al área protegida
            navigate('/dashboard'); 

        } catch (err) {
            setError('Credenciales inválidas. Por favor, verifica el usuario y la contraseña.');
            console.error(err); // Para depuración
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-card">
                <h2>Iniciar Sesión</h2>
                
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
