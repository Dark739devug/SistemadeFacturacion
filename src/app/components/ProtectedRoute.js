'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
   
    if (!token && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
    
   
    if (token && (pathname === '/login' || pathname === '/registro')) {
      router.push('/dashboard');
    }
  }, [router, pathname]);

  return <>{children}</>;
}