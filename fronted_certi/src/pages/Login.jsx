// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import '../assets/styles/LoginPage.css';
import { login } from '../services/userService.js';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const credentials = { username: username.trim(), password };
			const response = await login(credentials);

			if (response && response.token) {
				// Guardar token y usuario
				localStorage.setItem('token', response.token);
				const userInfo = response.user || { username: credentials.username };
				localStorage.setItem('user', JSON.stringify(userInfo));

				// Navegar al dashboard y reemplazar historial
				navigate('/dashboard', { replace: true });
			} else {
				throw new Error('Respuesta inválida del servidor.');
			}
		} catch (err) {
			if (err.response) {
				const msg =
					err.response.data?.message ||
					`Error ${err.response.status}: ${err.response.statusText}`;
				setError(msg);
			} else if (err.request) {
				setError('No se pudo conectar con el servidor.');
			} else {
				setError('Ocurrió un error inesperado.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			{/* Inicio / Marketing panel (lado izquierdo) */}
			<aside className="auth-left">
				<div className="inicio-card">
					<div className="brand">
						<div className="logo">FEL</div>
						<div>
							<h1>Certificador FEL</h1>
							<p className="subtitle">Gestiona y certifica tus DTE con rapidez y seguridad.</p>
						</div>
					</div>

					<hr className="separator" />

					<div className="features">
						<div className="feature">
							<strong>Ventas</strong>
							<p className="muted">Controla tus facturas y reportes.</p>
						</div>
						<div className="feature">
							<strong>Clientes</strong>
							<p className="muted">Gestiona emisores y receptores.</p>
						</div>
						<div className="feature">
							<strong>Seguridad</strong>
							<p className="muted">Autenticación con JWT y control de accesos.</p>
						</div>
					</div>

					<div className="inicio-cta">
						<button className="btn outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
							Ver más
						</button>
					</div>
				</div>
			</aside>

			{/* Login card (lado derecho) */}
			<main className="auth-card" role="region" aria-labelledby="login-title">
				<h2 id="login-title">Iniciar sesión</h2>

				{error && <div className="error-message" role="alert">{error}</div>}

				<form onSubmit={handleSubmit} className="login-form" noValidate>
					<div className="field">
						<label className="label-text" htmlFor="username">Usuario</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={loading}
							placeholder="tu.usuario"
							autoComplete="username"
							required
						/>
					</div>

					<div className="field">
						<label className="label-text" htmlFor="password">Contraseña</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							placeholder="********"
							autoComplete="current-password"
							required
						/>
					</div>

					<button
						type="submit"
						className={`btn primary ${loading ? 'loading' : ''}`}
						disabled={loading}
						aria-busy={loading}
					>
						{loading ? 'Ingresando...' : 'Entrar'}
					</button>

					{/* Enlace "Olvidaste tu contraseña" eliminado según petición. Mantener "Registrarte" */}
					<div className="form-footer">
						<span></span>
						<a href="#" className="link">Registrarte</a>
					</div>
				</form>
			</main>
		</div>
	);
}

export default LoginPage;
