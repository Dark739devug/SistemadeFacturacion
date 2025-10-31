'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './productos.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);
  // quitar comillas envolventes si existen
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  // si es un JSON, intentar extraer campos conocidos
  try {
    const parsed = JSON.parse(t);
    if (typeof parsed === 'string') return parsed;
    if (parsed.accessToken) return parsed.accessToken;
    if (parsed.token) return parsed.token;
    if (parsed.jwt) return parsed.jwt;
    if (parsed.access_token) return parsed.access_token;
    // si no encontramos una propiedad conocida, no usar el objeto entero
    return null;
  } catch (e) {
    // no es JSON, usar tal cual
  }
  return t;
}

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 7;
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      // Buscar token en varias claves posibles (login guarda 'accessToken')
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Si no hay token válido, avisar y redirigir al login
      if (!token) {
        console.warn('No se encontró token válido en storage (productos).');
        setError('No autorizado. Por favor inicie sesión.');
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/api/productos`, {
        headers
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // No autorizado — normalmente credenciales faltan o están vencidas
          setError('No autorizado. Inicie sesión.');
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      // mapear campos para consistencia 
      const mapped = items.map(i => ({
        id: i.idProducto ?? i.id,
        codigo: i.codigoProducto ?? i.codigo,
        nombre: i.nombreProducto ?? i.nombre,
        descripcion: i.descripcion ?? i.descripcionProducto ?? '',
        categoria: i.nombreCategoria ?? i.categoria,
        establecimiento: i.nombreEstablecimiento ?? i.establecimiento,
        precio: (i.precioUnitario ?? i.precio) || 0,
        stock: i.stockActual ?? i.stock ?? 0,
        unidadMedida: i.unidadMedida,
        aplicaIva: i.aplicaIva,
        fechaCreacion: i.fechaCreacion,
        activo: i.activo
      }));
      setProductos(mapped);
    } catch (err) {
      console.error('Error fetching productos', err);
      setError('No se pudieron cargar los productos.');
      toast.error('Error cargando productos.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!query) return productos;
    const q = query.toLowerCase();
    return productos.filter(p =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.categoria || '').toLowerCase().includes(q) ||
      (p.establecimiento || '').toLowerCase().includes(q)
    );
  }, [productos, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function formatMoney(v) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
    } catch { return v; }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/api/productos/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      toast.success('Producto eliminado');
      // actualizar lista localmente
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete error', err);
      toast.error('No se pudo eliminar el producto.');
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <div className={styles.header}>
          <h1>Productos</h1>
          <div>
            <button className={styles.addBtn} onClick={() => router.push('/dashboard/productos/nuevo')}>+ Añadir Producto</button>
          </div>
        </div>

        <div className={styles.controls}>
          <input
            type="search"
            placeholder="Buscar por nombre de producto..."
            className={styles.search}
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loader}>Cargando...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre del Producto</th>
                    <th>Categoría</th>
                    <th>Establecimiento</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr><td colSpan="6" className={styles.empty}>No hay resultados</td></tr>
                  ) : pageItems.map(p => (
                    <tr key={p.id || p.codigo}>
                      <td className={styles.nameCol}>{p.nombre}</td>
                      <td>{p.categoria || '-'}</td>
                      <td>{p.establecimiento || '-'}</td>
                      <td>{formatMoney(p.precio || 0)}</td>
                      <td className={styles.stockCell}>
                        <div className={styles.stockContainer}>
                          <div className={styles.stockBar}>
                            <div
                              className={styles.stockFill}
                              style={{
                                width: `${Math.min(100, p.stock)}%`,
                                background:
                                  p.stock <= 25
                                    ? '#f87171' // rojo
                                    : p.stock < 50
                                    ? '#fbbf24' // amarillo
                                    : '#34d399' // verde
                              }}
                            />
                          </div>
                          <span className={styles.stockNumber}>{p.stock ?? 0}</span>
                        </div>
                      </td>
                      <td className={styles.actionsCol}>
                        <button aria-label="Editar" className={styles.iconBtn} onClick={() => router.push(`/dashboard/productos/${p.id || p.codigo}/editar`)}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#0f1724" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#0f1724" />
                          </svg>
                        </button>
                        <button aria-label="Eliminar" className={styles.iconBtnDanger} onClick={() => handleDelete(p.id || p.codigo)}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 6h18" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 11v6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 11v6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 6l1-2h4l1 2" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
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
      </main>
    </div>
  );
}

