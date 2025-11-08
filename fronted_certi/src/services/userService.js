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

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token);
        }

        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
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
        console.error('Error al obtener usuarios. ¿Token válido?', error.response);
        throw error;
    }
};
