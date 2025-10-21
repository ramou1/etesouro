'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    // Se o usuário estiver autenticado, vai para dashboard
    // Se não estiver, vai para login
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  // Tela de loading enquanto redireciona
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-black mb-4">ETesouro</h1>
        <div className="animate-pulse text-black">Carregando...</div>
      </div>
    </div>
  );
}