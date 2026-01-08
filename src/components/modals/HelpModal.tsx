'use client';

import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { saveFeedback, FeedbackType } from '@/lib/firebase/feedback';

interface HelpModalProps {
  onClose: () => void;
}

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'sugestão', label: 'Sugestão' },
  { value: 'dúvida', label: 'Dúvida' },
  { value: 'bug', label: 'Bug/Problema' },
  { value: 'outro', label: 'Outro' },
];

export default function HelpModal({ onClose }: HelpModalProps) {
  const { user } = useApp();
  const [type, setType] = useState<FeedbackType>('sugestão');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!description.trim()) {
      setError('Por favor, descreva sua mensagem.');
      return;
    }

    if (!user?.id || !user?.name || !user?.email) {
      setError('Usuário não autenticado.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await saveFeedback(
        user.id,
        user.name,
        user.email,
        type,
        description
      );

      if (result.success) {
        setSuccess(true);
        // Limpar formulário
        setDescription('');
        // Fechar modal após 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle size={24} className="text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800">Ajuda</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Mensagem enviada com sucesso!
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Obrigado pelo seu feedback. Entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <>
                {/* Tipo de Feedback */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                    required
                  >
                    {FEEDBACK_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none text-gray-900"
                    placeholder="Descreva sua sugestão, dúvida ou problema..."
                    rows={8}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Seja o mais específico possível para que possamos ajudá-lo melhor.
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
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
                disabled={isLoading || !description.trim()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
