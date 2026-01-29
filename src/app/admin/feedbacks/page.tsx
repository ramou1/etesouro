'use client';

import { useState, useEffect } from 'react';
import { getFeedbacksForAdmin } from '@/lib/firebase/feedback';
import { FeedbackData, FeedbackType } from '@/lib/firebase/feedback';

function formatDate(createdAt: FeedbackData['createdAt']): string {
  if (!createdAt) return '-';
  if (typeof (createdAt as { toDate?: () => Date }).toDate === 'function') {
    const d = (createdAt as { toDate: () => Date }).toDate();
    return d.toLocaleString('pt-BR');
  }
  if (createdAt instanceof Date) return createdAt.toLocaleString('pt-BR');
  return '-';
}

const typeLabels: Record<FeedbackType, string> = {
  'sugestão': 'Sugestão',
  'dúvida': 'Dúvida',
  'bug': 'Bug/Problema',
  'outro': 'Outro',
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await getFeedbacksForAdmin();
      if (result.success && result.data) {
        setFeedbacks(result.data);
      } else {
        setError(result.error ?? 'Erro ao carregar feedbacks');
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feedbacks</h1>
        <p className="text-gray-600 text-sm mt-1">
          Mensagens enviadas pelos usuários (sugestões, dúvidas, etc.)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          Nenhum feedback recebido ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-2xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  {typeLabels[fb.type]}
                </span>
                <span className="text-xs text-gray-500">{formatDate(fb.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{fb.userName}</p>
              <p className="text-xs text-gray-500 mb-2">{fb.userEmail}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
