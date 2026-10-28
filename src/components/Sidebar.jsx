import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  ShoppingBag, 
  ReceiptText, 
  UtensilsCrossed, 
  Megaphone, 
  Calculator, 
  FileSpreadsheet, 
  Printer, 
  Settings, 
  X,
  Sparkles,
  LogOut
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { id: 'members', label: 'সদস্য ও চাঁদা', icon: Users },
  { id: 'payments', label: 'রসিদ ও লেনদেন', icon: Receipt },
  { id: 'market', label: 'বাজারের ফর্দ', icon: ShoppingBag },
  { id: 'expenses', label: 'বিবিধ পূজা খরচ', icon: ReceiptText },
  { id: 'sponsors', label: 'ব্যানার ও বিজ্ঞাপন', icon: Megaphone },
  { id: 'calculator', label: 'বাজেট ক্যালকুলেটর', icon: Calculator },
  { id: 'summary', label: 'আয়-ব্যয় হিসাব', icon: FileSpreadsheet },
  { id: 'reports', label: 'রিপোর্ট ও এক্সেল', icon: Printer },
  { id: 'settings', label: 'সেটিংস ও ব্যাকআপ', icon: Settings },
];

export default function Sidebar({ activeTab, onNavigate, isOpen, onClose, onLogout }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs no-print"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FFFDF7] border-r border-[#EADBB6] flex flex-col transition-transform duration-300 no-print
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Area */}
        <div className="p-4 border-b border-[#EADBB6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪔</span>
            <div>
              <span className="font-extrabold text-[#4A0E17] text-base block leading-tight">
                প্রগতি সংঘ
              </span>
              <span className="text-[11px] font-semibold text-amber-800">
                শ্যামা পূজা পোর্টাল
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-[#F2E5C9]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left
                  ${isActive 
                    ? 'bg-[#4A0E17] text-amber-300 shadow-md transform translate-x-1 font-bold' 
                    : 'text-stone-700 hover:bg-[#F7EED3] hover:text-[#4A0E17]'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-amber-400 shrink-0' : 'text-stone-500 shrink-0'} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <Sparkles size={14} className="text-amber-300 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        {onLogout && (
          <div className="p-3 border-t border-[#EADBB6]">
            <button
              onClick={() => {
                if (onClose) onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 transition border border-rose-200 shadow-xs"
            >
              <LogOut size={15} />
              <span>লগআউট (লক করুন)</span>
            </button>
          </div>
        )}

        {/* Bottom Info */}
        <div className="p-3.5 border-t border-[#EADBB6] bg-gradient-to-b from-[#FFFDF7] to-[#FDF8EA] text-center">
          <p className="text-[11px] text-stone-500 font-medium">
            সংস্করণ ২.০ • ক্লাউড এডিশন
          </p>
          <p className="text-[10px] text-amber-900 font-semibold mt-0.5">
            প্রগতি সংঘ শ্রী শ্রী শ্যামা পূজা কমিটি
          </p>
        </div>
      </aside>
    </>
  );
}
