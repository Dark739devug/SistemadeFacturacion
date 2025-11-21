"use client"

import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, FileText, Building2, Shield, Users, LogOut, Menu, X } from "lucide-react"
import "./Layout.css"

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
    { path: "/facturas", icon: FileText, label: "Facturas" },
    { path: "/emisores", icon: Building2, label: "Emisores" },
    { path: "/certificar", icon: Shield, label: "Certificar" },
    { path: "/usuarios", icon: Users, label: "Usuarios" },
  ]

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Shield size={32} />
            <span>Certificadora FEL</span>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.nombreCompleto?.charAt(0) || "U"}</div>
            <div className="user-details">
              <p className="user-name">{user?.nombreCompleto || "Usuario"}</p>
              <p className="user-role">{user?.rol?.nombre || "USER"}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>Sistema de Certificación FEL</h1>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default Layout
