'use client';

import { LayoutDashboard, Users, MessageSquare, CreditCard } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/usuarios', label: 'Usuários', icon: Users },
  { path: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
  { path: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return pathname === '/admin' || pathname === '/admin/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => router.push(path)}
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-[72px] transition-colors ${
              isActive(path) ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
