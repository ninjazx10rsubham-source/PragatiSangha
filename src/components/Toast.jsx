import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 text-sm font-medium border animate-slide-up bg-[#FFFDF7] text-[#3a1210] border-[#EADBB6]">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-[#F2E5C9] rounded-lg text-stone-500 transition-colors ml-2"
      >
        <X size={15} />
      </button>
    </div>
  );
}
