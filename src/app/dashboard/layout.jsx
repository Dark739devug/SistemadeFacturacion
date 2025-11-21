import React from 'react'; 
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}