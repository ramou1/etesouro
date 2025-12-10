'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Permitir acesso à página de categorias mesmo quando autenticado (é parte do fluxo de registro)
    if (user?.isAuthenticated && pathname !== '/register/categories') {
      router.push('/dashboard');
    }
  }, [user, router, pathname]);

  // Se está autenticado e não é a página de categorias, não renderiza
  if (user?.isAuthenticated && pathname !== '/register/categories') {
    return null;
  }

  return <>{children}</>;
}