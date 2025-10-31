// src/services/userService.js

import api from './api.js';

// 🔹 Endpoints reales de tu backend Spring Boot
const LOGIN_URL = '/api/auth/login'; // ruta de login
const USER_API_URL = '/api/users';   // ruta protegida para usuarios

/**
 * Función para iniciar sesión
 * @param {object} credentials { username, password }
 */
export const login = async (credentials) => {
  try {
    const response = await api.post(LOGIN_URL, credentials);

    // Guardar token en localStorage con la misma clave que tu api.js usa
    if (response.data && response.data.token) {
      localStorage.setItem('userToken', response.data.token); // coincide con api.js
    }

    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error; // Propagar error a LoginPage.jsx
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
