"use client";
import React, { useState, useMemo } from 'react';
import styles from './dashboard.module.css';
import { usePathname, useRouter } from 'next/navigation';

// Chart.js
// configuración e importación de componentes necesarios de Chart.js y react-chartjs-2  
//con esto se podrá mostrar gráficos en el panel de control
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage(){
  const pathname = usePathname();

  // elementos de navegación definidos con useMemo para evitar recreaciones innecesarias 
  const navItems = useMemo(() => [
    { key: 'panel', label: 'Panel', href: '/dashboard', icon: 'home' },
    { key: 'facturas', label: 'Facturas', href: '/dashboard/facturas', icon: 'invoice' }, // aqui se agregara la funcionalidad de facturas
    { key: 'clientes', label: 'Clientes', href: '/dashboard/clientes', icon: 'users' }, // aqui se agregara la funcionalidad de clientes
    { key: 'productos', label: 'Productos', href: '/dashboard/productos', icon: 'products' }, // aqui se agregara la funcionalidad de productos
  ], []);

  // inicializar la pestaña activa según la ruta actual 
  const initialKey = useMemo(() => {
    if (!pathname) return 'panel';
    const match = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
    return match ? match.key : 'panel';
  }, [pathname, navItems]);

  const [active, setActive] = useState(initialKey);

  const isActive = (key) => active === key;

  const router = useRouter();

  async function handleLogout(){
    // Cerrar sesión seguramente en el backend y limpiar tokens
    try{
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if(token){
        // Notificar al backend del cierre de sesión
        fetch('http://localhost:9090/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        }).catch(()=>{});
      }
    }catch(err){
      // ignorar errores
    }finally{
      // Limpiar tokens de almacenamiento
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Redireccionar a login
      router.push('/login');
    }
  }

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Facturas Guate</div>
        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {/* Avatar de usuario */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
              <rect width="24" height="24" rx="12" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6f0ff" />
                  <stop offset="1" stopColor="#dbeeff" />
                </linearGradient>
              </defs>
              <g transform="translate(4,4)" fill="#0b60d6">
                <circle cx="8" cy="4" r="3" />
                <path d="M1 18c1.5-4 9-4 12 0v1H1v-1z" />
              </g>
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <div style={{fontWeight:700}}>Usuario Admin</div>
            <div style={{fontSize:'.85rem', color:'var(--muted)'}}>admin@example.com</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const classes = `${styles.navItem} ${isActive(item.key) ? styles.active : ''}`.trim();
            // componente de icono simple
            const Icon = ({ name }) => {
              switch (name) {
                case 'home':
                  return (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 21V11h14v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                  // icono de factura
                case 'invoice':
                  return (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3h10v18H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                  // icono de usuarios
                case 'users':
                  return (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 20c0-3.333 3.582-6 8-6s8 2.667 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                  // icono de productos
                case 'products':
                  return (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 16V8a2 2 0 0 0-1-1.732l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.732l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3v13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                default:
                  return null;
              }
            };
            // botón de navegación
            return (
              <button key={item.key} type="button" onClick={() => setActive(item.key)} className={classes}>
                <span className={styles.icon} aria-hidden><Icon name={item.icon} /></span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className={styles.footerSidebar}>
          <div className={styles.footerItem}>
            <span className={styles.icon} aria-hidden>
              {/* Configuración de la cuenta */}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.3 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.28-.46 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 4.3A2 2 0 0 1 7.13 1.47l.06.06A1.65 1.65 0 0 0 9 1.86c.7 0 1.28.46 1.51 1 .18.52.7.9 1.26.9h.08c.56 0 1.08-.38 1.26-.9.23-.54.81-1 1.51-1 .89 0 1.7.37 2.29.96l.06.06A2 2 0 0 1 21.7 4.3l-.06.06a1.65 1.65 0 0 0-.33 1.82c.24.54.81 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.7 0-1.28.46-1.51 1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Configuración
          </div>
          <button type="button" className={styles.footerItem} onClick={() => setShowLogoutConfirm(true)} aria-label="Cerrar sesión">
            <span className={styles.icon} aria-hidden>
              {/* Cerrar sesión */}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={styles.content}>
        {active === 'panel' && (
          <section>
            <div className={styles.panelHeader}>
              <h1>Panel</h1>
              <p>Resumen rápido: métricas, actividad reciente y atajos.</p>
            </div>


            {/* Tarjetas de métricas */}
            <div className={styles.cards}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Total facturas emitidas</div>
                <div className={styles.cardValue}>1,248</div>
                <div className={styles.cardSubtitle}>Por el usuario (último año)</div>
              </div>

              {/* Tarjeta de ventas */}
              <div className={styles.card}>
                <div className={styles.cardTitle}>Ventas</div>
                <div className={styles.cardValue}>Q 4,350</div>
                <div className={styles.cardSubtitle}>Hoy / Semana / Mes: Q 150 / Q 1,200 / Q 8,900</div>
              </div>

              {/* Tarjeta de facturas */}
              <div className={styles.card}>
                <div className={styles.cardTitle}>Facturas</div>
                <div className={styles.cardValue}>Certificadas 1,200 • Anuladas 48</div>
                <div className={styles.cardSubtitle}>Estado general</div>
              </div>

              {/* Gráfico de rendimiento */}
              <div className={styles.cardChart}>
                <div className={styles.cardTitleRow}>
                  <div className={styles.cardTitle}>Rendimiento personal</div>
                  <div className={styles.rangeControls} role="tablist" aria-label="Rango de tiempo">
                    <button type="button" className={`${styles.rangeButton} ${styles.activeRange}`} data-range="day">Día</button>
                    <button type="button" className={`${styles.rangeButton}`} data-range="week">Semana</button>
                    <button type="button" className={`${styles.rangeButton}`} data-range="month">Mes</button>
                  </div>
                </div>

                <div className={styles.chartWrap} aria-hidden>
                  {/* gráfico interactivo */}
                  <InteractiveChart />
                </div>
                <div className={styles.cardSubtitle}>Progreso</div>
              </div>
            </div>
          </section>
        )}

        {/* Sección de facturas (simulada) */}
        {active === 'facturas' && (
          <section>
            <h1>Facturas</h1>
            <p>Aquí verás la lista de facturas y las acciones disponibles (crear, editar, ver).</p>
            {/* tabla de facturas */}
            <div style={{marginTop:12}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{textAlign:'left', borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
                    <th>Nº</th><th>Cliente</th><th>Fecha</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>001</td><td>ACME</td><td>2025-10-01</td><td>Q 150.00</td></tr>
                  <tr><td>002</td><td>La Tienda</td><td>2025-10-03</td><td>Q 300.00</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'clientes' && (
          <section>
            <h1>Clientes</h1>
            <p>Lista de clientes y detalles.</p>
          </section>
        )}

        {active === 'productos' && (
          <section>
            <h1>Productos</h1>
            <p>Gestión de productos y precios.</p>
          </section>
        )}
      </main>
  </div>

  {/* Modal de confirmación de cierre de sesión */}
  {showLogoutConfirm && (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalBox}>
          <h3>¿Cerrar sesión?</h3>
          <p>¿Estás seguro que deseas cerrar tu sesión actual?</p>
          <div style={{display:'flex', gap:8, marginTop:12, justifyContent:'flex-end'}}>
            <button type="button" className={styles.btnSecondary} onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
            <button type="button" className={styles.btnPrimary} onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Componente de gráfico interactivo
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
