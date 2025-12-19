'use client';

import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail, Crown, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import { getUserData } from '@/lib/firebase/user';

interface ProfileModalProps {
  onClose: () => void;
}

interface PlanInfo {
  name: string;
  type: string;
  purchaseDate: string;
  expirationDate: string;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, updateUserProfile, updateAllowGroupInvites } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dados mockados do plano
  const planInfo: PlanInfo = {
    name: 'Plano Premium',
    type: 'Mensal',
    purchaseDate: '01/12/2024',
    expirationDate: '31/12/2025'
  };

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // Carregar allowGroupInvites do Firestore
  useEffect(() => {
    const loadAllowGroupInvites = async () => {
      if (user?.id) {
        try {
          const result = await getUserData(user.id);
          if (result.success && result.data) {
            setAllowGroupInvites(result.data.allowGroupInvites ?? true);
          }
        } catch (error) {
          console.error('Erro ao carregar preferência de convites:', error);
        }
      }
    };
    loadAllowGroupInvites();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('O nome é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateUserProfile(name);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Perfil do Usuário</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Avatar e Informações Básicas */}
            <div className="flex flex-col items-center mb-6">
              <Avatar 
                name={user?.name || user?.email || 'Usuário'}
                size={80}
                className="border-4 border-yellow-500 mb-2"
              />
            </div>

            {/* Nome (Editável) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserIcon size={16} className="text-gray-500" />
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="Seu nome completo"
                required
              />
            </div>

            {/* Email (Não Editável) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            {/* Permitir Convites de Grupos */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor="allowGroupInvites" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    Permitir convites de grupos
                  </label>
                  <p className="text-xs text-gray-500">
                    Quando ativado, outros usuários podem te adicionar em grupos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newValue = !allowGroupInvites;
                    setAllowGroupInvites(newValue);
                    setIsLoadingInvites(true);
                    try {
                      await updateAllowGroupInvites(newValue);
                    } catch (error) {
                      console.error('Erro ao atualizar preferência:', error);
                      // Reverter em caso de erro
                      setAllowGroupInvites(allowGroupInvites);
                    } finally {
                      setIsLoadingInvites(false);
                    }
                  }}
                  disabled={isLoadingInvites}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    allowGroupInvites ? 'bg-yellow-500' : 'bg-gray-200'
                  } ${isLoadingInvites ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowGroupInvites ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Informações do Plano */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Crown size={16} className="text-yellow-600" />
                Plano Atual
              </h3>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nome do Plano:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data de Compra:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.purchaseDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data de Expiração:</span>
                  <span className="text-sm font-semibold text-gray-900">{planInfo.expirationDate}</span>
                </div>
              </div>
            </div>

            {/* Mensagens de Erro e Sucesso */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Perfil atualizado com sucesso!
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex-shrink-0 flex space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || name.trim() === user?.name}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Salvando...'
              ) : (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

