"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUserProfile = async () => {
    try {
      const response = await api.get("/usuarios/me")
      setUser(response.data)
    } catch (error) {
      console.error("Error cargando perfil:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      })

      const { token: newToken, usuario } = response.data
      setToken(newToken)
      setUser(usuario)
      localStorage.setItem("token", newToken)

      return { success: true }
    } catch (error) {
      console.error("Error en login:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      }
    }
  }

  const register = async (userData) => {
    try {
      await api.post("/auth/register", userData)
      return { success: true }
    } catch (error) {
      console.error("Error en registro:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al registrar usuario",
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
