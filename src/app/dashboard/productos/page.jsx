'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './productos.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import ENDPOINTS from '../../services/api'; 

// función para extraer rol de usuario desde el token JWT
function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);
  // quitar las comillas que a veces envuelven el token
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  // utiliza parsed para extraer json 
  // esto sirve para casos donde el token se guarda como JSON en storage
  try {
    const parsed = JSON.parse(t);
    if (typeof parsed === 'string') return parsed;
    if (parsed.accessToken) return parsed.accessToken;
    if (parsed.token) return parsed.token;
    if (parsed.jwt) return parsed.jwt;
    if (parsed.access_token) return parsed.access_token;
    return null;
  } catch (e) {
  }
  return t;
}

// Componente principal de la página de productos
export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [page, setPage] = useState(1);
  // items por página en este caso seran 6 en la tabla 
  const perPage = 5;
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // estado para el nuevo producto
  const [newProduct, setNewProduct] = useState({
    codigoProducto: '',
    nombreProducto: '',
    descripcion: '',
    idCategoria: null,
    idEstablecimiento: null,
    precioUnitario: 0,
    stockActual: 0,
    unidadMedida: '',
    aplicaIva: true
  });
  const [categorias, setCategorias] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);

  // cargar productos al montar el componente
  // esto sirve para inicializar la vista con datos
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchEstablecimientos();
    // intentar leer rol desde el token (si es JWT) u otras keys en storage
    // esto sirve para controlar permisos de usuario en la UI ya que algunos endpoints pueden ser restringidos
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const role = getRoleFromToken(token);
      if (role) setUserRole(Number(role));
      // noop significa que no se hace nada y no hay error  
    } catch (e) { /* noop */ }
  }, []);

// función para obtener el rol del usuario desde el token JWT
  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      // Buscar el token en localStorage o sessionStorage
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Si no hay token válido, o el token esta expirado mostrar mensaje y redirigir al login
      if (!token) {
        console.warn('Acceso No Autorizado.');
        setError('No autorizado. Por favor inicie sesión.');
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      const res = await fetch(ENDPOINTS.productos, {
        headers
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // No autorizado para acceder a productos
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
      // mapear campos de productos para consistencia
      const mapped = items.map(i => ({
        id: i.idProducto ?? i.id,
        codigo: i.codigoProducto ?? i.codigo,
        nombre: i.nombreProducto ?? i.nombre,
        descripcion: i.descripcion ?? i.descripcionProducto ?? '',
        categoria: i.nombreCategoria ?? i.categoria,
        idCategoria: i.idCategoria ?? i.categoriaId ?? i.id_categoria ?? null,
        establecimiento: i.nombreEstablecimiento ?? i.nombreComercial ?? i.nombre ?? i.establecimiento,
        idEstablecimiento: i.idEstablecimiento ?? i.establecimientoId ?? i.id_establecimiento ?? null,
        precio: (i.precioUnitario ?? i.precio) || 0,
        stock: i.stockActual ?? i.stock ?? 0,
        unidadMedida: i.unidadMedida,
        aplicaIva: i.aplicaIva,
        fechaCreacion: i.fechaCreacion,
        activo: i.activo
      }));

      // Intentar ordenar por fecha de creación descendente si existe, si no por id descendente
      const sorted = mapped.slice().sort((a, b) => {
        // if both have fechaCreacion, compare as dates
        if (a.fechaCreacion && b.fechaCreacion) {
          const da = Date.parse(a.fechaCreacion) || 0;
          const db = Date.parse(b.fechaCreacion) || 0;
          if (db !== da) return db - da;
        }
        // fallback: if both ids are numeric, sort by id desc
        const na = Number(a.id);
        const nb = Number(b.id);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return nb - na;
        return 0;
      });

      setAllProductos(sorted);
      setProductos(sorted);
    } catch (err) {
      console.error('Error ', err);
      setError('No se pudieron cargar los productos.');
      toast.error('Error cargando productos.');
    } finally {
      setLoading(false);
    }
  }

  // función para obtener productos por categoría
  async function fetchProductosByCategoria(idCategoria) {
    setLoading(true);
    try {
      // se utiliza el token almacenado para consultar el endpoint protegido
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch(ENDPOINTS.productosPorCategoria(idCategoria), { headers });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      const mapped = items.map(i => ({
        id: i.idProducto ?? i.id,
        codigo: i.codigoProducto ?? i.codigo,
        nombre: i.nombreProducto ?? i.nombre,
        descripcion: i.descripcion ?? i.descripcionProducto ?? '',
        categoria: i.nombreCategoria ?? i.categoria,
        idCategoria: i.idCategoria ?? i.categoriaId ?? i.id_categoria ?? null,
        establecimiento: i.nombreEstablecimiento ?? i.nombreComercial ?? i.nombre ?? i.establecimiento,
        idEstablecimiento: i.idEstablecimiento ?? i.establecimientoId ?? i.id_establecimiento ?? null,
        precio: (i.precioUnitario ?? i.precio) || 0,
        stock: i.stockActual ?? i.stock ?? 0,
        unidadMedida: i.unidadMedida,
        aplicaIva: i.aplicaIva,
        fechaCreacion: i.fechaCreacion,
        activo: i.activo
      }));
      setProductos(mapped);
    } catch (err) {
      console.error('Error ', err);
      toast.error('Error al cargar productos por categoría');
    } finally {
      setLoading(false);
    }
  }

  // función para obtener categorías
  async function fetchCategorias() {
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(ENDPOINTS.categorias, { headers });

      if (!res.ok) {
        // manejar error de autorización
        console.warn('No se pudieron cargar las categorías', res.status);
        return;
      }
      const data = await res.json();
      // se utiliza array para extraer categorías
      const items = Array.isArray(data) ? data : (data.items || data.categorias || []);
      const mapped = items.map(i => ({
        id: i.idCategoria ?? i.id ?? i.categoriaId ?? null,
        nombre: i.nombreCategoria ?? i.nombre ?? i.descripcion ?? i.categoria ?? ''
      })).filter(x => x.id != null);
      setCategorias(mapped);
    } catch (e) {
      console.error('Error', e);
    }
  }

  // función para obtener establecimientos
  async function fetchEstablecimientos() {
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(ENDPOINTS.establecimientos, { headers });

      if (!res.ok) {
        console.warn('No se pudieron cargar los establecimientos', res.status);
        return;
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || data.establecimientos || []);
      const mapped = items.map(i => ({
        id: i.idEstablecimiento ?? i.id ?? i.establecimientoId ?? null,
        nombre: i.nombreEstablecimiento ?? i.nombreComercial ?? i.nombre ?? i.descripcion ?? i.establecimiento ?? ''
      })).filter(x => x.id != null);
      setEstablecimientos(mapped);
    } catch (e) {
      console.error('Error', e);
    }
  }

  // función para buscar productos
  let searchTimeout = null;
  async function fetchProductosBuscar(q) {
    // debounce handled by caller
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(ENDPOINTS.productosBuscar(q), { headers });

      if (!res.ok) {
        // si no hay resultado de la busqueda se muestra error 404 
        if (res.status === 404) {
          setProductos([]);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      const mapped = items.map(i => ({
        id: i.idProducto ?? i.id,
        codigo: i.codigoProducto ?? i.codigo,
        nombre: i.nombreProducto ?? i.nombre,
        descripcion: i.descripcion ?? i.descripcionProducto ?? '',
        categoria: i.nombreCategoria ?? i.categoria,
        idCategoria: i.idCategoria ?? i.categoriaId ?? i.id_categoria ?? null,
        establecimiento: i.nombreEstablecimiento ?? i.nombreComercial ?? i.nombre ?? i.establecimiento,
        idEstablecimiento: i.idEstablecimiento ?? i.establecimientoId ?? i.id_establecimiento ?? null,
        precio: (i.precioUnitario ?? i.precio) || 0,
        stock: i.stockActual ?? i.stock ?? 0,
        unidadMedida: i.unidadMedida,
        aplicaIva: i.aplicaIva,
        fechaCreacion: i.fechaCreacion,
        activo: i.activo
      }));
      setProductos(mapped);
    } catch (err) {
      console.error('Error fetching buscar', err);
      // Mostrar toast sólo para errores inesperados
      toast.error('Error buscando productos');
    }
  }

  // filtro de productos basado en búsqueda, categoría y establecimiento
  const filtered = useMemo(() => {
    // esto sirve para el filtrado del lado del cliente
    const q = (query || '').toLowerCase();
    return productos.filter(p =>
      ((q === '' ) || (p.nombre || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q) || (p.establecimiento || '').toLowerCase().includes(q)) &&
      (selectedCategory ? (p.categoria || '') === selectedCategory : true) &&
      (selectedEstablishment ? (p.establecimiento || '') === selectedEstablishment : true)
    );
  }, [productos, query, selectedCategory, selectedEstablishment]);

  // esto sirve para la paginación de productos 
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

 // funcion para dar formato a los montos en este caso formato de Guatemala
  function formatMoney(v) {
    try {
      return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);
    } catch { return v; }
  }

  //funcion para dar estilo a las categorias
  function categoryStyle(name) {
    // elige un color de paleta según hash del nombre para las categorias 
    if (!name) return {};
    const palette = [
      '#faf0ff', // púrpura pálido
      '#eef2ff', // índigo pálido
      '#fff4e6', // naranja pálido
      '#e6fff2', // verde pálido
      '#fff1f2', // rosa pálido
      '#f0f9ff', // cian pálido
      '#fff7ed', // durazno
      '#fdf2f8', // rosa
      '#fef3c7'  // amarillo
    ];

    // aqui se utiliza una función hash simple para asignar un color
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h << 5) - h + name.charCodeAt(i);
      h |= 0; // convertir a 32-bit para consistencia poruque JS usa 64-bit nativamente y nos ayuda a tener siempre el mismo resultado
    }
    const color = palette[Math.abs(h) % palette.length];

    // funcion para calcular contraste en el texto de la categoria
    function hexToRgb(hex) {
      const h = hex.replace('#', '');
      if (h.length === 3) {
        return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
      }
      return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
    }
    const [r,g,b] = hexToRgb(color);
    // esto sirve para darle un brillo a los elementos de la categoria
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 150 ? '#0f1724' : '#ffffff';

    return { background: color, color: textColor };
  }

    // función para extraer rol de usuario desde el token JWT
    // esto porque algunos tokens pueden tener diferentes estructuras y nombres de claves
    // con esta funcion se intenta extraer el rol de usuario para controlar permisos en la UI
  function getRoleFromToken(token) {
    try {
      // Si viene un token JWT, intentar decodificar
      if (token) {
        const parts = String(token).split('.');
        if (parts.length === 3) {
          const payload = parts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const json = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const obj = JSON.parse(json);
          // buscar claves comunes que indiquen rol o scope
          const candidate = obj.idRol ?? obj.id_rol ?? obj.role ?? obj.roles ?? obj.rol ?? obj.roleId ?? obj.role_id ?? obj.scope ?? null;
          if (candidate != null) {
            // mapear a número si es necesario
            if (typeof candidate === 'number') return candidate;
            if (typeof candidate === 'string') {
              const s = candidate.trim();
              if (/^\d+$/.test(s)) return Number(s);
              const lc = s.toLowerCase();
              if (lc.includes('admin')) return 1;
              if (lc.includes('fact')) return 2;
              // si viene un array en roles, intentar tomar la primera coincidencia
              if (s) return s;
            }
            if (Array.isArray(candidate) && candidate.length > 0) return candidate[0];
          }
        }

        // Si no es JWT, intentar parsear token como JSON/valor plano (algunas apps almacenan rol directamente)
        try {
          const parsed = JSON.parse(token);
          if (parsed && (parsed.idRol || parsed.rol || parsed.role)) return parsed.idRol ?? parsed.rol ?? parsed.role;
          if (typeof parsed === 'string' || typeof parsed === 'number') return parsed;
        } catch (e) {
          // no es JSON, puede ser un string simple con el rol
          if (/^\d+$/.test(String(token).trim())) return String(token).trim();
        }
      }
    } catch (e) {
      // ignorarar errores de parsing (parsing significa que no es JWT)
    }

    // aqui se hace fallback: revisar rol almacenado en storage (para apps que guardan rol por separado)
    const keys = ['rol','idRol','role','user','usuario','currentUser','session','auth','profile'];
    for (const k of keys) {
      try {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (!v) continue;
        // si es JSON, parsear y buscar campos
        try {
          const parsed = JSON.parse(v);
          if (parsed) {
            const cand = parsed.idRol ?? parsed.rol ?? parsed.role ?? parsed.scope ?? parsed.token ?? null;
            if (cand != null) {
              if (typeof cand === 'number') return cand;
              if (typeof cand === 'string') {
                const s = cand.trim();
                if (/^\d+$/.test(s)) return Number(s);
                const lc = s.toLowerCase();
                if (lc.includes('admin')) return 1;
                if (lc.includes('fact')) return 2;
                return s;
              }
            }
            // si no se encuentra, intentar buscar directamente en el objeto parseado
            if (parsed.rol || parsed.role || parsed.idRol) {
              const s = parsed.rol ?? parsed.role ?? parsed.idRol;
              if (typeof s === 'number') return s;
              if (typeof s === 'string') {
                const lc = s.toLowerCase();
                if (lc.includes('admin')) return 1;
                if (lc.includes('fact')) return 2;
                if (/^\d+$/.test(s)) return Number(s);
                return s;
              }
            }
          }
        } catch (e) {
          // no es JSON, v puede ser el rol directamente
          const s = String(v).trim();
          if (/^\d+$/.test(s)) return Number(s);
          const lc = s.toLowerCase();
          if (lc.includes('admin')) return 1;
          if (lc.includes('fact')) return 2;
          return s;
        }
      } catch (e) {
        // ignorar errores y continuar
      }
    }
    return null;
  }

  // funcion para validar nuevo producto
  function validateNewProduct(np) {
    const errors = {};
    if (!np) return errors;
    if (!np.codigoProducto || String(np.codigoProducto).trim() === '') errors.codigoProducto = 'Código es obligatorio.';
    if (!np.nombreProducto || String(np.nombreProducto).trim() === '') errors.nombreProducto = 'Nombre es obligatorio.';
    if (!np.idCategoria) errors.idCategoria = 'Seleccione una categoría.';
    if (!np.idEstablecimiento) errors.idEstablecimiento = 'Seleccione un establecimiento.';
    if (!np.unidadMedida || String(np.unidadMedida).trim() === '') errors.unidadMedida = 'Seleccione la unidad de medida.';
    if (isNaN(Number(np.precioUnitario)) || Number(np.precioUnitario) < 0) errors.precioUnitario = 'Precio inválido.';
    if (isNaN(Number(np.stockActual)) || Number(np.stockActual) < 0) errors.stockActual = 'Stock inválido.';
    return errors;
  }

  // función para desactivar un producto
  // solo el rol de administrador puede desactivar productos
  async function handleDelete(id) {
    console.log('handleDelete (desactivar) called with id:', id, 'userRole:', userRole);
    const proceed = confirm('¿Desactivar este producto?');
    console.log('confirm result:', proceed);
    if (!proceed) {
      toast.info('Desactivación cancelada');
      return;
    }

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

      // Buscar el producto completo en el estado actual
      const producto = productos.find(p => p.id === id || p.codigo === id);
      if (!producto) {
        toast.error('Producto no encontrado');
        return;
      }

      // Construir el payload con todos los campos del producto y activo=false
      const payload = {
        idProducto: producto.id,
        codigoProducto: producto.codigo || '',
        nombreProducto: producto.nombre || '',
        descripcion: producto.descripcion || '',
        idCategoria: producto.idCategoria,
        idEstablecimiento: producto.idEstablecimiento,
        precioUnitario: Number(producto.precio) || 0,
        stockActual: Number(producto.stock) || 0,
        unidadMedida: producto.unidadMedida || '',
        aplicaIva: producto.aplicaIva === true,
        activo: false // <-- Desactivar el producto
      };

      const res = await fetch(ENDPOINTS.productoPorId(id), {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      let respText = null;
      try { respText = await res.text(); } catch (e) { /* ignore */ }
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        throw new Error(respText || `HTTP ${res.status}`);
      }

      toast.success('Producto desactivado');
      // actualizar estado local: marcar activo = false
      setProductos(prev => prev.map(p => ((p.id === id || p.codigo === id) ? { ...p, activo: false } : p)));
      setAllProductos(prev => prev.map(p => ((p.id === id || p.codigo === id) ? { ...p, activo: false } : p)));
    } catch (err) {
      console.error('Desactivar error', err);
      toast.error('No se pudo desactivar el producto. Revisa la consola y la pestaña Network.');
    }
  }

  // validaciones para el nuevo producto
  const newProductErrors = validateNewProduct(newProduct);
  const isCreateDisabled = Object.keys(newProductErrors).length > 0;

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <div className={styles.header}>
          <h1>Productos</h1>
          <div>
            <button className={styles.addBtn} onClick={() => {
              // aqui se abrira un modal para crear un nuevo producto
              setNewProduct({ codigoProducto:'', nombreProducto:'', descripcion:'', idCategoria: null, idEstablecimiento: null, precioUnitario:0, stockActual:0, unidadMedida:'', aplicaIva:true });
              setIsCreateModalOpen(true);
            }}>+ Añadir Producto</button>
          </div>
        </div>

        <div className={styles.controls}>
          <input
            type="search"
            placeholder="Buscar por nombre o código de producto..."
            className={styles.search}
            value={query}
            onChange={e => {
              const v = e.target.value;
              setQuery(v);
              setPage(1);
              // primero intentar filtrado local case-insensitive para evitar 404 por mayúsculas
              const q = (v || '').trim().toLowerCase();
              if (q.length >= 1 && allProductos && allProductos.length > 0) {
                const localMatches = allProductos.filter(p => (
                  (p.nombre || '').toLowerCase().includes(q) ||
                  (p.codigo || '').toLowerCase().includes(q) ||
                  (p.categoria || '').toLowerCase().includes(q) ||
                  (p.establecimiento || '').toLowerCase().includes(q)
                ));
                if (localMatches.length > 0) {
                  setProductos(localMatches);
                  // limpiar timer de búsqueda si existe
                  if (searchTimer) { clearTimeout(searchTimer); setSearchTimer(null); }
                  return;
                }
              }
              // si no hay coincidencias locales, hacer búsqueda en el servidor con debounce
              if (searchTimer) clearTimeout(searchTimer);
              const t = setTimeout(() => {
                if (v && v.length >= 2) {
                  fetchProductosBuscar(v);
                } else if (!v) {
                  // restaurar lista completa si la búsqueda está vacía
                  if (selectedCategory) {
                    // peticion fetch por categoria si hay una seleccionada
                    const id = allProductos.find(p => p.categoria === selectedCategory)?.idCategoria;
                    if (id) fetchProductosByCategoria(id);
                    else setProductos(allProductos);
                  } else {
                    setProductos(allProductos);
                  }
                }
              }, 450);
              setSearchTimer(t);
            }}
          />

          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={e => {
              const val = e.target.value;
              setSelectedCategory(val);
              setPage(1);
              if (!val) {
                // restaurar lista completa si no hay categoría seleccionada
                setProductos(allProductos);
                return;
              }
              // buscar el id de categoría correspondiente
              const id = allProductos.find(p => p.categoria === val)?.idCategoria;
              if (id) {
                fetchProductosByCategoria(id);
              } else {
                // si no se encuentra id, filtrar localmente
                setProductos(allProductos.filter(p => p.categoria === val));
              }
            }}
            aria-label="Filtrar por categoría"
          >
            <option value="">Categoría</option>
            {Array.from(new Map(allProductos.filter(Boolean).map(p => [p.idCategoria ?? p.categoria, p.categoria]).filter(([id,name])=>name))).map(([id,name]) => (
              <option key={id ?? name} value={name} data-id={id}>{name}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={selectedEstablishment}
            onChange={e => { const val = e.target.value; setSelectedEstablishment(val); setPage(1); if (!val) setProductos(allProductos); else setProductos(allProductos.filter(p => p.establecimiento === val)); }}
            aria-label="Filtrar por establecimiento"
          >
            <option value="">Establecimiento</option>
            {Array.from(new Set(allProductos.map(p => p.establecimiento).filter(Boolean))).map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>
        {/* tabla de productos */}
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
                    <th>Código</th>
                    <th>Categoría</th>
                    <th>Establecimiento</th>
                    <th>Precio</th>
                    <th>Unidad Medida</th>
                    <th>IVA</th>
                    <th>Activo</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr><td colSpan="10" className={styles.empty}>No hay resultados</td></tr>
                  ) : pageItems.map(p => (
                    <tr key={p.id || p.codigo}>
                      <td className={styles.nameCol}>{p.nombre}</td>
                      <td>{p.codigo || '-'}</td>
                      <td>
                        {p.categoria ? (
                          <span className={styles.categoryBadge} style={categoryStyle(p.categoria)}>{p.categoria}</span>
                        ) : '-'}
                      </td>
                      <td>{p.establecimiento || '-'}</td>
                      <td>{formatMoney(p.precio || 0)}</td>
                      <td>{p.unidadMedida || '-'}</td>
                      <td>
                        <span className={`${styles.ivaBadge} ${p.aplicaIva ? styles.ivaYes : styles.ivaNo}`}>
                          {p.aplicaIva ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${p.activo ? styles.statusActive : styles.statusInactive}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className={styles.stockCell}>
                        <div className={styles.stockContainer}>
                          <div className={styles.stockBar}>
                            <div
                            /* barra de stock */
                              className={styles.stockFill}
                              style={{
                                width: `${Math.min(100, p.stock)}%`,
                                background:
                                // cambiar color según nivel de stock
                                  p.stock <= 25
                                    ? '#f87171' // rojo
                                    : p.stock <= 50
                                    ? '#fbbf24' // amarillo
                                    : '#34d399' // verde
                              }}
                            />
                          </div>
                          <span className={styles.stockNumber}>{p.stock ?? 0}</span>
                        </div>
                      </td>
                      <td className={styles.actionsCol}>
                        <button
                          aria-label="Editar" 
                          className={`${styles.iconBtn} ${styles.actionBtn}`}
                          title="Editar Producto"
                          onClick={() => {
                            // abrir modal con datos del producto seleccionado
                            const sp = { ...p };
                            // intentar resolver ids si no existen usando listas ya cargadas
                            if ((!sp.idCategoria || sp.idCategoria == null) && sp.categoria && categorias.length > 0) {
                              const f = categorias.find(c => (c.nombre || '').toLowerCase() === (sp.categoria || '').toLowerCase());
                              if (f) sp.idCategoria = f.id;
                            }
                            if ((!sp.idEstablecimiento || sp.idEstablecimiento == null) && sp.establecimiento && establecimientos.length > 0) {
                              const f2 = establecimientos.find(c => (c.nombre || '').toLowerCase() === (sp.establecimiento || '').toLowerCase());
                              if (f2) sp.idEstablecimiento = f2.id;
                            }
                            setSelectedProduct(sp);
                            setIsModalOpen(true);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        </button>
                        {Number(userRole) === 1 && (
                          p && p.activo ? (
                            <button
                              aria-label="Desactivar"
                              className={`${styles.iconBtnDanger} ${styles.actionBtnDanger}`}
                              onClick={() => { console.log('Desactivar click', { id: p.id, codigo: p.codigo, product: p }); handleDelete(p.id || p.codigo); }}
                              title="Desactivar producto"
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M3 6h18" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 11v6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 11v6" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 6l1-2h4l1 2" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              aria-label="Activar"
                              className={`${styles.iconBtn} ${styles.actionBtn}`}
                              onClick={() => { console.log('Activar click', { id: p.id, codigo: p.codigo, product: p }); /* Add handleActivate if needed */ }}
                              title="Activar producto"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M20 6L9 17l-5-5" stroke="#065f46" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Modal: editar producto */}
              {isModalOpen && selectedProduct && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                  <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Editar producto" onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                      <h3>Editar Producto</h3>
                      <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)} aria-label="Cerrar">×</button>
                    </div>
                    <div className={styles.modalBody}>
                      <div className={styles.modalGrid}>
                        <div className={styles.field}>
                          <label className={styles.label}>Nombre</label>
                          <input className={styles.input} value={selectedProduct.nombre || ''} onChange={e => setSelectedProduct({...selectedProduct, nombre: e.target.value})} />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Código</label>
                          <input className={styles.input} value={selectedProduct.codigo || ''} onChange={e => setSelectedProduct({...selectedProduct, codigo: e.target.value})} />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Establecimiento</label>
                          <select
                            className={styles.input}
                            value={selectedProduct.idEstablecimiento ?? selectedProduct.idEstablecimiento === 0 ? selectedProduct.idEstablecimiento : (selectedProduct.idEstablecimiento ?? '')}
                            onChange={e => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              const found = establecimientos.find(x => Number(x.id) === Number(id));
                              setSelectedProduct({ ...selectedProduct, idEstablecimiento: id, establecimiento: found ? found.nombre : selectedProduct.establecimiento });
                            }}
                          >
                            <option value="">Seleccione establecimiento</option>
                            {establecimientos.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Categoría</label>
                          <select
                            className={styles.input}
                            value={selectedProduct.idCategoria ?? selectedProduct.idCategoria === 0 ? selectedProduct.idCategoria : (selectedProduct.idCategoria ?? '')}
                            onChange={e => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              const found = categorias.find(x => Number(x.id) === Number(id));
                              setSelectedProduct({ ...selectedProduct, idCategoria: id, categoria: found ? found.nombre : selectedProduct.categoria });
                            }}
                          >
                            <option value="">Seleccione categoría</option>
                            {categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Precio</label>
                          <input type="number" className={styles.input} value={selectedProduct.precio ?? 0} onChange={e => setSelectedProduct({...selectedProduct, precio: Number(e.target.value)})} />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Stock</label>
                          <input type="number" className={styles.input} value={selectedProduct.stock ?? 0} onChange={e => setSelectedProduct({...selectedProduct, stock: Number(e.target.value)})} />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Unidad Medida</label>
                          <select
                            className={styles.input}
                            value={selectedProduct.unidadMedida || ''}
                            onChange={e => setSelectedProduct({ ...selectedProduct, unidadMedida: e.target.value })}
                          >
                            <option value="">Seleccione unidad de medida</option>
                            <option value="Kilogramo">Kilogramo (kg)</option>
                            <option value="Gramo">Gramo (g)</option>
                            <option value="Litro">Litro (L)</option>
                            <option value="Mililitro">Mililitro (ml)</option>
                            <option value="Unidad">Unidad</option>
                            <option value="Par">Par</option>
                            <option value="Metro">Metro (m)</option>
                            <option value="Pack">Pack</option>
                            <option value="Caja">Caja</option>
                            <option value="Pieza">Pieza</option>
                          </select>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Aplica Iva</label>
                          <select
                            className={styles.input}
                            value={selectedProduct.aplicaIva === true ? 'si' : selectedProduct.aplicaIva === false ? 'no' : ''}
                            onChange={e => {
                              const v = e.target.value;
                              setSelectedProduct({ ...selectedProduct, aplicaIva: v === 'si' ? true : v === 'no' ? false : null });
                            }}
                          >
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>

                        <div className={`${styles.field} ${styles.fullWidth}`}>
                          <label className={styles.label}>Descripción</label>
                          <textarea className={styles.input} rows={4} value={selectedProduct.descripcion || ''} onChange={e => setSelectedProduct({...selectedProduct, descripcion: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                      <button className={styles.saveBtn} onClick={async () => {
                        // realizar PUT a la API con mejores comprobaciones y logging
                        try {
                          const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
                          const token = normalizeToken(rawToken);
                          const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
                          if (token) headers.Authorization = `Bearer ${token}`;

                          if (!selectedProduct || !selectedProduct.id) {
                            toast.error('Producto inválido. No se encontró id.');
                            return;
                          }

                          
                          let idCategoriaToSend = selectedProduct.idCategoria ?? null;
                          let idEstablecimientoToSend = selectedProduct.idEstablecimiento ?? null;

                          if (!idCategoriaToSend && selectedProduct.categoria) {
                            const found = allProductos.find(x => (x.categoria || '').toLowerCase() === (selectedProduct.categoria || '').toLowerCase());
                            if (found && found.idCategoria) idCategoriaToSend = found.idCategoria;
                          }
                          if (!idEstablecimientoToSend && selectedProduct.establecimiento) {
                            const foundE = allProductos.find(x => (x.establecimiento || '').toLowerCase() === (selectedProduct.establecimiento || '').toLowerCase());
                            if (foundE && foundE.idEstablecimiento) idEstablecimientoToSend = foundE.idEstablecimiento;
                          }

                          // construir payload en la forma que espera la API
                          const payload = {
                            idProducto: selectedProduct.id,
                            codigoProducto: selectedProduct.codigo || '',
                            nombreProducto: selectedProduct.nombre || '',
                            descripcion: selectedProduct.descripcion || '',
                            idCategoria: idCategoriaToSend,
                            idEstablecimiento: idEstablecimientoToSend,
                            precioUnitario: Number(selectedProduct.precio) || 0,
                            stockActual: Number(selectedProduct.stock) || 0,
                            unidadMedida: selectedProduct.unidadMedida || '',
                            aplicaIva: selectedProduct.aplicaIva === true
                          };
                          // agregar idProducto si está presente
                          console.log('PUT payload:', payload);
                          
                          const res = await fetch(ENDPOINTS.productoPorId(selectedProduct.id), {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify(payload)
                          });

                          // intentar leer el body de la respuesta
                          let bodyText = null;
                          let bodyJson = null;
                          try {
                            bodyText = await res.text();
                            try { bodyJson = JSON.parse(bodyText); } catch(e) { bodyJson = null; }
                          } catch (e) { /* ignore */ }

                          console.log('PUT response status:', res.status, 'body:', bodyText);

                          if (!res.ok) {
                            console.error('PUT /api/productos error', res.status, bodyText);
                            toast.error(`Error actualizando producto: ${res.status}${bodyText ? ' - ' + (bodyJson?.message || bodyText) : ''}`);
                            return;
                          }

                          // si la respuesta tiene body, usarlo; si no, intentar GET al recurso
                          let updatedRaw = null;
                          if (bodyJson) {
                            updatedRaw = bodyJson;
                          } else if (bodyText && bodyText.trim()) {
                            updatedRaw = { raw: bodyText };
                          } else {
                            // respuesta vacía: intentar GET al recurso para confirmar persistencia
                            try {
                              const r2 = await fetch(ENDPOINTS.productoPorId(selectedProduct.id), { headers });
                              if (r2.ok) {
                                const d2 = await r2.json();
                                // si el endpoint GET devuelve directamente el objeto, usarlo; si devuelve {items:[]}, normalizar
                                updatedRaw = Array.isArray(d2) ? d2[0] : (d2.item || d2.producto || d2 || null);
                                console.log('GET after PUT fetched:', updatedRaw);
                              } else {
                                console.warn('GET after PUT failed', r2.status);
                              }
                            } catch (e) {
                              console.error('GET after PUT error', e);
                            }
                          }

                          // preferir campos devueltos por el API si existen
                          const mappedUpdated = {
                            id: (updatedRaw && (updatedRaw.idProducto ?? updatedRaw.id)) || selectedProduct.id,
                            codigo: (updatedRaw && (updatedRaw.codigoProducto ?? updatedRaw.codigo)) || selectedProduct.codigo,
                            nombre: (updatedRaw && (updatedRaw.nombreProducto ?? updatedRaw.nombre)) || selectedProduct.nombre,
                            descripcion: (updatedRaw && (updatedRaw.descripcion ?? updatedRaw.descripcionProducto)) || selectedProduct.descripcion,
                            categoria: (updatedRaw && (updatedRaw.nombreCategoria ?? updatedRaw.categoria)) || selectedProduct.categoria,
                            idCategoria: (updatedRaw && (updatedRaw.idCategoria ?? updatedRaw.categoriaId)) ?? idCategoriaToSend ?? selectedProduct.idCategoria,
                            establecimiento: (updatedRaw && (updatedRaw.nombreEstablecimiento ?? updatedRaw.nombreComercial ?? updatedRaw.establecimiento)) || selectedProduct.establecimiento,
                            idEstablecimiento: (updatedRaw && (updatedRaw.idEstablecimiento ?? updatedRaw.establecimientoId)) ?? idEstablecimientoToSend ?? selectedProduct.idEstablecimiento,
                            precio: (updatedRaw && (updatedRaw.precioUnitario ?? updatedRaw.precio)) ?? selectedProduct.precio,
                            stock: (updatedRaw && (updatedRaw.stockActual ?? updatedRaw.stock)) ?? selectedProduct.stock,
                            unidadMedida: (updatedRaw && updatedRaw.unidadMedida) || selectedProduct.unidadMedida,
                            aplicaIva: (updatedRaw && (typeof updatedRaw.aplicaIva !== 'undefined' ? updatedRaw.aplicaIva : undefined)) ?? selectedProduct.aplicaIva,
                            activo: (updatedRaw && (typeof updatedRaw.activo !== 'undefined' ? updatedRaw.activo : undefined)) ?? selectedProduct.activo
                          };

                          // actualizar lista localmente: reemplazar item
                          setProductos(prev => prev.map(it => (it.id === selectedProduct.id ? ({ ...it, ...mappedUpdated }) : it)));

                          // forzar recarga desde el servidor para confirmar persistencia en DB
                          try {
                            await fetchProductos();
                            console.log('Productos recargados ');
                          } catch (e) {
                            console.warn('No se pudo recargar productos ', e);
                          }

                          toast.success('Producto actualizado');
                          setIsModalOpen(false);
                          setSelectedProduct(null);
                        } catch (err) {
                          console.error('Error actualizando producto', err);
                          toast.error('No se pudo actualizar el producto');
                        }
                      }}>Guardar</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal: crear producto */}
              {isCreateModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
                  <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Crear producto" onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                      <h3>Crear Producto</h3>
                      <button className={styles.modalCloseBtn} onClick={() => setIsCreateModalOpen(false)} aria-label="Cerrar">×</button>
                    </div>
                    <div className={styles.modalBody}>
                      <div className={styles.modalGrid}>
                        <div className={styles.field}>
                          <label className={styles.label}>Nombre</label>
                          <input className={styles.input} value={newProduct.nombreProducto} onChange={e => setNewProduct({...newProduct, nombreProducto: e.target.value})} />
                          {newProductErrors.nombreProducto && <div className={styles.errorText}>{newProductErrors.nombreProducto}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Código</label>
                          <input className={styles.input} value={newProduct.codigoProducto} onChange={e => setNewProduct({...newProduct, codigoProducto: e.target.value})} />
                          {newProductErrors.codigoProducto && <div className={styles.errorText}>{newProductErrors.codigoProducto}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Establecimiento</label>
                          <select
                            className={styles.input}
                            value={newProduct.idEstablecimiento ?? ''}
                            onChange={e => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              const found = establecimientos.find(x => Number(x.id) === Number(id));
                              setNewProduct({ ...newProduct, idEstablecimiento: id, establecimiento: found ? found.nombre : undefined });
                            }}
                          >
                            <option value="">Seleccione establecimiento</option>
                            {establecimientos.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                          {newProductErrors.idEstablecimiento && <div className={styles.errorText}>{newProductErrors.idEstablecimiento}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Categoría</label>
                          <select
                            className={styles.input}
                            value={newProduct.idCategoria ?? ''}
                            onChange={e => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              const found = categorias.find(x => Number(x.id) === Number(id));
                              setNewProduct({ ...newProduct, idCategoria: id, categoria: found ? found.nombre : undefined });
                            }}
                          >
                            <option value="">Seleccione categoría</option>
                            {categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                          {newProductErrors.idCategoria && <div className={styles.errorText}>{newProductErrors.idCategoria}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Precio</label>
                          <input type="number" className={styles.input} value={newProduct.precioUnitario ?? 0} onChange={e => setNewProduct({...newProduct, precioUnitario: Number(e.target.value)})} />
                          {newProductErrors.precioUnitario && <div className={styles.errorText}>{newProductErrors.precioUnitario}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Stock</label>
                          <input type="number" className={styles.input} value={newProduct.stockActual ?? 0} onChange={e => setNewProduct({...newProduct, stockActual: Number(e.target.value)})} />
                          {newProductErrors.stockActual && <div className={styles.errorText}>{newProductErrors.stockActual}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Unidad Medida</label>
                          <select
                            className={styles.input}
                            value={newProduct.unidadMedida || ''}
                            onChange={e => setNewProduct({ ...newProduct, unidadMedida: e.target.value })}
                          >
                            <option value="">Seleccione unidad de medida</option>
                            <option value="Kilogramo">Kilogramo (kg)</option>
                            <option value="Gramo">Gramo (g)</option>
                            <option value="Litro">Litro (L)</option>
                            <option value="Mililitro">Mililitro (ml)</option>
                            <option value="Unidad">Unidad</option>
                            <option value="Par">Par</option>
                            <option value="Metro">Metro (m)</option>
                            <option value="Pack">Pack</option>
                            <option value="Caja">Caja</option>
                            <option value="Pieza">Pieza</option>
                          </select>
                          {newProductErrors.unidadMedida && <div className={styles.errorText}>{newProductErrors.unidadMedida}</div>}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Aplica Iva</label>
                          <select
                            className={styles.input}
                            value={newProduct.aplicaIva === true ? 'si' : newProduct.aplicaIva === false ? 'no' : ''}
                            onChange={e => setNewProduct({ ...newProduct, aplicaIva: e.target.value === 'si' ? true : false })}
                          >
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>

                        <div className={`${styles.field} ${styles.fullWidth}`}>
                          <label className={styles.label}>Descripción</label>
                          <textarea className={styles.input} rows={4} value={newProduct.descripcion || ''} onChange={e => setNewProduct({...newProduct, descripcion: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button className={styles.cancelBtn} onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                      <button className={styles.saveBtn} disabled={isCreateDisabled} aria-disabled={isCreateDisabled} title={isCreateDisabled ? 'Complete los campos obligatorios' : 'Crear'} onClick={async () => {
                        try {
                          const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
                          const token = normalizeToken(rawToken);
                          const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
                          if (token) headers.Authorization = `Bearer ${token}`;

                          // simple validation
                          if (!newProduct.nombreProducto || !newProduct.codigoProducto) {
                            toast.error('Código y nombre son obligatorios');
                            return;
                          }

                          const payload = {
                            codigoProducto: newProduct.codigoProducto,
                            nombreProducto: newProduct.nombreProducto,
                            descripcion: newProduct.descripcion || '',
                            idCategoria: newProduct.idCategoria ?? null,
                            idEstablecimiento: newProduct.idEstablecimiento ?? null,
                            precioUnitario: Number(newProduct.precioUnitario) || 0,
                            stockActual: Number(newProduct.stockActual) || 0,
                            unidadMedida: newProduct.unidadMedida || '',
                            aplicaIva: !!newProduct.aplicaIva
                          };

                          const res = await fetch(ENDPOINTS.productos, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(payload)
                          });

                          const text = await res.text();
                          let json = null;
                          try { json = text ? JSON.parse(text) : null; } catch(e) { json = null; }

                          if (!res.ok) {
                            console.error('Create product failed', res.status, text);
                            toast.error(`Error creando producto: ${res.status}`);
                            return;
                          }

                          // refrescar lista
                          await fetchProductos();
                          toast.success('Producto creado');
                          setIsCreateModalOpen(false);
                          // resetear formulario
                          setNewProduct({ codigoProducto:'', nombreProducto:'', descripcion:'', idCategoria: null, idEstablecimiento: null, precioUnitario:0, stockActual:0, unidadMedida:'', aplicaIva:true });
                        } catch (err) {
                          console.error('Error creando producto', err);
                          toast.error('No se pudo crear el producto');
                        }
                      }}>Crear</button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  {`Mostrando ${Math.min((page - 1) * perPage + 1, productos.length)} a ${Math.min(page * perPage, productos.length)} de ${productos.length} resultados`}
                </div>
                <div className={styles.pageControls}>
                  <button className={styles.navBtn} onClick={() => setPage(1)} disabled={page === 1} aria-label="Primera">«</button>
                  <button className={styles.navBtn} onClick={() => setPage(s => Math.max(1, s - 1))} disabled={page === 1} aria-label="Anterior">‹</button>
                  {(() => {
                    const pages = [];
                    const start = Math.max(1, page - 2);
                    const end = Math.min(totalPages, page + 2);
                    for (let p = start; p <= end; p++) pages.push(p);
                    // agregar controles de salto si es necesario
                    if (start > 1) {
                      pages.unshift(1);
                      if (start > 2) pages.splice(1, 0, 'dots-start');
                    }
                    if (end < totalPages) {
                      if (end < totalPages - 1) pages.push('dots-end');
                      pages.push(totalPages);
                    }
                    return pages.map((p, i) => {
                      if (p === 'dots-start' || p === 'dots-end') return <span key={p + i} style={{padding:'0 6px', color:'#94a3b8'}}>…</span>;
                      return (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${page === p ? styles.active : ''}`}
                          onClick={() => setPage(p)}
                          aria-current={page === p ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      );
                    });
                  })()}
                  <button className={styles.navBtn} onClick={() => setPage(s => Math.min(totalPages, s + 1))} disabled={page === totalPages} aria-label="Siguiente">›</button>
                  <button className={styles.navBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Última">»</button>
                </div>
              </div>
            </>
          )}
        </div>

        <ToastContainer position="bottom-right" />
      </main>
    </div>
  );
}