// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente verifica si el usuario está autenticado.
const ProtectedRoute = ({ children }) => {
  // Usar localStorage directamente para evitar dependencia rota
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    // Evitar JSX en archivos .js: usar createElement para la redirección
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  return children;
};

export default ProtectedRoute;