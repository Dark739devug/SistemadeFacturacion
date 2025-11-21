'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './facturacion.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClienteModal from './ClienteModal';
import DireccionModal from './DireccionModal';
import Toggle from '@/app/components/Toggle';
// 🟢 IMPORTANTE: Importamos las rutas centralizadas
import ENDPOINTS from '../../services/api'; 

function limpiarToken(tokenSucio) {
  if (!tokenSucio) return null;
  let token = String(tokenSucio);

  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1);
  }
  
  try {
    const objetoParseado = JSON.parse(token);
    if (typeof objetoParseado === 'string') return objetoParseado;
    if (objetoParseado.accessToken) return objetoParseado.accessToken;
    if (objetoParseado.token) return objetoParseado.token;
    if (objetoParseado.jwt) return objetoParseado.jwt;
    if (objetoParseado.access_token) return objetoParseado.access_token;
    return null;
  } catch {
    
  }
  return token;
}

function obtenerDatosUsuario() {
  try {
    const nombre = localStorage.getItem('nombre');
    const email = localStorage.getItem('email');
    const rol = localStorage.getItem('rol');
    const token = localStorage.getItem('accessToken');
    
    if (!nombre && !email && !rol) {
      return null;
    }
    
    const datosUsuario = {
      nombre: nombre || '',
      email: email || '',
      rol: rol || '',
      token: token || ''
    };
    
    return datosUsuario;
    
  } catch (error) {
    return null;
  }
}

function obtenerRolUsuario() {
  const datos = obtenerDatosUsuario();
  if (!datos) {
    return null;
  }
  
  return datos.rol;
}


const PERMISOS_POR_ROL = {
  'Facturación': {
    puedeVer: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: false,
    puedeDesactivar: false,
    
  },
  
  'admin': {
    puedeVer: true,
    puedeCrear: true,
    puedeEditar: true,
    puedeEliminar: true,
    puedeDesactivar: true,
  },
};

function calcularPermisos() {
  
  const rolUsuario = obtenerRolUsuario();
  
  let permisos = {
    puedeVer: false,
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeDesactivar: false,
  };
  
  if (rolUsuario) {
    let permisosRol = PERMISOS_POR_ROL[rolUsuario];
    
    if (!permisosRol) {
      const rolMinusculas = String(rolUsuario).toLowerCase().trim();
      permisosRol = PERMISOS_POR_ROL[rolMinusculas];
    }
    
    if (permisosRol) {
      permisos = { ...permisos, ...permisosRol };
    }
  }
  
  return permisos;
}


export default function Clientes() {
  const router = useRouter();
  
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;
  const [mensajeError, setMensajeError] = useState(null);
  
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  
  const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);
  const [clienteParaDireccion, setClienteParaDireccion] = useState(null);
  
  const [permisosUsuario, setPermisosUsuario] = useState({
    puedeVer: false,
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeDesactivar: false,
  });


  useEffect(() => {
    const permisos = calcularPermisos();
    setPermisosUsuario(permisos);
    
    const datosUsuario = obtenerDatosUsuario();
   
    
    if (permisos.puedeVer) {
      cargarClientes(filtroEstado);
    } else {
      setMensajeError('No tiene permisos para ver clientes.');
      toast.error('No tiene permisos para acceder a esta sección.');
    }
  }, []);

  useEffect(() => {
    if (permisosUsuario.puedeVer) {
      cargarClientes(filtroEstado);
      setPaginaActual(1);
    }
  }, [filtroEstado]);


  async function cargarClientes(estadoFiltro = 'Todos') {
    setCargando(true);
    setMensajeError(null);
    
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || 
                            localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { Accept: 'application/json' };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      // 🟢 USO DE ENDPOINTS
      let url = ENDPOINTS.clientes;
      if (estadoFiltro === 'Activados') {
        url = ENDPOINTS.clientesActivos;
      }

      const respuesta = await fetch(url, { headers: cabeceras });

      if (!respuesta.ok) {
        if (respuesta.status === 401 || respuesta.status === 403) {
          toast.error('No autorizado. Por favor inicie sesión.');
          router.push('/login');
          return;
        }
        const textoError = await respuesta.text();
        throw new Error(textoError || `Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      const listaClientes = Array.isArray(datos) ? datos : (datos.items || []);
      setClientes(listaClientes);
    } catch (error) {
      toast.error('Error cargando clientes.');
      setMensajeError('No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    if (!textoBusqueda) return clientes;
    const busqueda = textoBusqueda.toLowerCase();
    return clientes.filter(cliente =>
      (cliente.nit || '').toLowerCase().includes(busqueda) ||
      (cliente.razonSocial || '').toLowerCase().includes(busqueda) ||
      (cliente.email || '').toLowerCase().includes(busqueda) ||
      (cliente.municipio || '').toLowerCase().includes(busqueda) ||
      (cliente.departamento || '').toLowerCase().includes(busqueda)
    );
  }, [clientes, textoBusqueda]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / clientesPorPagina));
  const clientesPaginaActual = clientesFiltrados.slice(
    (paginaActual - 1) * clientesPorPagina, 
    paginaActual * clientesPorPagina
  );

  async function cambiarEstadoCliente(id, nuevoEstado) {
    if (!permisosUsuario.puedeDesactivar) {
      toast.error('No tiene permisos para cambiar el estado de clientes.');
      return;
    }

    try {
      const tokenGuardado = localStorage.getItem('accessToken') || 
                            localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { 
        'Content-Type': 'application/json', 
        Accept: 'application/json' 
      };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      // 🟢 USO DE ENDPOINTS: desactivarCliente(id)
      const url = ENDPOINTS.desactivarCliente(id);

      const respuesta = await fetch(url, { 
        method: 'PATCH', 
        headers: cabeceras,
        body: JSON.stringify({ activo: nuevoEstado })
      });
      
      if (!respuesta.ok) {
        if (respuesta.status === 403) {
          toast.error('No tiene permisos para cambiar el estado de clientes.');
          return;
        }
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      toast.success(`Cliente ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      
      setClientes(clientesAnteriores => 
        clientesAnteriores.map(c => 
          c.idCliente === id ? { ...c, activo: nuevoEstado } : c
        )
      );
    } catch (error) {
      toast.error('No se pudo cambiar el estado del cliente.');
    }
  }

  async function eliminarCliente(id) {
    if (!permisosUsuario.puedeEliminar) {
      toast.error('No tiene permisos para eliminar clientes.');
      return;
    }

    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || 
                            localStorage.getItem('token');
      const token = limpiarToken(tokenGuardado);

      const cabeceras = { 
        'Content-Type': 'application/json', 
        Accept: 'application/json' 
      };
      if (token) cabeceras.Authorization = `Bearer ${token}`;

      if (!token) {
        toast.error('No autorizado. Por favor inicie sesión.');
        router.push('/login');
        return;
      }

      // 🟢 USO DE ENDPOINTS: clientePorId(id) para DELETE
      const url = ENDPOINTS.clientePorId(id);

      const respuesta = await fetch(url, { 
        method: 'DELETE', 
        headers: cabeceras 
      });
      
      if (!respuesta.ok) {
        if (respuesta.status === 403) {
          toast.error('No tiene permisos para eliminar clientes.');
          return;
        }
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      toast.success('Cliente eliminado exitosamente');
      setClientes(clientesAnteriores => clientesAnteriores.filter(c => c.idCliente !== id));
    } catch (error) {
      toast.error('No se pudo eliminar el cliente.');
    }
  }

  const abrirModalNuevo = () => {
    if (!permisosUsuario.puedeCrear) {
      toast.error('No tiene permisos para crear clientes.');
      return;
    }
    setClienteParaEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cliente) => {
    if (!permisosUsuario.puedeEditar) {
      toast.error('No tiene permisos para editar clientes.');
      return;
    }
    setClienteParaEditar(cliente);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setClienteParaEditar(null);
  };

  const abrirModalDireccion = (cliente) => {
    setClienteParaDireccion(cliente);
    setModalDireccionAbierto(true);
  };

  const cerrarModalDireccion = () => {
    setModalDireccionAbierto(false);
    setClienteParaDireccion(null);
  };

  const alGuardarEnModal = (clienteGuardado) => {
    if (clienteParaEditar) {
      setClientes(clientesAnteriores => 
        clientesAnteriores.map(c => c.idCliente === clienteGuardado.idCliente ? clienteGuardado : c)
      );
    } else {
      setClientes(clientesAnteriores => [clienteGuardado, ...clientesAnteriores]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Clientes</h1>
        <div className={styles.Contenedorboton}>
          {permisosUsuario.puedeCrear && (
            <button 
              className={styles.boton} 
              onClick={abrirModalNuevo}
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
          )}
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.inputGroup}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={styles.inputIcon}
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>

         <input
          type="search"
          placeholder="Buscar por NIT, razón social, email..."
          className={styles.input}
          value={textoBusqueda}
          onChange={evento => { 
            setTextoBusqueda(evento.target.value); 
            setPaginaActual(1); 
          }}
        />  
        </div>
       
        <select 
          className={styles.select}
          value={filtroEstado}
          onChange={(evento) => {
            setFiltroEstado(evento.target.value);
          }}
        >
          <option value="Todos">Todos los clientes</option>
          <option value="Activados">Activados</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {cargando ? (
          <div className={styles.loader}>Cargando clientes...</div>
        ) : mensajeError ? (
          <div className={styles.error}>{mensajeError}</div>
        ) : (
          <>
            <table className={styles.factura}>
              <thead>
                <tr>
                  <th>NIT</th>
                  <th>Razón Social</th>
                  <th>Ubicación</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  
                  {(permisosUsuario.puedeEditar || permisosUsuario.puedeEliminar || permisosUsuario.puedeDesactivar)  && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clientesPaginaActual.length === 0 ? (
                  <tr>
                    <td colSpan={(permisosUsuario.puedeEditar || permisosUsuario.puedeEliminar) ? "7" : "6"} className={styles.empty}>
                      No hay resultados
                    </td>
                  </tr>
                ) : (
                  clientesPaginaActual.map((cliente) => (
                    <tr key={cliente.idCliente}>
                      <td><strong>{cliente.nit}</strong></td>
                      <td>{cliente.razonSocial}</td>
                      <td>
                        <button 
                          className={styles.verDetalleBtn}
                          onClick={() => abrirModalDireccion(cliente)}
                          title="Ver dirección completa"
                        >
                          Ver detalles
                        </button>
                      </td>
                      <td>{cliente.telefono || '-'}</td>
                      <td>{cliente.email || '-'}</td>
                      <td>
                        <span className={cliente.activo ? styles.statusActive : styles.statusInactive}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      
                      {(permisosUsuario.puedeEditar || permisosUsuario.puedeEliminar) && (
                        <td className={styles.actionsCol}>
                          {permisosUsuario.puedeEditar && (
                            <button 
                              className={styles.iconBtn} 
                              onClick={() => abrirModalEditar(cliente)}
                              title="Editar cliente"
                            >
                              <svg width={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#0b2a4a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#0b2a4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                            </button>
                          )}
                          
                          {permisosUsuario.puedeEliminar && (
                            <button 
                              className={styles.iconBtnDanger} 
                              onClick={() => eliminarCliente(cliente.idCliente)}
                              title="Eliminar cliente"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 7l16 0" /><path d="M10 11l0 6" />
                                <path d="M14 11l0 6" />
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                              </svg>
                            </button>
                          )}
                          {permisosUsuario.puedeDesactivar && (<Toggle
                        activo={cliente.activo}
                        onChange={(nuevoEstado) => cambiarEstadoCliente(cliente.idCliente, nuevoEstado)}
                        disabled={!permisosUsuario.puedeDesactivar}/>)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              {`Mostrando ${Math.min((paginaActual - 1) * clientesPorPagina + 1, clientesFiltrados.length)} a ${Math.min(paginaActual * clientesPorPagina, clientesFiltrados.length)} de ${clientesFiltrados.length} resultados`}
            </div>
            
            <div className={styles.pageControls}>
              <button 
                className={styles.navBtn} 
                onClick={() => setPaginaActual(1)} 
                disabled={paginaActual === 1}
                aria-label="Primera página"
              >
                «
              </button>
              
              <button 
                className={styles.navBtn} 
                onClick={() => setPaginaActual(anterior => Math.max(1, anterior - 1))} 
                disabled={paginaActual === 1}
                aria-label="Página anterior"
              >
                ‹
              </button>
              
              {(() => {
                const pages = [];
                const start = Math.max(1, paginaActual - 2);
                const end = Math.min(totalPaginas, paginaActual + 2);
                
                for (let p = start; p <= end; p++) {
                  pages.push(p);
                }
                
                if (start > 1) {
                  pages.unshift(1);
                  if (start > 2) {
                    pages.splice(1, 0, 'dots-start');
                  }
                }
                
                if (end < totalPaginas) {
                  if (end < totalPaginas - 1) {
                    pages.push('dots-end');
                  }
                  pages.push(totalPaginas);
                }
                
                return pages.map((p, i) => {
                  if (p === 'dots-start' || p === 'dots-end') {
                    return (
                      <span 
                        key={p + i} 
                        style={{ padding: '0 6px', color: '#94a3b8' }}
                      >
                        …
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${paginaActual === p ? styles.active : ''}`}
                      onClick={() => setPaginaActual(p)}
                      aria-current={paginaActual === p ? 'page' : undefined}
                      aria-label={`Página ${p}`}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
              
              <button 
                className={styles.navBtn} 
                onClick={() => setPaginaActual(anterior => Math.min(totalPaginas, anterior + 1))} 
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
              >
                ›
              </button>
              
              <button 
                className={styles.navBtn} 
                onClick={() => setPaginaActual(totalPaginas)} 
                disabled={paginaActual === totalPaginas}
                aria-label="Última página"
              >
                »
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <ClienteModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        cliente={clienteParaEditar}
        onSuccess={alGuardarEnModal}
        canCreate={permisosUsuario.puedeCrear}
        canEdit={permisosUsuario.puedeEditar}
      />

      <DireccionModal
        isOpen={modalDireccionAbierto}
        onClose={cerrarModalDireccion}
        cliente={clienteParaDireccion}
      />

      <ToastContainer position="bottom-right" />
    </div>
  );
}