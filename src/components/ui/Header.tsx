'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useApp();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      // Limpar localStorage
      localStorage.removeItem('user');
      // Fechar dropdown
      setShowDropdown(false);
      // Forçar reload para garantir que o estado seja limpo completamente
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tentar redirecionar e limpar
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // Avatar padrão se não houver foto
  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

  return (
    <div className="bg-white flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image
            src="/images/logo01.png"
            alt="eTE$OURO Logo"
            width={120}
            height={40}
            className="h-6 w-auto"
          />
        </div>
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                {user.name}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={avatarUrl}
                  alt={user.name || 'Usuário'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                    {user.name || user.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-2"
                >
                  <LogOut size={18} className="text-gray-500" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
