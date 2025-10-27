'use client';

import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import Image from 'next/image';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  contributesIncome: boolean;
}

interface NewGroupModalProps {
  onClose: () => void;
}

export default function NewGroupModal({ onClose }: NewGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [isAddingManually, setIsAddingManually] = useState(false);
  
  // Estados para adicionar membro manualmente
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');
  const [contributesIncome, setContributesIncome] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Membros mockados existentes (poderia vir do contexto)
  const existingMembers: Member[] = [
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      isAdmin: false,
      contributesIncome: true
    },
    {
      id: '3',
      name: 'Pedro Silva',
      email: 'pedro.silva@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isAdmin: false,
      contributesIncome: false
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isAdmin: false,
      contributesIncome: true
    }
  ];

  const filteredMembers = existingMembers.filter(member => 
    !selectedMembers.some(sm => sm.id === member.id) &&
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMember = (member: Member) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const addManualMember = () => {
    if (!newMemberName || !newMemberEmail) {
      alert('Nome e email são obrigatórios');
      return;
    }

    const newMember: Member = {
      id: `temp-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      avatar: newMemberAvatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face',
      isAdmin: false,
      contributesIncome: contributesIncome
    };

    setSelectedMembers([...selectedMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberAvatar('');
    setContributesIncome(false);
    setIsAddingManually(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!groupName) {
      alert('Nome do grupo é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a lógica para criar o grupo
      console.log({
        groupName,
        groupDescription,
        isTemporary,
        members: selectedMembers
      });
      
      alert('Grupo criado com sucesso!');
      onClose();
    } catch {
      // Removemos o 'error' não utilizado
      alert('Erro ao criar grupo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Novo Grupo</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome do Grupo */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Grupo *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: Família, Viagem, Amigos..."
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Descreva o propósito deste grupo..."
              rows={3}
            />
          </div>

          {/* Grupo Temporário */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isTemporary"
              checked={isTemporary}
              onChange={(e) => setIsTemporary(e.target.checked)}
              className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="isTemporary" className="text-sm text-gray-700">
              Este é um grupo temporário
              <span className="block text-xs text-gray-500">Grupos temporários podem ser arquivados após seu uso</span>
            </label>
          </div>

          {/* Membros Selecionados */}
          {selectedMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Membros Selecionados ({selectedMembers.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image 
                        src={member.avatar} 
                        alt={member.name} 
                        width={40} 
                        height={40}
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMember(member)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Membros */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Adicionar Membros</h3>
              <button
                type="button"
                onClick={() => setIsAddingManually(!isAddingManually)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar Manualmente
              </button>
            </div>

            {/* Buscar membros existentes */}
            {!isAddingManually && (
              <div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Buscar por nome ou email..."
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member)}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <Image 
                        src={member.avatar} 
                        alt={member.name} 
                        width={40} 
                        height={40}
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && searchTerm && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum membro encontrado</p>
                  )}
                </div>
              </div>
            )}

            {/* Adicionar membro manualmente */}
            {isAddingManually && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL da Foto (opcional)</label>
                  <input
                    type="url"
                    value={newMemberAvatar}
                    onChange={(e) => setNewMemberAvatar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="contributesIncome"
                    checked={contributesIncome}
                    onChange={(e) => setContributesIncome(e.target.checked)}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="contributesIncome" className="text-xs text-gray-700">
                    Contribui com renda
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingManually(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={addManualMember}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !groupName}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando...' : 'Criar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}