"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Shield, Mail, Lock, User, UserPlus } from "lucide-react"
import "./Login.css"

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    const result = await register({
      nombre: registerData.nombre,
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    })

    if (result.success) {
      setError("")
      setIsLogin(true)
      setRegisterData({
        nombre: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.")
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-hero">
          <Shield size={64} strokeWidth={1.5} />
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
            <h2>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</h2>
            <p>{isLogin ? "Accede a tu cuenta" : "Regístrate en el sistema"}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLogin ? (
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
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">
                  <UserPlus size={18} />
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-username">
                  <User size={18} />
                  Usuario
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="Elige un nombre de usuario"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">
                  <Lock size={18} />
                  Contraseña
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">
                  <Lock size={18} />
                  Confirmar Contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>
          )}

          <div className="form-footer">
            <p>
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                }}
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
