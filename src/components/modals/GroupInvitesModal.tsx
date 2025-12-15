'use client';

import { useState, useEffect } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getPendingInvites, acceptGroupInvite, rejectGroupInvite, GroupInvite } from '@/lib/firebase/groups';
import Avatar from '@/components/ui/Avatar';

interface GroupInvitesModalProps {
  onClose: () => void;
}

export default function GroupInvitesModal({ onClose }: GroupInvitesModalProps) {
  const { user, reloadCategoriesAndGroups } = useApp();
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, [user?.id]);

  const loadInvites = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await getPendingInvites(user.id);
      if (result.success && result.data) {
        setInvites(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    if (!user?.id) return;

    setProcessingInviteId(inviteId);
    try {
      const result = await acceptGroupInvite(inviteId, user.id);
      if (result.success) {
        await reloadCategoriesAndGroups();
        await loadInvites(); // Recarregar convites
      } else {
        alert(result.error || 'Erro ao aceitar convite');
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      alert('Erro ao aceitar convite. Tente novamente.');
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    if (!user?.id) return;

    setProcessingInviteId(inviteId);
    try {
      const result = await rejectGroupInvite(inviteId, user.id);
      if (result.success) {
        await loadInvites(); // Recarregar convites
      } else {
        alert(result.error || 'Erro ao recusar convite');
      }
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      alert('Erro ao recusar convite. Tente novamente.');
    } finally {
      setProcessingInviteId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Convites de Grupos
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando convites...</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum convite pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar
                      name={invite.invitedBy.name}
                      size={40}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {invite.invitedBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        convidou você para o grupo
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {invite.groupData.title}
                    </h3>
                    {invite.groupData.description && (
                      <p className="text-sm text-gray-600">
                        {invite.groupData.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invite.id)}
                      disabled={processingInviteId === invite.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={18} />
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleReject(invite.id)}
                      disabled={processingInviteId === invite.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={18} />
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

