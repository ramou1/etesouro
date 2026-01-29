'use client';

import { useState, useEffect } from 'react';
import { getUsersForAdmin } from '@/lib/firebase/user';
import { UserData } from '@/lib/firebase/user';

function formatCreatedAt(createdAt: UserData['createdAt']): string {
  if (!createdAt) return '-';
  if (typeof (createdAt as { toDate?: () => Date }).toDate === 'function') {
    return (createdAt as { toDate: () => Date }).toDate().toLocaleDateString('pt-BR');
  }
  if (createdAt instanceof Date) return createdAt.toLocaleDateString('pt-BR');
  return '-';
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await getUsersForAdmin();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error ?? 'Erro ao carregar usuários');
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <p className="text-gray-600 text-sm mt-1">
          Lista de usuários cadastrados no sistema
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          Nenhum usuário cadastrado.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">E-mail</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Data de criação</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Aceita convites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{u.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.type === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.type === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCreatedAt(u.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {u.allowGroupInvites === false ? 'Não' : 'Sim'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
