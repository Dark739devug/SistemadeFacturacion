'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './crear-factura-modal.module.css';

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
    if (parsed.token) return parsed.token;
    if (parsed.accessToken) return parsed.accessToken;
    return null;
  } catch {}
  return t;
}

function getUserIdFromStorage() {
  try {
    const stored = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.idUsuario) {
        console.log('✅ ID Usuario encontrado directamente en localStorage:', parsed.idUsuario);
        return parsed.idUsuario;
      }
    }
  } catch (e) {
  }
  return null;
}

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
}

export default function CrearFacturaModal({ isOpen, onClose, onSuccess }) {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const tiposDocumento = [
    { id: 1, codigo: 'FACT', nombre: 'Factura' },
    { id: 2, codigo: 'NCRE', nombre: 'Nota de Crédito' },
    { id: 3, codigo: 'NDEB', nombre: 'Nota de Débito' }
  ];
  
  const [productos, setProductos] = useState([]);
  
  const [nitEstablecimiento, setNitEstablecimiento] = useState('');
  const [establecimientoEncontrado, setEstablecimientoEncontrado] = useState(null);
  const [buscandoEstablecimiento, setBuscandoEstablecimiento] = useState(false);
  
  const [nitCliente, setNitCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  
  const [formData, setFormData] = useState({
    idTipoDocumento: '',
    observaciones: '',
    detalles: []
  });

  const [detalleTemp, setDetalleTemp] = useState({
    idProducto: '',
    cantidad: 1,
    descuento: 0
  });

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
      setPaso(1);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      idTipoDocumento: '',
      observaciones: '',
      detalles: []
    });
    setDetalleTemp({
      idProducto: '',
      cantidad: 1,
      descuento: 0
    });
    setNitEstablecimiento('');
    setEstablecimientoEncontrado(null);
    setNitCliente('');
    setClienteEncontrado(null);
  };

  async function cargarDatos() {
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const respProductos = await fetch(`${API_BASE}/api/productos`, { headers });

      if (respProductos.ok) {
        const data = await respProductos.json();
        setProductos(Array.isArray(data) ? data : data.items || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  async function buscarEstablecimientoPorNIT() {
    if (!nitEstablecimiento.trim()) {
      toast.error('Ingrese un NIT');
      return;
    }

    setBuscandoEstablecimiento(true);
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const url = `${API_BASE}/api/establecimientos/nit/${encodeURIComponent(nitEstablecimiento.trim())}`;
      console.log('Buscando establecimiento en:', url);
      
      const res = await fetch(url, { headers });

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('No se encontró establecimiento con ese NIT');
          setEstablecimientoEncontrado(null);
          return;
        }
        const errorText = await res.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`HTTP ${res.status}`);
      }

      const establecimiento = await res.json();
      setEstablecimientoEncontrado(establecimiento);
      toast.success('Establecimiento encontrado');
    } catch (error) {
      console.error('Error buscando establecimiento:', error);
      toast.error('Error al buscar establecimiento');
      setEstablecimientoEncontrado(null);
    } finally {
      setBuscandoEstablecimiento(false);
    }
  }

  async function buscarClientePorNIT() {
    if (!nitCliente.trim()) {
      toast.error('Ingrese un NIT');
      return;
    }

    setBuscandoCliente(true);
    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const url = `${API_BASE}/api/clientes/nit/${encodeURIComponent(nitCliente.trim())}`;
      console.log('Buscando cliente en:', url);

      const res = await fetch(url, { headers });

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('No se encontró cliente con ese NIT');
          setClienteEncontrado(null);
          return;
        }
        const errorText = await res.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`HTTP ${res.status}`);
      }

      const cliente = await res.json();
      setClienteEncontrado(cliente);
      toast.success('Cliente encontrado');
    } catch (error) {
      console.error('Error buscando cliente:', error);
      toast.error('Error al buscar cliente');
      setClienteEncontrado(null);
    } finally {
      setBuscandoCliente(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarDetalle = () => {
    if (!detalleTemp.idProducto) {
      toast.error('Seleccione un producto');
      return;
    }
    if (detalleTemp.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const producto = productos.find(p => 
      (p.idProducto || p.id) === parseInt(detalleTemp.idProducto)
    );
    
    if (!producto) {
      toast.error('Producto no encontrado');
      return;
    }

    const nuevoDetalle = {
      idProducto: parseInt(detalleTemp.idProducto),
      codigoProducto: producto.codigoProducto || '',
      nombreProducto: producto.nombreProducto || producto.nombre || '',
      cantidad: parseInt(detalleTemp.cantidad),
      precioUnitario: parseFloat(producto.precioUnitario || producto.precio || 0),
      descuento: parseFloat(detalleTemp.descuento) || 0,
      aplicaIva: producto.aplicaIva !== undefined ? producto.aplicaIva : true
    };

    nuevoDetalle.subtotal = nuevoDetalle.cantidad * nuevoDetalle.precioUnitario;
    nuevoDetalle.totalDescuento = nuevoDetalle.subtotal * (nuevoDetalle.descuento / 100);
    nuevoDetalle.subtotalConDescuento = nuevoDetalle.subtotal - nuevoDetalle.totalDescuento;
    nuevoDetalle.totalIva = nuevoDetalle.aplicaIva ? (nuevoDetalle.subtotalConDescuento * 0.12) : 0;
    nuevoDetalle.total = nuevoDetalle.subtotalConDescuento + nuevoDetalle.totalIva;

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle]
    }));

    setDetalleTemp({
      idProducto: '',
      cantidad: 1,
      descuento: 0
    });

    toast.success('Producto agregado');
  };

  const eliminarDetalle = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
    toast.info('Producto eliminado');
  };

  const calcularTotales = () => {
    const subtotal = formData.detalles.reduce((sum, det) => sum + det.subtotal, 0);
    const totalDescuentos = formData.detalles.reduce((sum, det) => sum + det.totalDescuento, 0);
    const subtotalConDescuento = subtotal - totalDescuentos;
    const totalIva = formData.detalles.reduce((sum, det) => sum + det.totalIva, 0);
    const totalFactura = subtotalConDescuento + totalIva;

    return { subtotal, totalDescuentos, subtotalConDescuento, totalIva, totalFactura };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!establecimientoEncontrado) {
      toast.error('Debe buscar y seleccionar un establecimiento');
      return;
    }

    if (!clienteEncontrado) {
      toast.error('Debe buscar y seleccionar un cliente');
      return;
    }

    if (!formData.idTipoDocumento) {
      toast.error('Debe seleccionar un tipo de documento');
      return;
    }

    if (formData.detalles.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    setLoading(true);

    try {
      const tokenGuardado = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const token = normalizeToken(tokenGuardado);
      
      console.log('🔑 Token guardado:', tokenGuardado ? 'Existe' : 'No existe');
      console.log('🔑 Token normalizado:', token ? `${token.substring(0, 30)}...` : 'No existe');
      
      if (!token) {
        toast.error('No se encontró token de autenticación. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      let idUsuario = getUserIdFromStorage();
      
      if (!idUsuario) {
        const decodedToken = decodeJWT(token);
        console.log('👤 Token JWT decodificado:', decodedToken);
        
        if (decodedToken) {
          idUsuario = decodedToken.idUsuario || 
                      decodedToken.userId || 
                      decodedToken.user_id || 
                      decodedToken.id ||
                      decodedToken.sub;
          
          if (typeof idUsuario === 'string' && idUsuario.includes('@')) {
            idUsuario = decodedToken.idUsuario || decodedToken.userId || decodedToken.user_id || decodedToken.id;
          }
          
          console.log('👤 ID Usuario extraído del JWT:', idUsuario);
        }
      }
      
      if (!idUsuario) {
        toast.error('No se pudo obtener el ID del usuario. Contacta al administrador.');
        console.error('❌ No se encontró idUsuario en localStorage ni en el token JWT');
        setLoading(false);
        return;
      }
      
      console.log('✅ ID Usuario final a usar:', idUsuario);
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const payload = {
        idEstablecimiento: establecimientoEncontrado.idEstablecimiento || establecimientoEncontrado.id,
        idCliente: clienteEncontrado.idCliente || clienteEncontrado.id,
        idTipoDocumento: parseInt(formData.idTipoDocumento),
        idUsuarioCreacion: parseInt(idUsuario),
        observaciones: formData.observaciones || "",
        detalles: formData.detalles.map(det => ({
          idProducto: det.idProducto,
          cantidad: det.cantidad,
          descuento: det.descuento
        }))
      };

      console.log('Enviando payload:', JSON.stringify(payload, null, 2));
      console.log('Headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'No hay token'
      });

      const res = await fetch(`${API_BASE}/api/facturas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      console.log('📡 Respuesta del servidor:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error del servidor:', errorText);
        
        if (res.status === 401) {
          toast.error('Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.', {
            autoClose: 5000
          });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          
          throw new Error('Sesión expirada');
        }
        
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const savedFactura = await res.json();
      console.log('✅ Factura creada exitosamente:', savedFactura);
      toast.success('Factura creada exitosamente');
      
      onClose();
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(savedFactura);
        }, 100);
      }
    } catch (err) {
      console.error('Error creando factura:', err);
      toast.error('Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totales = calcularTotales();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Nueva Factura</h1>
            <p className={styles.subtitle}>Paso {paso} de 3</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${paso >= 1 ? styles.stepActive : ''}`}>
            <span>1</span>
            <label>Establecimiento y Cliente</label>
          </div>
          <div className={`${styles.step} ${paso >= 2 ? styles.stepActive : ''}`}>
            <span>2</span>
            <label>Productos</label>
          </div>
          <div className={`${styles.step} ${paso >= 3 ? styles.stepActive : ''}`}>
            <span>3</span>
            <label>Resumen</label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formContainer}>
            {paso === 1 && (
              <div className={styles.stepContent}>
                <h3 className={styles.sectionTitle}>Información General</h3>

                <div className={styles.fieldGroup}>
                  <label>Tipo de Documento *</label>
                  <select
                    name="idTipoDocumento"
                    value={formData.idTipoDocumento}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccione tipo de documento</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <h3 className={styles.sectionTitle}>Establecimiento (Emisor)</h3>
                
                <div className={styles.searchGroup}>
                  <div className={styles.searchInput}>
                    <input
                      type="text"
                      placeholder="Ingrese NIT del establecimiento"
                      value={nitEstablecimiento}
                      onChange={(e) => setNitEstablecimiento(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), buscarEstablecimientoPorNIT())}
                      disabled={buscandoEstablecimiento || loading}
                    />
                    <button
                      type="button"
                      className={styles.searchBtn}
                      onClick={buscarEstablecimientoPorNIT}
                      disabled={buscandoEstablecimiento || loading}
                    >
                      {buscandoEstablecimiento ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>

                {establecimientoEncontrado && (
                  <div className={styles.entityCard}>
                    <div className={styles.entityHeader}>
                      <span className={styles.entityBadge}>✓ Establecimiento Seleccionado</span>
                    </div>
                    <p><strong>NIT:</strong> {establecimientoEncontrado.nit}</p>
                    <p><strong>Nombre Comercial:</strong> {establecimientoEncontrado.nombreComercial}</p>
                    <p><strong>Razón Social:</strong> {establecimientoEncontrado.razonSocial}</p>
                    <p><strong>Dirección:</strong> {establecimientoEncontrado.direccion}</p>
                  </div>
                )}

                <h3 className={styles.sectionTitle}>Cliente (Receptor)</h3>
                
                <div className={styles.searchGroup}>
                  <div className={styles.searchInput}>
                    <input
                      type="text"
                      placeholder="Ingrese NIT del cliente"
                      value={nitCliente}
                      onChange={(e) => setNitCliente(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), buscarClientePorNIT())}
                      disabled={buscandoCliente || loading}
                    />
                    <button
                      type="button"
                      className={styles.searchBtn}
                      onClick={buscarClientePorNIT}
                      disabled={buscandoCliente || loading}
                    >
                      {buscandoCliente ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>

                {clienteEncontrado && (
                  <div className={styles.entityCard}>
                    <div className={styles.entityHeader}>
                      <span className={styles.entityBadge}>✓ Cliente Seleccionado</span>
                    </div>
                    <p><strong>NIT:</strong> {clienteEncontrado.nit}</p>
                    <p><strong>Razón Social:</strong> {clienteEncontrado.razonSocial}</p>
                    <p><strong>Nombre Comercial:</strong> {clienteEncontrado.nombreComercial}</p>
                    <p><strong>Dirección:</strong> {clienteEncontrado.direccion}</p>
                  </div>
                )}
              </div>
            )}

            {paso === 2 && (
              <div className={styles.stepContent}>
                <h3 className={styles.sectionTitle}>Agregar Productos</h3>
                
                <div className={styles.productoForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label>Producto *</label>
                      <select
                        value={detalleTemp.idProducto}
                        onChange={(e) => {
                          setDetalleTemp({
                            ...detalleTemp,
                            idProducto: e.target.value
                          });
                        }}
                        disabled={loading}
                      >
                        <option value="">Seleccione un producto</option>
                        {productos.map(prod => (
                          <option key={prod.idProducto || prod.id} value={prod.idProducto || prod.id}>
                            {prod.codigoProducto} - {prod.nombreProducto || prod.nombre} - Q{(prod.precioUnitario || prod.precio || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Cantidad *</label>
                      <input
                        type="number"
                        min="1"
                        value={detalleTemp.cantidad}
                        onChange={(e) => setDetalleTemp({...detalleTemp, cantidad: e.target.value})}
                        disabled={loading}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Descuento (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={detalleTemp.descuento}
                        onChange={(e) => setDetalleTemp({...detalleTemp, descuento: e.target.value})}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={agregarDetalle}
                    disabled={loading}
                  >
                    + Agregar Producto
                  </button>
                </div>

                {formData.detalles.length > 0 && (
                  <div className={styles.detallesTable}>
                    <h4>Productos Agregados ({formData.detalles.length})</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Precio</th>
                          <th>Desc.</th>
                          <th>IVA</th>
                          <th>Total</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.detalles.map((det, index) => (
                          <tr key={index}>
                            <td>{det.codigoProducto}</td>
                            <td>{det.nombreProducto}</td>
                            <td>{det.cantidad}</td>
                            <td>Q{det.precioUnitario.toFixed(2)}</td>
                            <td>{det.descuento}%</td>
                            <td>{det.aplicaIva ? 'Sí' : 'No'}</td>
                            <td><strong>Q{det.total.toFixed(2)}</strong></td>
                            <td>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => eliminarDetalle(index)}
                                disabled={loading}
                                title="Eliminar producto"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {paso === 3 && (
              <div className={styles.stepContent}>
                <h3 className={styles.sectionTitle}>Resumen de la Factura</h3>
                
                <div className={styles.resumenGrid}>
                  <div className={styles.resumenSection}>
                    <h4>Información General</h4>
                    <p><strong>Tipo:</strong> {tiposDocumento.find(t => t.id === parseInt(formData.idTipoDocumento))?.nombre}</p>
                    <p><strong>Establecimiento:</strong> {establecimientoEncontrado?.nombreComercial}</p>
                    <p><strong>Cliente:</strong> {clienteEncontrado?.razonSocial}</p>
                  </div>

                  <div className={styles.resumenSection}>
                    <h4>Totales</h4>
                    <div className={styles.totalesGrid}>
                      <div>
                        <span>Subtotal:</span>
                        <strong>Q{totales.subtotal.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Descuentos:</span>
                        <strong className={styles.descuento}>-Q{totales.totalDescuentos.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Subtotal con desc.:</span>
                        <strong>Q{totales.subtotalConDescuento.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>IVA (12%):</span>
                        <strong>Q{totales.totalIva.toFixed(2)}</strong>
                      </div>
                      <div className={styles.totalFinal}>
                        <span>TOTAL:</span>
                        <strong>Q{totales.totalFactura.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.productosResumen}>
                  <h4>Productos ({formData.detalles.length})</h4>
                  <ul>
                    {formData.detalles.map((det, i) => (
                      <li key={i}>
                        {det.cantidad}x {det.nombreProducto} - Q{det.total.toFixed(2)}
                        {det.descuento > 0 && <span className={styles.descuentoTag}> (-{det.descuento}%)</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    disabled={loading}
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            {paso > 1 && (
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setPaso(paso - 1)}
                disabled={loading}
              >
                ← Atrás
              </button>
            )}

            {paso < 3 ? (
              <button
                type="button"
                className={styles.nextBtn}
                onClick={() => {
                  if (paso === 1 && (!establecimientoEncontrado || !clienteEncontrado)) {
                    toast.error('Debe buscar y seleccionar establecimiento y cliente');
                    return;
                  }
                  if (paso === 2 && formData.detalles.length === 0) {
                    toast.error('Agregue al menos un producto');
                    return;
                  }
                  setPaso(paso + 1);
                }}
                disabled={loading}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creando...' : '✓ Crear Factura'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}