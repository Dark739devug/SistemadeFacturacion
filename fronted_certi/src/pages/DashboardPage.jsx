import React, { useEffect, useState } from "react";
import '../assets/styles/DashboardPage.css';
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		// Verificar token localmente; si no hay token redirigir a login
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login', { replace: true });
			return;
		}

		// Cargar usuario desde localStorage (si existe)
		const u = localStorage.getItem('user');
		if (u) {
			try {
				setUser(JSON.parse(u));
			} catch {
				setUser({ username: u });
			}
		}
	}, [navigate]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/login', { replace: true });
	};

	return (
		<div className="dashboard-page">
			<header className="dashboard-header">
				<div className="hdr-left">
					<h1>Dashboard</h1>
					<p className="muted">Resumen rápido de la actividad</p>
				</div>
				<div className="hdr-right">
					{user && <div className="small text-right">Hola, <strong>{user.username || user.name}</strong></div>}
					<button className="btn secondary" onClick={() => navigate('/profile')}>Perfil</button>
					<button className="btn primary" onClick={handleLogout}>Cerrar sesión</button>
				</div>
			</header>

			<main className="dashboard-grid">
				<section className="card">
					<h3>Facturas</h3>
					<p className="big">128</p>
					<p className="muted">Últimas 30 días</p>
				</section>

				<section className="card">
					<h3>Certificadas</h3>
					<p className="big">97</p>
					<p className="muted">Tasa de éxito 75%</p>
				</section>

				<section className="card">
					<h3>Pendientes</h3>
					<p className="big">31</p>
					<p className="muted">En cola para certificar</p>
				</section>

				<section className="card wide">
					<h3>Actividad reciente</h3>
					<ul className="recent">
						<li>Certificación #F-00123 completada</li>
						<li>Solicitud de anulación #A-0045</li>
						<li>Nuevo emisor registrado: 1234567</li>
					</ul>
				</section>
			</main>
		</div>
	);
}