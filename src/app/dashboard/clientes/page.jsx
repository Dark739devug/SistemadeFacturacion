'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './facturacion.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);

  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }

  try {
    const parsed = JSON.parse(t);
    if (typeof parsed === 'string') return parsed;
    if (parsed.accessToken) return parsed.accessToken;
    if (parsed.token) return parsed.token;
    if (parsed.jwt) return parsed.jwt;
    if (parsed.access_token) return parsed.access_token;
    return null;
  } catch {
    // No es JSON, usar tal cual
  }
  return t;
}

export default function Clientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);
    setError(null);
    try {
      const rawToken = localStorage.getItem('accessToken') || 
                       localStorage.getItem('token') || 
                       sessionStorage.getItem('accessToken') || 
                       sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);

      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/api/clientes`, { headers });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      setClientes(items);
    } catch (err) {
      console.error('Error fetching clientes', err);
      toast.error('Error cargando clientes.');
      setError('No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!query) return clientes;
    const q = query.toLowerCase();
    return clientes.filter(c =>
      (c.nit || '').toLowerCase().includes(q) ||
      (c.razonSocial || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.municipio || '').toLowerCase().includes(q) ||
      (c.departamento || '').toLowerCase().includes(q)
    );
  }, [clientes, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      const rawToken = localStorage.getItem('accessToken') || 
                       localStorage.getItem('token') || 
                       sessionStorage.getItem('accessToken') || 
                       sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);

      const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/api/clientes/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      toast.success('Cliente eliminado');
      setClientes(prev => prev.filter(c => c.idCliente !== id));
    } catch (err) {
      console.error('Delete error', err);
      toast.error('No se pudo eliminar el cliente.');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Clientes</h1>
        <div className={styles.Contenedorboton}>
        <button 
          className={styles.boton} 
          onClick={() => router.push('/dashboard/clientes/nuevo')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M9 12h6" /><path d="M12 9v6" />
            </svg>
          Agregar Cliente
        </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          type="search"
          placeholder="Buscar por NIT, razón social, email..."
          className={styles.input}
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
        />
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loader}>Cargando clientes...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <table className={styles.factura}>
              <thead>
                <tr>
                  <th>NIT</th>
                  <th>Razón Social</th>
                  <th>Municipio</th>
                  <th>Departamento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan="10" className={styles.empty}>No hay resultados</td></tr>
                ) : (
                  pageItems.map((cliente) => (
                    <tr key={cliente.idCliente}>
                      <td>{cliente.nit}</td>
                      <td>{cliente.razonSocial}</td>
                      <td>{cliente.municipio || '-'}</td>
                      <td>{cliente.departamento || '-'}</td>
                      <td>{cliente.telefono || '-'}</td>
                      <td>{cliente.email || '-'}</td>
                      <td>
                        <span className={cliente.activo ? styles.statusActive : styles.statusInactive}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className={styles.actionsCol}>
                        <button 
                          className={styles.iconBtn} 
                          onClick={() => router.push(`/dashboard/clientes/${cliente.idCliente}/editar`)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" 
                          height="24" viewBox="0 0 24 24" 
                          fill="none" stroke="currentColor" 
                          strokeWidth="2" strokeLinecap="round" 
                          strokeLinejoin="round" >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                            <path d="M16 5l3 3" /></svg>
                        </button>
                        <button 
                          className={styles.iconBtnDanger} 
                          onClick={() => handleDelete(cliente.idCliente)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 7l16 0" /><path d="M10 11l0 6" />
                            <path d="M14 11l0 6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button onClick={() => setPage(s => Math.max(1, s - 1))} disabled={page === 1}>‹</button>
              <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
              <button onClick={() => setPage(s => Math.min(totalPages, s + 1))} disabled={page === totalPages}>›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
