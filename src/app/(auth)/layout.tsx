'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já está autenticado, redireciona para o dashboard
    if (user?.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Se está autenticado, não renderiza as páginas de auth
  if (user?.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}