'use client';

// import Image from "next/image";
import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface TransactionModalProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

export default function TransactionModal({ type, onClose }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedResponsibleId, setSelectedResponsibleId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addTransaction, user, activeGroup, incomeCategories, expenseCategories } = useApp();

  const members = activeGroup.members;
  // Obter categorias baseadas no tipo de transação
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, insira um valor válido');
      setIsLoading(false);
      return;
    }

    try {
      // Simular upload do comprovante (em uma implementação real, isso enviaria para um servidor)
      let receiptUrl = '';
      if (receiptFile) {
        // Aqui você implementaria o upload real do arquivo
        // Por enquanto, vamos simular gerando uma URL local
        receiptUrl = URL.createObjectURL(receiptFile);
      }

      // Buscar o membro responsável baseado no ID nos membros do grupo ativo
      const responsibleMember = members.find(member => member.id === selectedResponsibleId);

      if (!responsibleMember) {
        alert('Por favor, selecione um responsável válido');
        setIsLoading(false);
        return;
      }

      await addTransaction({
        userId: user?.id || '1',
        date: new Date(),
        type,
        amount: numericAmount,
        responsible: responsibleMember,
        category: selectedCategory || '',
        receipt: receiptUrl, // URL do comprovante após upload
        description: description || (type === 'income' ? 'Receita' : 'Despesa'),
      });
      
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      setSelectedResponsibleId('');
      setReceiptFile(null);
      onClose();
    } catch {
      alert('Erro ao adicionar transação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione um arquivo JPEG, PNG ou PDF');
        return;
      }

      // Validar tamanho do arquivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB');
        return;
      }

      setReceiptFile(file);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatAmount = (value: string) => {
    // Remove tudo que não é dígito ou vírgula/ponto
    const cleaned = value.replace(/[^\d,.]/g, '');
    
    // Se há vírgula e ponto, mantém apenas o último
    const parts = cleaned.split(/[,.]/);
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={20} className="text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Cabeçalho Fixo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">
              {type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Conteúdo com Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável
            </label>
            <div className="relative">
              <select
                value={selectedResponsibleId}
                onChange={(e) => setSelectedResponsibleId(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white appearance-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-gray-900"
              >
                <option value="">Selecione um responsável</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="Ex: Salário, Alimentação, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria (opcional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    // Se a categoria já está selecionada, desmarca (toggle)
                    if (selectedCategory === category.title) {
                      setSelectedCategory('');
                    } else {
                      setSelectedCategory(category.title);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedCategory === category.title
                      ? `border-yellow-500 text-yellow-500`
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprovante (opcional)
            </label>
            
            {!receiptFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Clique para adicionar comprovante</p>
                <p className="text-xs text-gray-500">JPEG, PNG ou PDF (máx. 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(receiptFile)}
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                        {receiptFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="flex space-x-3 p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}