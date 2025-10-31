// src/services/api.js

import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig.js';

// 1. Crear una instancia de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Peticiones: Añade el token JWT
api.interceptors.request.use(
    (config) => {
        // Obtiene el token del almacenamiento local
        const token = localStorage.getItem('userToken');

        // Si existe un token, lo adjunta a la cabecera de Autorización
        if (token) {
            // El formato estándar es "Bearer [TOKEN_JWT]"
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;