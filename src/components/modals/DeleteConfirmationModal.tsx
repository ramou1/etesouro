"use client";

import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  groupName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Confirmar Exclusão
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Tem certeza que deseja excluir o grupo{" "}
            <span className="text-lg font-semibold text-gray-800 mb-4">
              {groupName}
            </span>
            ?
          </p>

          <p className="text-sm text-red-600">
            ⚠️ Esta ação não pode ser desfeita. Todas as transações e dados
            deste grupo serão perdidos.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
