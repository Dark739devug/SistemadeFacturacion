"use client";
import React, { useState, useMemo, useEffect } from 'react';
import styles from './dashboard.module.css';
import { usePathname, useRouter } from 'next/navigation';
import ENDPOINTS from '../services/api'; 

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function normalizeToken(raw) {
  if (!raw) return null;
  let t = String(raw);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
  try {
    const p = JSON.parse(t);
    if (typeof p === 'string') return p;
    return p.accessToken || p.token || p.jwt || p.access_token || null;
  } catch (e) {}
  return t;
}

export default function DashboardPage(){
  const pathname = usePathname();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState({
    totalFacturas: 0,
    ventasHoy: 0,
    ventasSemana: 0,
    ventasMes: 0,
    facturasCertificadas: 0,
    facturasAnuladas: 0,
    totalProductos: 0,
    productosActivos: 0,
    totalClientes: 0,
    totalEstablecimientos: 0,
    productosStockBajo: 0,
    productosStockBajoDetalle: [],
    facturasRecientes: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityViewed, setActivityViewed] = useState(false);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos del dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const token = normalizeToken(rawToken);
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const productosRes = await fetch(ENDPOINTS.productos, { headers }).catch(() => null);
      const productosData = productosRes?.ok ? await productosRes.json() : [];
      const productos = Array.isArray(productosData) ? productosData : (productosData.items || []);
      
      const clientesRes = await fetch(ENDPOINTS.clientes, { headers }).catch(() => null);
      const clientesData = clientesRes?.ok ? await clientesRes.json() : [];
      const clientes = Array.isArray(clientesData) ? clientesData : (clientesData.items || []);
      
      const establecimientosRes = await fetch(ENDPOINTS.establecimientos, { headers }).catch(() => null);
      const establecimientosData = establecimientosRes?.ok ? await establecimientosRes.json() : [];
      const establecimientos = Array.isArray(establecimientosData) ? establecimientosData : (establecimientosData.items || []);

      const facturasRes = await fetch(ENDPOINTS.facturas, { headers }).catch(() => null);
      const facturasData = facturasRes?.ok ? await facturasRes.json() : [];
      const facturas = Array.isArray(facturasData) ? facturasData : (facturasData.items || facturasData.facturas || []);

      // Calcular métricas
      const productosActivos = productos.filter(p => p.activo !== false).length;
      const productosConStockBajo = productos.filter(p => (p.stockActual ?? p.stock ?? 0) < 10);
      const productosStockBajo = productosConStockBajo.length;
      const productosStockBajoDetalle = productosConStockBajo.map(p => ({
        nombre: p.nombre ?? p.nombreProducto ?? 'Sin nombre',
        stock: p.stockActual ?? p.stock ?? 0
      }));
      
      const facturasRecientes = facturas.slice(0, 5).map(f => ({
        id: f.idFactura ?? f.id,
        cliente: f.nombreCliente ?? f.cliente ?? 'Cliente',
        total: f.total ?? f.montoTotal ?? 0,
        fecha: f.fecha ?? f.fechaEmision ?? new Date().toISOString()
      }));

      setDashboardData(prev => {
        const newData = {
          totalFacturas: facturas.length,
          ventasHoy: facturas.filter(f => isToday(f.fecha ?? f.fechaEmision)).reduce((sum, f) => sum + (f.total ?? f.montoTotal ?? 0), 0),
          ventasSemana: facturas.filter(f => isThisWeek(f.fecha ?? f.fechaEmision)).reduce((sum, f) => sum + (f.total ?? f.montoTotal ?? 0), 0),
          ventasMes: facturas.filter(f => isThisMonth(f.fecha ?? f.fechaEmision)).reduce((sum, f) => sum + (f.total ?? f.montoTotal ?? 0), 0),
          facturasCertificadas: facturas.filter(f => f.estado?.toLowerCase() === 'certificada' || f.certificada).length,
          facturasAnuladas: facturas.filter(f => f.estado?.toLowerCase() === 'anulada' || f.anulada).length,
          totalProductos: productos.length,
          productosActivos,
          totalClientes: clientes.length,
          totalEstablecimientos: establecimientos.length,
          productosStockBajo,
          productosStockBajoDetalle,
          facturasRecientes
        };
        
        // Si hay nuevas facturas, resetear el estado de visto
        if (facturasRecientes.length > prev.facturasRecientes.length) {
          setActivityViewed(false);
        }
        
        return newData;
      });
    } catch (err) {
      console.error('Error cargando datos del dashboard', err);
    } finally {
      setLoading(false);
    }
  }

  function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isThisWeek(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return date >= weekAgo && date <= today;
  }

  function isThisMonth(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  function formatMoney(v) {
    try {
      return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);
    } catch { return `Q ${v}`; }
  }

  return (
    <>
    
    <main className={styles.content}>
      <section>
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <h1>Panel de Control</h1>
            <p>Resumen del Sistema de facturación</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerIcons}>
              {/* Icono de Actividad Reciente */}
              <div className={styles.notificationIconWrapper}>
                <button 
                  className={styles.notificationBtn}
                  onClick={() => {
                    setShowActivity(!showActivity);
                    setShowNotifications(false);
                    if (!showActivity) {
                      setActivityViewed(true);
                    }
                  }}
                  title="Actividades Recientes"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                  </svg>
                  {dashboardData.facturasRecientes.length > 0 && !activityViewed && (
                    <span className={styles.badge}>{dashboardData.facturasRecientes.length}</span>
                  )}
                </button>
                {showActivity && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>Actividad Reciente</div>
                    <div className={styles.dropdownContent}>
                      {loading ? (
                        <div className={styles.dropdownEmpty}>Cargando...</div>
                      ) : dashboardData.facturasRecientes.length === 0 ? (
                        <div className={styles.dropdownEmpty}>No hay facturas recientes</div>
                      ) : (
                        dashboardData.facturasRecientes.map(f => (
                          <div 
                            key={f.id} 
                            className={styles.dropdownItem}
                            onClick={() => router.push('/dashboard/facturas')}
                            style={{cursor: 'pointer'}}
                          >
                            <div className={styles.dropdownIcon}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b60d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                              </svg>
                            </div>
                            <div className={styles.dropdownItemContent}>
                              <div className={styles.dropdownItemTitle}>Factura #{f.id}</div>
                              <div className={styles.dropdownItemSubtitle}>{f.cliente}</div>
                            </div>
                            <div className={styles.dropdownItemValue}>{formatMoney(f.total)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Icono de Alertas */}
              <div className={styles.notificationIconWrapper}>
                <button 
                  className={styles.notificationBtn}
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowActivity(false);
                  }}
                  title="Alertas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/>
                    <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
                  </svg>
                  {(dashboardData.productosStockBajo > 0 || dashboardData.facturasAnuladas > 0) && (
                    <span className={styles.badge}>
                      {dashboardData.productosStockBajo + dashboardData.facturasAnuladas}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>Alertas</div>
                    <div className={styles.dropdownContent}>
                      {dashboardData.productosStockBajo > 0 && (
                        <div 
                          className={styles.dropdownItem} 
                          onClick={() => router.push('/dashboard/productos')}
                          style={{cursor: 'pointer'}}
                        >
                          <div className={styles.dropdownIcon} style={{background: '#fee2e2'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 9v4"/>
                              <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/>
                              <path d="M12 16h.01"/>
                            </svg>
                          </div>
                          <div className={styles.dropdownItemContent}>
                            <div className={styles.dropdownItemTitle}>Stock Bajo</div>
                            <div className={styles.dropdownItemSubtitle}>
                              {dashboardData.productosStockBajoDetalle.map((p, idx) => (
                                <div key={idx} style={{fontSize: '0.75rem', marginTop: '2px'}}>
                                  • {p.nombre} (Stock: {p.stock})
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {dashboardData.facturasAnuladas > 0 && (
                        <div 
                          className={styles.dropdownItem}
                          onClick={() => router.push('/dashboard/facturas')}
                          style={{cursor: 'pointer'}}
                        >
                          <div className={styles.dropdownIcon} style={{background: '#fee2e2'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6l-12 12"/>
                              <path d="M6 6l12 12"/>
                            </svg>
                          </div>
                          <div className={styles.dropdownItemContent}>
                            <div className={styles.dropdownItemTitle}>Facturas Anuladas</div>
                            <div className={styles.dropdownItemSubtitle}>{dashboardData.facturasAnuladas} facturas anuladas</div>
                          </div>
                        </div>
                      )}
                      {!loading && dashboardData.productosStockBajo === 0 && dashboardData.facturasAnuladas === 0 && (
                        <div className={styles.dropdownEmpty}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
                            <path d="M5 12l5 5l10 -10"/>
                          </svg>
                          No hay alertas pendientes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Clock time={currentTime} />
          </div>
        </div>

        {/* Métricas principales */}
        <div className={styles.metricsGrid}>
          <MetricCard 
            title="Facturas Totales"
            value={loading ? '...' : dashboardData.totalFacturas}
            subtitle="Todas las facturas emitidas"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 7l1 0"/><path d="M9 13l6 0"/><path d="M13 17l2 0"/></svg>}
            color="#0b60d6"
          />
          <MetricCard 
            title="Ventas del Mes"
            value={loading ? '...' : formatMoney(dashboardData.ventasMes)}
            subtitle={`Hoy: ${formatMoney(dashboardData.ventasHoy)}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"/><path d="M12 3v3m0 12v3"/></svg>}
            color="#10b981"
          />
          <MetricCard 
            title="Productos"
            value={loading ? '...' : dashboardData.totalProductos}
            subtitle={`${dashboardData.productosActivos} activos`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l18 0"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4"/><path d="M5 21l0 -10.15"/><path d="M19 21l0 -10.15"/><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"/></svg>}
            color="#f59e0b"
          />
          <MetricCard 
            title="Clientes"
            value={loading ? '...' : dashboardData.totalClientes}
            subtitle={`${dashboardData.totalEstablecimientos} establecimientos`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/></svg>}
            color="#8b5cf6"
          />
        </div>

        {/* Gráficos y calendario */}
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardTitle}>Rendimiento de Ventas</div>
            </div>
            <div className={styles.chartWrap}>
              <InteractiveChart />
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.cardTitle}>Estado de Facturas</div>
            <div className={styles.chartWrap}>
              <FacturasChart 
                certificadas={dashboardData.facturasCertificadas}
                anuladas={dashboardData.facturasAnuladas}
              />
            </div>
          </div>

          <div className={styles.calendarCard}>
            <div className={styles.cardTitle}>Calendario</div>
            <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
        </div>
      </section>
    </main>

   
    </>
  );
}


function InteractiveChart(){
  const [range, setRange] = useState('week');

  // cuadros de datos simulados aqui se conectara a datos reales con la api
  const datasets = {
    day: { labels: ['00:00','04:00','08:00','12:00','16:00','20:00'], data:[5,8,12,9,14,10] },
    week: { labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], data:[50,65,80,70,95,110,120] },
    month: { labels: Array.from({length:8}, (_,i)=>`Sem ${i+1}`), data:[200,230,260,280,300,330,360,400] }
  };

  const current = datasets[range] || datasets.week;

  const data = {
    labels: current.labels,
    datasets: [
      {
        label: 'Facturas emitidas',
        data: current.data,
        fill: true,
        backgroundColor: 'rgba(11,96,214,0.08)',
        borderColor: '#0b60d6',
        tension: 0.3,
        pointRadius: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display:false }, ticks: { color: '#6b7280' } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280' } }
    }
  };

  // botones de rango manejo de eventos
  React.useEffect(()=>{
    const handler = (e)=>{
      const btn = e.target.closest && e.target.closest('button[data-range]');
      if(btn && btn.dataset.range){
        setRange(btn.dataset.range);
        // actualizar clases activas
        document.querySelectorAll(`.${styles.rangeButton}`).forEach(b=>b.classList.remove(styles.activeRange));
        btn.classList.add(styles.activeRange);
      }
    };
    document.addEventListener('click', handler);
    return ()=> document.removeEventListener('click', handler);
  },[]);

  return (
    <div style={{height:170}}>
      <Line data={data} options={options} />
    </div>
  );
}

// Componente de Reloj en tiempo real
function Clock({ time }) {
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={styles.clockContainer}>
      <div className={styles.clockTime}>{hours}:{minutes}:{seconds}</div>
      <div className={styles.clockDate}>{date}</div>
    </div>
  );
}

// Componente de Métrica
function MetricCard({ title, value, subtitle, icon, color }) {
  // Colores pastel para fondos
  const pastelColors = {
    '#0b60d6': '#e3f2fd', // Azul pastel
    '#10b981': '#d1fae5', // Verde pastel
    '#f59e0b': '#fef3c7', // Amarillo pastel
    '#8b5cf6': '#ede9fe'  // Morado pastel
  };
  
  const backgroundColor = pastelColors[color] || '#f3f4f6';
  
  return (
    <div className={styles.metricCard} style={{ borderLeft: `4px solid ${color}`, backgroundColor }}>
      <div className={styles.metricIcon} style={{ background: `${color}15` }}>{icon}</div>
      <div className={styles.metricContent}>
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricValue}>{value}</div>
        <div className={styles.metricSubtitle}>{subtitle}</div>
      </div>
    </div>
  );
}

// Componente de Calendario
function Calendar({ selectedDate, setSelectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  let day = new Date(startDate);
  
  while (day <= monthEnd || day.getDay() !== 0) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const monthName = currentMonth.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className={styles.calendarNav}>‹</button>
        <div className={styles.calendarMonth}>{monthName}</div>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className={styles.calendarNav}>›</button>
      </div>
      <div className={styles.calendarGrid}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className={styles.calendarWeekday}>{d}</div>
        ))}
        {days.map((d, i) => {
          const isToday = d.toDateString() === new Date().toDateString();
          const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
          const isSelected = d.toDateString() === selectedDate.toDateString();
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(d)}
              className={`${styles.calendarDay} ${isToday ? styles.calendarToday : ''} ${!isCurrentMonth ? styles.calendarOtherMonth : ''} ${isSelected ? styles.calendarSelected : ''}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Gráfico de Facturas (Doughnut)
function FacturasChart({ certificadas, anuladas }) {
  const data = {
    labels: ['Certificadas', 'Anuladas'],
    datasets: [{
      data: [certificadas, anuladas],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } }
    }
  };

  return (
    <div style={{ height: 200 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}