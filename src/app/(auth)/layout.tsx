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
    // Permitir acesso às páginas de registro e categorias mesmo quando autenticado (é parte do fluxo de registro)
    const isRegisterFlow = pathname === '/register' || pathname === '/register/categories';
    if (user?.isAuthenticated && !isRegisterFlow) {
      router.push('/dashboard');
    }
  }, [user, router, pathname]);

  // Se está autenticado e não é parte do fluxo de registro, não renderiza
  const isRegisterFlow = pathname === '/register' || pathname === '/register/categories';
  if (user?.isAuthenticated && !isRegisterFlow) {
    return null;
  }

  return <>{children}</>;
}