// src/services/userService.js
import api from './api.js';

const LOGIN_URL = '/api/auth/login';
const USER_API_URL = '/api/users';

/**
 * Iniciar sesión
 * @param {object} credentials { username, password }
 */
export const login = async (credentials) => {
    try {
        const response = await api.post(LOGIN_URL, credentials);

        // Validar estructura de respuesta
        if (response?.data?.token) {
            localStorage.setItem('userToken', response.data.token);
            return response.data;
        } else {
            throw new Error('El servidor no devolvió un token.');
        }
    } catch (error) {
        // Log limpio para depuración
        if (error.response) {
            console.error('❌ Error en login:', error.response.data);
        } else {
            console.error('❌ Error al conectar con el servidor:', error.message);
        }
        throw error;
    }
};

/**
 * Obtener todos los usuarios (requiere token)
 */
export const getAllUsers = async () => {
    try {
        const response = await api.get(USER_API_URL);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.warn('⚠️ Token inválido o expirado. Cerrando sesión...');
            localStorage.removeItem('userToken');
            window.location.href = '/login';
        }
        console.error('Error al obtener usuarios:', error.response || error.message);
        throw error;
    }
};
