// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig.js';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor de petición: agrega token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: maneja errores 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Token expirado o inválido → redirigiendo al login');
            localStorage.removeItem('userToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
