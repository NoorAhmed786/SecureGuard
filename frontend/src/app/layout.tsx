"use client";

import './globals.css';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import { jwtDecode } from 'jwt-decode';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          throw new Error('Token expired');
        }

        setRole(decoded.role || 'user');
        setUserEmail(decoded.sub || null);
        setIsAuth(true);
      } catch (e) {
        localStorage.removeItem('token');
        setIsAuth(false);
      }
    } else {
      setIsAuth(false);
    }
    setIsLoadingAuth(false);
  }, [pathname]);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/services', '/pricing', '/contact', '/demo'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect to login if trying to access protected route without auth
  useEffect(() => {
    if (!isLoadingAuth && !isAuth && !isPublicRoute && typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${pathname}`;
    }
  }, [isAuth, isPublicRoute, pathname, isLoadingAuth]);

  const showSidebar = !isPublicRoute && isAuth;

  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 flex min-h-screen">
        {showSidebar && <Sidebar role={role} userEmail={userEmail} />}
        <main className={`flex-1 ${showSidebar ? 'h-screen overflow-auto bg-slate-900/50' : ''}`}>
          {children}
        </main>
        {isAuth && <AIAssistant />}
      </body>
    </html>
  );
}
