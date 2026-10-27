import React from 'react';
import { Menu, Cloud, CloudOff, Globe, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ 
  onMenuToggle, 
  isCloudConnected, 
  onOpenCloudSettings, 
  activeTab, 
  onNavigate,
  onRefresh
}) {
  return (
    <header className="no-print bg-[#FFFDF7] border-b border-[#EADBB6] sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-[#F2E5C9] transition"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800020] to-[#4A0E17] flex items-center justify-center text-white text-xl shadow-md border border-amber-300">
              🪔
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#4A0E17] leading-tight flex items-center gap-1.5">
                <span>প্রগতি সংঘ</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200 hidden sm:inline-block">
                  শ্যামা পূজা ২০২৬
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                ক্লাউড-সিঙ্কড পূজা ও চাঁদা ম্যানেজমেন্ট পোর্টাল
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cloud Status, Refresh, Public Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="তথ্য রিফ্রেশ করুন"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#F2E5C9] rounded-xl transition"
            >
              <RefreshCw size={17} />
            </button>
          )}

          {/* Permanent Cloud Status Pill */}
          <div
            title="Supabase ক্লাউড ডাটাবেস 24/7 স্থায়ীভাবে সংযুক্ত"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 select-none shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud size={14} className="text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">ক্লাউড সংযুক্ত</span>
          </div>

          {/* Public Portal Switch */}
          <button
            onClick={() => onNavigate(activeTab === 'public' ? 'dashboard' : 'public')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
              activeTab === 'public'
                ? 'bg-[#4A0E17] text-white border-[#4A0E17]'
                : 'bg-[#FDF8EA] text-[#4A0E17] border-[#EADBB6] hover:bg-[#F2E5C9]'
            }`}
          >
            <Globe size={15} />
            <span className="hidden md:inline">{activeTab === 'public' ? 'অ্যাডমিন প্যানেল' : 'পাবলিক ভিউ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
