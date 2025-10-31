// src/App.jsx

import React from 'react';
// Importamos las herramientas de ruteo
import { Routes, Route, Link } from 'react-router-dom'; 

// Importamos las páginas
import LoginPage from './pages/Login.jsx';
// Creamos una página de ejemplo para la ruta protegida
import DashboardPage from './pages/DashboardPage.jsx'; 

// Importamos el componente de protección
import ProtectedRoute from './components/ProtectedRoute.js'; 

function App() {
  return (
    <>
      <header style={{ padding: '12px 16px', backgroundColor: '#222', color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>Certificador de Facturación Electrónica — Frontend</h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
          Frontend React para la API certificadora. Autentícate en <strong>/login</strong>. El token JWT se guarda en localStorage y se usa en Authorization: Bearer &lt;TOKEN&gt;.
        </p>
      </header>

      <nav style={{ padding: '10px', backgroundColor: '#333' }}>
        <Link to="/" style={{ color: 'white', marginRight: '15px' }}>Inicio</Link>
        <Link to="/login" style={{ color: 'white' }}>Login</Link>
      </nav>
      
      {/* Definición de todas las rutas de la aplicación */}
      <Routes>
        
        {/* Ruta para el Login: es accesible sin estar logueado */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* ⬇️ Ruta Protegida: Usamos ProtectedRoute como envoltorio ⬇️ */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de Inicio por defecto */}
        <Route path="/" element={<h1>Bienvenido! Por favor, inicia sesión.</h1>} />
      </Routes>
    </>
  );
}

export default App;