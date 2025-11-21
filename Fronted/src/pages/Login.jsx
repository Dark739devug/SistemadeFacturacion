"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Lock, User } from "lucide-react"
import "./Login.css"

const CustomLogo = () => (
  <svg 
    width="90" 
    height="90" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '2rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    
    <path 
      d="M50 10L85 30V70L50 90L15 70V30L50 10Z" 
      stroke="url(#logoGradient)" 
      strokeWidth="1.5" 
      fill="rgba(255, 255, 255, 0.03)"
    />
    
    <path 
      d="M35 35H65M35 50H55" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeOpacity="0.8" 
    />
    
    <circle cx="68" cy="68" r="14" fill="#3b82f6" fillOpacity="0.9" stroke="white" strokeWidth="2" />
    <path 
      d="M62 68L66 72L74 62" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
)

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(loginData.username, loginData.password)

    if (result.success) {
      navigate("/")
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-hero">
          
          <CustomLogo />
          
          <h1>Sistema Certificadora FEL</h1>
          <p>Certificación de Facturas Electrónicas para Guatemala</p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <h3>Certificación Rápida</h3>
                <p>Certifica tus facturas en segundos</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <h3>100% Seguro</h3>
                <p>Cumplimiento con normativas SAT</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <h3>Gestión Completa</h3>
                <p>Administra emisores y documentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Iniciar Sesión</h2>
            <p>Accede a tu cuenta para continuar</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <User size={18} />
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </form>
          
          <div className="form-footer">
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              © 2024 Certificadora FEL. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login