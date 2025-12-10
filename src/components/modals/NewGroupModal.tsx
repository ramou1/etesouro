'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { GroupMember } from '@/types';
import { useApp } from '@/context/AppContext';
import { saveGroup, updateGroup } from '@/lib/firebase/groups';
import { searchUsers } from '@/lib/firebase/user';
import { Group } from '@/types';

interface NewGroupModalProps {
  onClose: () => void;
  group?: Group; // Se fornecido, modo edição
}

export default function NewGroupModal({ onClose, group }: NewGroupModalProps) {
  const { user, reloadCategoriesAndGroups } = useApp();
  const [title, setTitle] = useState(group?.title || '');
  const [description, setDescription] = useState(group?.description || '');
  const [isTemporary, setIsTemporary] = useState(group?.isTemporary || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>(
    group ? group.members.filter(m => m.id !== user?.id) : []
  );
  const isEditMode = !!group;
  const [isAddingManually, setIsAddingManually] = useState(false);
  
  // Estados para adicionar membro manualmente
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [contributesIncome, setContributesIncome] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GroupMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Buscar usuários no Firestore quando o termo de busca mudar
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim() || searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await searchUsers(searchTerm.trim(), user?.id);
        if (result.success && result.data) {
          // Converter UserData para GroupMember
          const members: GroupMember[] = result.data
            .filter(userData => !selectedMembers.some(sm => sm.id === userData.id))
            .map(userData => ({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar || '',
              isAdmin: false,
              contributesIncome: false,
            }));
          setSearchResults(members);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce: aguardar 300ms após o usuário parar de digitar
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.id, selectedMembers]);

  // Membros filtrados (excluindo os já selecionados)
  const filteredMembers = searchResults.filter(member => 
    !selectedMembers.some(sm => sm.id === member.id)
  );

  const toggleMember = (member: GroupMember) => {
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

    const newMember: GroupMember = {
      id: `temp-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      avatar: '', // Não usado mais, será substituído por iniciais
      isAdmin: false,
      contributesIncome: contributesIncome
    };

    setSelectedMembers([...selectedMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setContributesIncome(false);
    setIsAddingManually(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title) {
      alert('Título do grupo é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      alert('Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
        // Adicionar o usuário atual como admin do grupo
        const currentUserAsMember: GroupMember = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: '', // Não usado mais, será substituído por iniciais
          isAdmin: true,
          contributesIncome: true,
        };

      // No modo edição, preservar o usuário atual como admin se já estiver no grupo
      let allMembers: GroupMember[];
      if (isEditMode && group && group.members.some(m => m.id === user.id)) {
        // Manter o usuário atual dos membros existentes e adicionar os selecionados
        const existingUserMember = group.members.find(m => m.id === user.id);
        const updatedUserMember: GroupMember = {
          ...existingUserMember!,
          isAdmin: true
        };
        allMembers = [updatedUserMember, ...selectedMembers];
      } else {
        // Modo criação: adicionar usuário atual como admin
        allMembers = [currentUserAsMember, ...selectedMembers];
      }

      const groupData = {
        title: title,
        description: description,
        isTemporary: isTemporary,
        members: allMembers
      };

      let firestoreResult;
      if (isEditMode && group) {
        // Modo edição
        firestoreResult = await updateGroup(group.id, groupData, user.id);
      } else {
        // Modo criação
        firestoreResult = await saveGroup(groupData, user.id);
      }
      
      if (firestoreResult.success) {
        // Recarregar grupos do Firestore
        await reloadCategoriesAndGroups();
        onClose();
      } else {
        alert(firestoreResult.error || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} o grupo`);
      }
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      alert(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} o grupo. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Editar Grupo' : 'Novo Grupo'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título do Grupo */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título do Grupo *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none text-gray-900"
              placeholder="Descreva o propósito deste grupo..."
              rows={3}
            />
          </div>

          {/* Grupo Temporário */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isTemporary"
              checked={isTemporary}
              onChange={(e) => setIsTemporary(e.target.checked)}
              className="w-5 h-5 rounded-md text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="isTemporary" className="text-sm text-gray-700">
              Este é um grupo temporário
              <span className="block text-xs text-gray-500">Grupos temporários podem ser arquivados após uso</span>
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
                      <Avatar 
                        name={member.name}
                        size={40}
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
                className="text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
              >
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-gray-700"
                    placeholder="Buscar por nome ou email..."
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {isSearching ? (
                    <p className="text-sm text-gray-500 text-center py-4">Buscando...</p>
                  ) : filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                      <div
                        key={member.id}
                        onClick={() => toggleMember(member)}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <Avatar 
                          name={member.name}
                          size={40}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))
                  ) : searchTerm.trim() && searchTerm.trim().length >= 2 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum membro encontrado</p>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Digite pelo menos 2 caracteres para buscar</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm text-gray-900"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm text-gray-900"
                    placeholder="email@exemplo.com"
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
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Grupo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}