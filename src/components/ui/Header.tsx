'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { LogOut, Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GroupInvitesModal from '@/components/modals/GroupInvitesModal';
import { getPendingInvites } from '@/lib/firebase/groups';

export default function Header() {
  const { user, logout } = useApp();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const invitesRef = useRef<HTMLDivElement>(null);

  // Carregar contagem de convites pendentes
  useEffect(() => {
    if (!user?.id) return;

    const loadInvitesCount = async () => {
      try {
        const result = await getPendingInvites(user.id);
        if (result.success && result.data) {
          setPendingInvitesCount(result.data.length);
        }
      } catch (error) {
        console.error('Erro ao carregar contagem de convites:', error);
      }
    };

    loadInvitesCount();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadInvitesCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (invitesRef.current && !invitesRef.current.contains(event.target as Node)) {
        // Não fechar o modal de convites aqui, apenas o dropdown
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
      // Redirecionar para a página raiz
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tentar redirecionar e limpar
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-white flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Image
            src="/images/logo01.png"
            alt="eTE$OURO Logo"
            width={120}
            height={40}
            className="h-6 w-auto"
          />
        </button>
        {user && (
          <div className="flex items-center gap-3">
            {/* Botão de Convites */}
            <div className="relative" ref={invitesRef}>
              <button
                onClick={() => setShowInvitesModal(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Convites de grupos"
              >
                <Bell size={20} className="text-gray-700" />
                {pendingInvitesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingInvitesCount > 9 ? '9+' : pendingInvitesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar e Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                  {user.name}
                </span>
                <Avatar 
                  name={user.name || user.email || 'Usuário'}
                  size={32}
                  className="border-2 border-gray-200"
                />
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
          </div>
        )}

        {/* Modal de Convites */}
        {showInvitesModal && (
          <GroupInvitesModal
            onClose={() => {
              setShowInvitesModal(false);
              // Recarregar contagem ao fechar
              if (user?.id) {
                getPendingInvites(user.id).then(result => {
                  if (result.success && result.data) {
                    setPendingInvitesCount(result.data.length);
                  }
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
