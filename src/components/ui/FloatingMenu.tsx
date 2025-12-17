'use client';

import { useState, useRef, useEffect } from 'react';
import { Home, Settings, PlusCircle, MinusCircle, ChartNoAxesCombined, X, Menu } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function FloatingMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
    { icon: PlusCircle, label: 'Receitas', path: '/income' },
    { icon: MinusCircle, label: 'Despesas', path: '/expense' },
    { icon: ChartNoAxesCombined, label: 'Relatórios', path: '/analytics' },
  ];

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-12 right-4 z-0" ref={menuRef}>
      {/* Menu Items - Aparecem acima do botão quando aberto */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 min-w-[200px] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  active ? 'bg-yellow-50 text-yellow-600' : 'text-gray-700'
                }`}
              >
                <Icon size={20} className={active ? 'text-yellow-600' : 'text-gray-500'} />
                <span className={`text-sm font-medium ${active ? 'text-yellow-600' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
          isOpen
            ? 'bg-yellow-600/90 text-white rotate-90 hover:bg-yellow-600'
            : 'bg-black/30 text-white hover:bg-black/40'
        }`}
        aria-label="Menu de navegação"
      >
        {isOpen ? (
          <X size={20} className="transition-transform duration-300" />
        ) : (
          <Menu size={20} className="transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}

