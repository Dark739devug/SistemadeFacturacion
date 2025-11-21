"use client"

import React, { useEffect, useState, useMemo } from 'react';
import styles from './establecimientos.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// 🟢 IMPORTANTE: Importamos las rutas centralizadas
import ENDPOINTS from '../../services/api'; 

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
  try {
    const p = JSON.parse(t);
    if (typeof p === 'string') return p;
    return p.accessToken || p.token || p.jwt || p.access_token || null;
  } catch (e) {
    return t;
  }
}

export default function EstablecimientosPage() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nuevoEstablecimiento, setNuevoEstablecimiento] = useState({
    nit: '',
    nombreComercial: '',
    razonSocial: '',
    direccion: '',
    municipio: '',
    departamento: '',
    codigoPostal: '',
    telefono: '',
    email: '',
    codigoEstablecimiento: '',
    activoCertificador: false,
    activo: true
  });

  // Validaciones para el formulario de creación
  function isEmailValid(email) {
    if (!email) return false;
    return /^\S+@\S+\.\S+$/.test(String(email));
  }

  // Validación y sanitización para teléfono: permite solo dígitos y opcional '+' al inicio
  function isPhoneValid(phone) {
    if (!phone) return false;
    const s = String(phone).trim();
    // Debe ser '+' opcional seguido de 6-15 dígitos
    return /^\+?\d{6,15}$/.test(s);
  }

  function sanitizePhoneInput(raw) {
    if (raw == null) return '';
    const str = String(raw);
    // quitar todo lo que no sea dígito o '+'
    const cleaned = str.replace(/[^\d+]/g, '');
    // permitir '+' sólo al inicio
    const plusAtStart = cleaned.startsWith('+');
    const digitsOnly = cleaned.replace(/\+/g, '');
    return plusAtStart ? ('+' + digitsOnly) : digitsOnly;
  }

  const crearValido = useMemo(() => {
    const s = nuevoEstablecimiento || {};
    const required = ['nit','nombreComercial','razonSocial','direccion','municipio','departamento','codigoPostal','telefono','email','codigoEstablecimiento'];
    for (const k of required) {
      const v = s[k];
      if (v === null || typeof v === 'undefined') return false;
      if (String(v).trim() === '') return false;
    }
    if (!isEmailValid(s.email)) return false;
    if (!isPhoneValid(s.telefono)) return false;
    return true;
  }, [nuevoEstablecimiento]);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [establecimientoEditar, setEstablecimientoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [desactivandoId, setDesactivandoId] = useState(null);
  const [confirmarDesactivarId, setConfirmarDesactivarId] = useState(null);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [userRole, setUserRole] = useState(null);
  // false = mostrar activos (por defecto), true = mostrar sólo inactivos
  const [showInactivos, setShowInactivos] = useState(false);

  useEffect(() => {
    fetchEstablecimientos();
    try {
      const raw = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(raw);
      const role = getRoleFromToken(token);
      if (role != null) {
        const rnum = typeof role === 'number' ? role : (String(role).trim() && /^\d+$/.test(String(role).trim()) ? Number(String(role).trim()) : role);
        setUserRole(rnum);
      }
    } catch (e) { /* noop */ }
  }, []);

  // ajustar valor por defecto del toggle cuando cambie userRole
  useEffect(() => {
    if (userRole == null) return;
    // por defecto mostramos activos; mantener el toggle en false
    setShowInactivos(false);
  }, [userRole]);

  // Seguridad: impedir que se muestre el modal de creación si el usuario no es admin
  useEffect(() => {
    if (mostrarCrear && Number(userRole) !== 1) {
      // evitar mostrar el modal y notificar (no autorizado)
      setMostrarCrear(false);
      toast.warn('No autorizado para crear establecimientos');
    }
  }, [mostrarCrear, userRole]);

  // extraer rol del token (intenta JWT, JSON u otros storage keys)
  function getRoleFromToken(token) {
    try {
      if (token) {
        const parts = String(token).split('.');
        if (parts.length === 3) {
          const payload = parts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const json = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const obj = JSON.parse(json);
          const candidate = obj.idRol ?? obj.id_rol ?? obj.role ?? obj.roles ?? obj.rol ?? obj.roleId ?? obj.role_id ?? obj.scope ?? null;
          if (candidate != null) {
            if (typeof candidate === 'number') return candidate;
            if (typeof candidate === 'string') {
              const s = candidate.trim();
              if (/^\d+$/.test(s)) return Number(s);
              const lc = s.toLowerCase();
              if (lc.includes('admin')) return 1;
              if (lc.includes('fact')) return 2;
              return s;
            }
            if (Array.isArray(candidate) && candidate.length > 0) return candidate[0];
          }
        }

        try {
          const parsed = JSON.parse(token);
          if (parsed && (parsed.idRol || parsed.rol || parsed.role)) return parsed.idRol ?? parsed.rol ?? parsed.role;
          if (typeof parsed === 'string' || typeof parsed === 'number') return parsed;
        } catch (e) {
          if (/^\d+$/.test(String(token).trim())) return String(token).trim();
        }
      }
    } catch (e) { }

    const keys = ['rol','idRol','role','user','usuario','currentUser','session','auth','profile'];
    for (const k of keys) {
      try {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (!v) continue;
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
          const s = String(v).trim();
          if (/^\d+$/.test(s)) return Number(s);
          const lc = s.toLowerCase();
          if (lc.includes('admin')) return 1;
          if (lc.includes('fact')) return 2;
          return s;
        }
      } catch (e) {}
    }
    return null;
  }

  async function fetchEstablecimientos() {
    setCargando(true);
    try {
      const raw = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(raw);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // 🟢 USO DE ENDPOINTS.establecimientos (GET)
      const res = await fetch(ENDPOINTS.establecimientos, { headers });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      const mapped = items.map(i => ({
        id: i.idEstablecimiento ?? i.id ?? null,
        nit: i.nit ?? i.NIT ?? '',
        nombreComercial: i.nombreComercial ?? i.nombre ?? '',
        razonSocial: i.razonSocial ?? i.razon_social ?? '',
        direccion: i.direccion ?? '',
        municipio: i.municipio ?? '',
        departamento: i.departamento ?? '',
        codigoPostal: i.codigoPostal ?? i.codigo_postal ?? '',
        telefono: i.telefono ?? '',
        email: i.email ?? i.correo ?? '',
        codigoEstablecimiento: i.codigoEstablecimiento ?? i.codigoEstablecimiento ?? '',
        activoCertificador: !!i.activoCertificador,
        activo: typeof i.activo === 'undefined' ? true : !!i.activo
      }));
      // Ordenar por id ascendente, manejando nulos al final
      const sorted = mapped.slice().sort((a, b) => {
        if (a.id == null && b.id == null) return 0;
        if (a.id == null) return 1;
        if (b.id == null) return -1;
        return Number(a.id) - Number(b.id);
      });
      setEstablecimientos(sorted);
    } catch (e) {
      console.error('Error cargando establecimientos', e);
      toast.error('No se pudieron cargar establecimientos');
    } finally { setCargando(false); }
  }

  const filtrados = establecimientos.filter(e => {
    const matchesFiltro = (filtro.trim() === '' ||
      (e.nombreComercial || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.telefono || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.codigoPostal || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.departamento || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.codigoEstablecimiento || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.nit || '').toLowerCase().includes(filtro.toLowerCase()));

    // Si el usuario es rol 2 (facturador) ocultar registros inactivos
    if (Number(userRole) === 2) return matchesFiltro && !!e.activo;

    // Si es admin (rol 1), respetar el toggle: mostrar sólo inactivos cuando showInactivos=true
    if (Number(userRole) === 1) return matchesFiltro && (showInactivos ? !e.activo : !!e.activo);

    // Si es facturador (rol 2) o cualquier otro, por defecto mostrar sólo activos
    return matchesFiltro && !!e.activo;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const itemsPagina = filtrados.slice((pagina -1) * porPagina, pagina * porPagina);

  async function crearEstablecimiento() {
    // seguridad: solo admins pueden crear
    if (Number(userRole) !== 1) { toast.error('No autorizado'); return; }

    try {
      const raw = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(raw);
      const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

  // validar campos obligatorios (todos los campos requeridos)
  if (!crearValido) { toast.error('Por favor complete todos los campos correctamente'); return; }

      const payload = { ...nuevoEstablecimiento };
      
      // 🟢 USO DE ENDPOINTS.establecimientos (POST)
      const res = await fetch(ENDPOINTS.establecimientos, { method: 'POST', headers, body: JSON.stringify(payload) });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      toast.success('Establecimiento creado');
      setMostrarCrear(false);
      setNuevoEstablecimiento({ nit:'', nombreComercial:'', razonSocial:'', direccion:'', municipio:'', departamento:'', codigoPostal:'', telefono:'', email:'', codigoEstablecimiento:'', activoCertificador:false, activo:true });
      await fetchEstablecimientos();
    } catch (e) {
      console.error('Error crear establecimiento', e);
      toast.error('No se pudo crear establecimiento');
    }
  }

  async function abrirEditar(est) {
    // Solo admins pueden editar desde UI — doble check por seguridad
    if (Number(userRole) !== 1) { toast.error('No autorizado'); return; }
    setEstablecimientoEditar({ ...est });
    setMostrarEditar(true);
  }

  async function actualizarEstablecimiento() {
    if (!establecimientoEditar || !establecimientoEditar.id) {
      toast.error('Elemento inválido para actualización');
      return;
    }

    if (!establecimientoEditar.nombreComercial || !establecimientoEditar.nit) {
      toast.error('Nombre comercial y NIT son obligatorios');
      return;
    }

    try {
      setGuardando(true);
      const raw = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(raw);
      const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // preparar payload de actualización para la API
      const payload = {
        ...establecimientoEditar,
        activoCertificador: !!establecimientoEditar.activoCertificador,
        activo: typeof establecimientoEditar.activo === 'undefined' ? true : !!establecimientoEditar.activo
      };

      // 🟢 USO DE ENDPOINTS.establecimientoPorId (PUT)
      const res = await fetch(ENDPOINTS.establecimientoPorId(establecimientoEditar.id), {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      // intentar obtener el establecimiento actualizado desde la respuesta
      let updatedFromServer = null;
      try { updatedFromServer = await res.json(); } catch (e) { /* ignore if no json */ }

      const updatedItem = {
        id: updatedFromServer?.idEstablecimiento ?? updatedFromServer?.id ?? payload.id,
        nit: updatedFromServer?.nit ?? payload.nit,
        nombreComercial: updatedFromServer?.nombreComercial ?? updatedFromServer?.nombre ?? payload.nombreComercial,
        razonSocial: updatedFromServer?.razonSocial ?? updatedFromServer?.razon_social ?? payload.razonSocial,
        direccion: updatedFromServer?.direccion ?? payload.direccion,
        municipio: updatedFromServer?.municipio ?? payload.municipio,
        departamento: updatedFromServer?.departamento ?? payload.departamento,
        codigoPostal: updatedFromServer?.codigoPostal ?? updatedFromServer?.codigo_postal ?? payload.codigoPostal,
        telefono: updatedFromServer?.telefono ?? payload.telefono,
        email: updatedFromServer?.email ?? updatedFromServer?.correo ?? payload.email,
        codigoEstablecimiento: updatedFromServer?.codigoEstablecimiento ?? payload.codigoEstablecimiento,
        activoCertificador: typeof updatedFromServer?.activoCertificador === 'undefined' ? !!payload.activoCertificador : !!updatedFromServer.activoCertificador,
        activo: typeof updatedFromServer?.activo === 'undefined' ? !!payload.activo : !!updatedFromServer.activo
      };

      // actualizar estado localmente sin recargar toda la lista
      setEstablecimientos(prev => {
        const next = prev.map(item => (item.id === (establecimientoEditar.id) ? { ...item, ...updatedItem } : item));
        next.sort((a, b) => {
          if (a.id == null && b.id == null) return 0;
          if (a.id == null) return 1;
          if (b.id == null) return -1;
          return Number(a.id) - Number(b.id);
        });
        return next;
      });

      toast.success('Establecimiento actualizado');
      setMostrarEditar(false);
      setEstablecimientoEditar(null);
    } catch (e) {
      console.error('Error actualizando establecimiento', e);
      toast.error('No se pudo actualizar establecimiento');
    } finally { setGuardando(false); }
  }

  // abrir modal de confirmación 
  function abrirConfirmarDesactivar(id) {
    if (!id) return;
    setConfirmarDesactivarId(id);
    setMostrarConfirmar(true);
  }

  async function desactivarEstablecimiento(id) {
    // realiza la llamada PATCH para desactivar el establecimiento
    if (!id) return;
    try {
      setDesactivandoId(id);
      const raw = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(raw);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // 🟢 USO DE ENDPOINTS.desactivarEstablecimiento (PATCH)
      const res = await fetch(ENDPOINTS.desactivarEstablecimiento(id), { method: 'PATCH', headers });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      // Actualizar estado localmente sin recargar toda la lista 
      setEstablecimientos(prev => prev.map(item => (item.id === id ? { ...item, activo: false } : item)));
      toast.success('Establecimiento desactivado');
    } catch (e) {
      console.error('Error desactivando establecimiento', e);
      toast.error('No se pudo desactivar el establecimiento');
    } finally {
      setDesactivandoId(null);
      setConfirmarDesactivarId(null);
      setMostrarConfirmar(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.encabezado}>
        <h1>Gestión de Establecimientos</h1>
        {Number(userRole) === 1 && (
          <button className={styles.crearBtn} onClick={() => setMostrarCrear(true)}>+ Crear Establecimiento</button>
        )}
        </header>
        
        <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <input className={styles.search} placeholder="Buscar por nombre, NIT..." value={filtro} onChange={e => { setFiltro(e.target.value); setPagina(1); }} />
            </div>
            {Number(userRole) === 1 && (
              <div className={styles.filterControl} style={{marginLeft:12}}>
                  <label className={styles.switchLabel} htmlFor="showInactive" style={{marginRight:8,fontSize:'0.9rem',color:'#0b2a4a'}}>Estado</label>
                  <label className={styles.switch}>
                    <input type="checkbox" id="showInactive" checked={showInactivos} onChange={e => setShowInactivos(e.target.checked)} aria-label="Alternar mostrar sólo inactivos" />
                    <span className={styles.slider}></span>
                  </label>
                  {showInactivos && <span className={styles.filterBadge}>INACTIVOS</span>}
                </div>
            )}
        </div>
      
      
      <section className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>No</th>
              <th>NIT</th>
              <th>Nombre Comercial</th>
              <th>Razón Social</th>
              <th>Teléfono</th>
              <th>Codigo Postal</th>
              <th>Email</th>
              <th>Departamento</th>
              <th>Codigo Establecimiento</th>
              <th>Certificador</th>
              <th>Estado</th>
              {Number(userRole) === 1 && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={Number(userRole) === 1 ? 12 : 11} className={styles.cargando}>Cargando...</td></tr>
            ) : itemsPagina.length === 0 ? (
              <tr><td colSpan={Number(userRole) === 1 ? 12 : 11} className={styles.empty}>No hay establecimientos</td></tr>
            ) : (
              itemsPagina.map(est => (
                <tr key={est.id ?? est.codigoEstablecimiento}>
                  <td>{est.id ?? '-'}</td>
                  <td>{est.nit || '-'}</td>
                  <td className={styles.nombreComercial}>{est.nombreComercial || '-'}</td>
                  <td>{est.razonSocial || '-'}</td>
                  <td>{est.telefono || '-'}</td>
                  <td>{est.codigoPostal || '-'}</td>
                  <td>{est.email || '-'}</td>
                  <td>{est.departamento || '-'}</td>
                  <td>{est.codigoEstablecimiento || '-'}</td>
                  <td><span className={`${styles.badge} ${est.activoCertificador ? styles.activo : styles.inactivo}`}>{est.activoCertificador ? 'Activo' : 'Inactivo'}</span></td>
                  <td><span className={`${styles.badge} ${est.activo ? styles.activo : styles.inactivo}`}>{est.activo ? 'Activo' : 'Inactivo'}</span></td>
                  {Number(userRole) === 1 && (
                    <td className={styles.actionsCol}>
                      <button onClick={() => abrirEditar(est)} className={`${styles.iconBtn} ${styles.actionBtn}`} title="Editar" aria-label="Editar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                          <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                        </svg>
                      </button>
                      <button className={`${styles.iconBtnDanger} ${styles.actionBtnDanger}`} title="Desactivar" aria-label="Desactivar" onClick={() => abrirConfirmarDesactivar(est.id)} disabled={desactivandoId === est.id}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M3 6h18" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          <path d="M10 11v6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 11v6" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 6l1-2h4l1 2" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.paginacionBar}>
          <div className={styles.paginacionInfo}>Mostrando {Math.min((pagina -1)*porPagina + 1, filtrados.length)}-{Math.min(pagina*porPagina, filtrados.length)} de {filtrados.length}</div>
          <div className={styles.paginacionControls}>
            <button className={styles.pageBtn} onClick={() => setPagina(1)} disabled={pagina === 1} aria-label="Primera">«</button>
            <button className={styles.pageBtn} onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina === 1} aria-label="Anterior">‹</button>

            {Array.from({ length: totalPaginas }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${pagina === p ? styles.pageBtnActive : ''}`}
                  onClick={() => setPagina(p)}
                  aria-current={pagina === p ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}

            <button className={styles.pageBtn} onClick={() => setPagina(p => Math.min(totalPaginas, p+1))} disabled={pagina === totalPaginas} aria-label="Siguiente">›</button>
            <button className={styles.pageBtn} onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas} aria-label="Última">»</button>
          </div>
        </div>
      </section>

      {mostrarCrear && (
        <div className={styles.modalOverlay} onClick={() => setMostrarCrear(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h3>Crear Establecimiento</h3><button className={styles.modalClose} onClick={() => setMostrarCrear(false)}>×</button></div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <label>Nombre Comercial<input value={nuevoEstablecimiento.nombreComercial} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, nombreComercial: e.target.value})} /></label>
                <label>NIT<input value={nuevoEstablecimiento.nit} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, nit: e.target.value})} /></label>
                <label>Razón Social<input value={nuevoEstablecimiento.razonSocial} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, razonSocial: e.target.value})} /></label>
                <label>Teléfono<input value={nuevoEstablecimiento.telefono} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, telefono: sanitizePhoneInput(e.target.value)})} placeholder="+502" /></label>
                <label>Email<input value={nuevoEstablecimiento.email} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, email: e.target.value})} /></label>
                <label>Dirección<input value={nuevoEstablecimiento.direccion} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, direccion: e.target.value})} /></label>
                <label>Municipio<input value={nuevoEstablecimiento.municipio} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, municipio: e.target.value})} /></label>
                <label>Departamento<input value={nuevoEstablecimiento.departamento} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, departamento: e.target.value})} /></label>
                <label>Codigo Postal<input value={nuevoEstablecimiento.codigoPostal} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, codigoPostal: e.target.value})} /></label>
                <label>Codigo Establecimiento <input value={nuevoEstablecimiento.codigoEstablecimiento} onChange={e => setNuevoEstablecimiento({...nuevoEstablecimiento, codigoEstablecimiento: e.target.value})} /></label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setMostrarCrear(false)}>Cancelar</button>
              <button className={styles.saveBtn} onClick={crearEstablecimiento} disabled={!crearValido} aria-disabled={!crearValido} title={!crearValido ? 'Complete todos los campos para habilitar' : 'Crear establecimiento'}>Crear</button>
            </div>
          </div>
        </div>
      )}
      {mostrarEditar && establecimientoEditar && (
        <div className={styles.modalOverlay} onClick={() => { setMostrarEditar(false); setEstablecimientoEditar(null); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h3>Editar Establecimiento</h3><button className={styles.modalClose} onClick={() => { setMostrarEditar(false); setEstablecimientoEditar(null); }}>×</button></div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <label>Nombre Comercial<input value={establecimientoEditar.nombreComercial || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, nombreComercial: e.target.value})} /></label>
                <label>NIT<input value={establecimientoEditar.nit || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, nit: e.target.value})} /></label>
                <label>Codigo Postal<input value={establecimientoEditar.codigoPostal || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, codigoPostal: e.target.value})} /></label>
                <label>Razón Social<input value={establecimientoEditar.razonSocial || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, razonSocial: e.target.value})} /></label>
                <label>Teléfono<input value={establecimientoEditar.telefono || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, telefono: sanitizePhoneInput(e.target.value)})} placeholder="+50212345678" /></label>
                <label>Email<input value={establecimientoEditar.email || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, email: e.target.value})} /></label>
                <label>Codigo Establecimiento <input value={establecimientoEditar.codigoEstablecimiento || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, codigoEstablecimiento: e.target.value})} /></label>
                <label>Dirección<input value={establecimientoEditar.direccion || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, direccion: e.target.value})} /></label>
                <label>Municipio<input value={establecimientoEditar.municipio || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, municipio: e.target.value})} /></label>
                <label>Departamento<input value={establecimientoEditar.departamento || ''} onChange={e => setEstablecimientoEditar({...establecimientoEditar, departamento: e.target.value})} /></label>  
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setMostrarEditar(false); setEstablecimientoEditar(null); }}>Cancelar</button>
              <button className={styles.saveBtn} onClick={actualizarEstablecimiento} disabled={guardando} aria-busy={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmar && (
        <div className={styles.confirmOverlay} onClick={() => { setMostrarConfirmar(false); setConfirmarDesactivarId(null); }}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirmar desactivación">
            <div className={styles.confirmHeader}>
              <h3>Confirmar desactivación</h3>
            </div>
            <div className={styles.confirmBody}>
              <p>¿Deseas desactivar este establecimiento?</p>
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmBtnCancel} onClick={() => { setMostrarConfirmar(false); setConfirmarDesactivarId(null); }}>Cancelar</button>
              <button className={styles.confirmBtnPrimary} onClick={() => desactivarEstablecimiento(confirmarDesactivarId)} disabled={desactivandoId === confirmarDesactivarId}>{desactivandoId === confirmarDesactivarId ? 'Desactivando...' : 'Aceptar'}</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
}