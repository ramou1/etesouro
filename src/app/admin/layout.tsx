'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Header from '@/components/ui/Header';
import AdminNav from '@/components/ui/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    }
    if (user && user.type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (user.type !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <AdminNav />
    </div>
  );
}
