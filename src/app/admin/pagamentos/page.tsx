'use client';

import { CreditCard } from 'lucide-react';

export default function AdminPagamentosPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
        <p className="text-gray-600 text-sm mt-1">
          Aprovação manual de pagamentos dos usuários (em breve)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">Em breve</p>
        <p className="text-sm text-gray-500 mt-1">
          Aqui será exibida a lista de pagamentos para aprovação manual.
        </p>
      </div>
    </div>
  );
}
