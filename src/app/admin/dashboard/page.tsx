'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, CreditCard, LayoutDashboard } from 'lucide-react';
import { getUsersForAdmin } from '@/lib/firebase/user';
import { getFeedbacksForAdmin } from '@/lib/firebase/feedback';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [feedbacksCount, setFeedbacksCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResult, feedbacksResult] = await Promise.all([
          getUsersForAdmin(),
          getFeedbacksForAdmin(),
        ]);
        if (usersResult.success && usersResult.data !== undefined) {
          setUsersCount(usersResult.data.length);
        }
        if (feedbacksResult.success && feedbacksResult.data !== undefined) {
          setFeedbacksCount(feedbacksResult.data.length);
        }
        if (!usersResult.success) setError(usersResult.error ?? 'Erro ao carregar usuários');
        if (!feedbacksResult.success) setError(feedbacksResult.error ?? 'Erro ao carregar feedbacks');
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard size={28} />
          Painel do Administrador
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Visão geral do sistema
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/usuarios')}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Usuários cadastrados</p>
              <p className="text-2xl font-bold text-gray-800">{usersCount ?? 0}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/feedbacks')}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full"
          >
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
              <MessageSquare size={28} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Feedbacks recebidos</p>
              <p className="text-2xl font-bold text-gray-800">{feedbacksCount ?? 0}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/pagamentos')}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full opacity-90"
          >
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <CreditCard size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pagamentos</p>
              <p className="text-sm text-gray-600">Em breve</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
