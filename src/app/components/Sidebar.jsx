'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
   
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNombre(localStorage.getItem('nombre') || '');
      setEmail(localStorage.getItem('email') || '');
      setRol(localStorage.getItem('rol') || '');
    }
  }, []);


  const navItems = useMemo(() => {
    const allItems = [
      { key: 'panel', label: 'Panel', href: '/dashboard', icon: 'home', roles: ['Admin', 'Facturación'] },
      { key: 'facturas', label: 'Facturas', href: '/dashboard/facturas', icon: 'invoice', roles: ['Admin', 'Facturación'] },
      { key: 'clientes', label: 'Clientes', href: '/dashboard/clientes', icon: 'users', roles: ['Admin', 'Facturación'] },
      { key: 'productos', label: 'Productos', href: '/dashboard/productos', icon: 'products', roles: ['Admin', 'Facturación'] },
      { key: 'establecimientos', label: 'Establecimientos', href: '/dashboard/establecimientos', icon: 'FaAngry', roles: ['Admin', 'Facturación'] },
      { key: 'usuarios', label: 'Usuarios', href: '/dashboard/usuarios', icon: 'users', roles: ['Admin'] },
    ];

    // Filtrar items según el rol del usuario
    return allItems.filter(item => item.roles.includes(rol));
  }, [rol]);

  const initialKey = useMemo(() => {
    if (!pathname) return 'panel';
    const match = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
    return match ? match.key : 'panel';
  }, [pathname, navItems]);

  const [active, setActive] = useState(initialKey);
  const isActive = (key) => active === key;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        await fetch('http://localhost:9090/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nombre');
        localStorage.removeItem('email');
        localStorage.removeItem('rol');
        sessionStorage.clear();
      }
      router.push('/login');
    }
  };

  const Icon = ({ name }) => {
    switch(name){
      case 'home': return <svg xmlns="http://www.w3.org/2000/svg"
      className={styles.icon}  
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>;
      
      case 'invoice': return <svg xmlns="http://www.w3.org/2000/svg"
      className={styles.icon}  
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
        <path d="M9 7l1 0" /><path d="M9 13l6 0" /><path d="M13 17l2 0" /></svg>;
      case 'users': return <svg xmlns="http://www.w3.org/2000/svg" 
      className={styles.icon} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>;
      case 'products': return <svg xmlns="http://www.w3.org/2000/svg"
      className={styles.icon} 
      width="24"
      height="24" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l18 0" />
        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
        <path d="M5 21l0 -10.15" /><path d="M19 21l0 -10.15" /><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" /></svg>;
      case 'FaAngry': return <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 7l9-4 9 4" />
        <path d="M5 7v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V7" />
      </svg>;
      default: return null;
    }
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Facturas Guate</div>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            <svg xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor" >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
              <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
            </svg>
          </div>
          
          <div className={styles.profileInfo}>
            <div style={{fontWeight:700}}>{nombre || 'Usuario'}</div>
            <div style={{fontSize:'.85rem', color:'var(--muted)'}}>{email || 'email@ejemplo.com'}</div>
            <div style={{fontSize:'.75rem', color:'var(--muted)'}}>{rol || 'Sin rol'}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              className={`${styles.navItem} ${isActive(item.key) ? styles.active : ''}`}
              onClick={() => {
                setActive(item.key);
                router.push(item.href);
              }}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.footerSidebar}>
          <div className={styles.footerContainer}>
            <button type="button" className={styles.footerItem} onClick={() => setShowLogoutConfirm(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={styles.icon}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M9 12h12l-3 -3" />
                <path d="M18 15l3 -3" />
              </svg>
              Cerrar sesión
            </button>
          </div>

          <div className={styles.footerContainer}>
            <button type="button" className={styles.footerItem} >
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={styles.icon}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path stroke="none" 
                  d="M0 0h24v24H0z" 
                  fill="none"/>
                <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
              Configuración 
            </button>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div style={{textAlign: 'center', marginBottom: '1rem'}}>
              <svg xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{margin: '0 auto'}}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 style={{marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600'}}>¿Cerrar sesión?</h3>
            <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>¿Estás seguro que deseas cerrar sesión?</p>
            <div style={{display:'flex', gap: '0.5rem', justifyContent:'flex-end'}}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}