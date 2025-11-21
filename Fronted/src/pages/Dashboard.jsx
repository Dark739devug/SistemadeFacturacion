"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import "./Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    certificadas: 0,
    pendientes: 0,
    error: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get("/facturas")
      const facturas = response.data

      const stats = {
        total: facturas.length,
        certificadas: facturas.filter((f) => f.estadoCertificacion === "CERTIFICADA").length,
        pendientes: facturas.filter((f) => f.estadoCertificacion === "PENDIENTE").length,
        error: facturas.filter((f) => f.estadoCertificacion === "ERROR").length,
      }

      setStats(stats)
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "Total Facturas",
      value: stats.total,
      icon: FileText,
      color: "#171717",
      bgColor: "#f5f5f5",
    },
    {
      title: "Certificadas",
      value: stats.certificadas,
      icon: CheckCircle,
      color: "#22c55e",
      bgColor: "#f0fdf4",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Con Error",
      value: stats.error,
      icon: AlertCircle,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
  ]

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema de certificación</p>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.title} className="stat-card" style={{ backgroundColor: card.bgColor }}>
            <div className="stat-icon" style={{ color: card.color }}>
              <card.icon size={32} />
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h2>Bienvenido al Sistema de Certificación FEL</h2>
          <p>
            Gestiona tus facturas electrónicas y certifícalas de manera rápida y segura. Utiliza el menú lateral para
            navegar entre las diferentes secciones.
          </p>
          <ul>
            <li>Crea y administra facturas</li>
            <li>Gestiona emisores certificados</li>
            <li>Certifica documentos tributarios electrónicos</li>
            <li>Administra usuarios del sistema</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
