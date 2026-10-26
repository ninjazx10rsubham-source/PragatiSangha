import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 no-print">
      <div 
        className={`bg-[#FFFDF7] rounded-2xl shadow-2xl border border-[#EADBB6] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-hidden transform transition-all duration-300 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EADBB6] bg-gradient-to-r from-[#F7EED3] to-[#FFFDF7]">
          <h3 className="text-lg font-bold text-[#4A0E17] tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#EADBB6]/50 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
