'use client';
import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = useMemo(() => [
    { key: 'panel', label: 'Panel', href: '/dashboard', icon: 'home' },
    { key: 'facturas', label: 'Facturas', href: '/dashboard/facturas', icon: 'invoice' },
    { key: 'clientes', label: 'Clientes', href: '/dashboard/clientes', icon: 'users' },
    { key: 'productos', label: 'Productos', href: '/dashboard/productos', icon: 'products' },
  ], []);

  const initialKey = useMemo(() => {
    if (!pathname) return 'panel';
    const match = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
    return match ? match.key : 'panel';
  }, [pathname, navItems]);

  const [active, setActive] = useState(initialKey);
  const isActive = (key) => active === key;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    router.push('/login');
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
      default: return null;
    }
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Facturas Guate</div>

        <div className={styles.profile}>
          <div className={styles.avatar}><svg xmlns="http://www.w3.org/2000/svg" 
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
            <div style={{fontWeight:700}}>Usuario Admin</div>
            <div style={{fontSize:'.85rem', color:'var(--muted)'}}>admin@example.com</div>
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
              <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" /><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /></svg>
              Configuración </button>
            </div>
           
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro que deseas cerrar sesión?</p>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
