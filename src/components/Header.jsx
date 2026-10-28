import React from 'react';
import { Menu, Cloud, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { MAA_SHYAMA_IMG } from '../assets/maaShyamaImage';

export default function Header({ 
  onMenuToggle, 
  isCloudConnected, 
  activeTab, 
  onNavigate,
  onRefresh,
  onOpenSplash
}) {
  return (
    <header className="no-print bg-[#FFFDF7] border-b border-[#EADBB6] sticky top-0 z-30 shadow-xs">
      {/* Top Sacred Invocation Bar */}
      <div className="bg-gradient-to-r from-[#3B0710] via-[#800020] to-[#3B0710] text-amber-200 py-1 px-4 text-center text-[11px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-2 border-b border-amber-400/30">
        <Sparkles size={12} className="text-amber-300 animate-pulse hidden sm:inline" />
        <span>🌸 ॥ শ্রী শ্রী শ্যামা পূজায় নমঃ ॥ 🌸</span>
        <span className="hidden md:inline text-amber-300/80">• প্রগতি সংঘ — শ্যামা পূজা ২০২৬</span>
        <Sparkles size={12} className="text-amber-300 animate-pulse hidden sm:inline" />
      </div>

      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle, Maa Shyama Photo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-[#F2E5C9] transition"
            title="মেনু খুলুন"
          >
            <Menu size={22} />
          </button>
          
          <div 
            onClick={onOpenSplash}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="মা শ্যামার দর্শন অ্যানিমেশন দেখুন"
          >
            {/* Maa Shyama Uploaded Photo Thumbnail with Sacred Ring */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-md group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.6)] transition shrink-0">
              <img
                src={MAA_SHYAMA_IMG}
                alt="মা শ্যামা"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-[#4A0E17] leading-tight">
                  শ্রী শ্রী শ্যামা পূজায় নমঃ
                </h1>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 hidden md:inline-block">
                  প্রগতি সংঘ ২০২৬
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                <span>প্রগতি সংঘ পূজা পোর্টাল</span>
                <span className="text-stone-300">•</span>
                <span className="text-amber-700 font-medium hidden sm:inline">নতুন ডাটা ইনপুট প্রস্তুত</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Splash replay, Cloud Status, Refresh, Public Portal */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Replay Opening Animation */}
          {onOpenSplash && (
            <button
              onClick={onOpenSplash}
              title="মা শ্যামার দর্শন অ্যানিমেশন পুনরায় দেখুন"
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <span>🪔</span>
              <span className="hidden sm:inline">শ্যামা দর্শন</span>
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="ক্লাউড থেকে তথ্য রিফ্রেশ করুন"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#F2E5C9] rounded-xl transition"
            >
              <RefreshCw size={16} />
            </button>
          )}

          {/* Permanent Cloud Status Pill */}
          <div
            title="Supabase ক্লাউড ডাটাবেস 24/7 স্থায়ীভাবে সংযুক্ত"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 select-none shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud size={14} className="text-emerald-600 shrink-0" />
            <span className="hidden md:inline">ক্লাউড লাইভ</span>
          </div>

          {/* Public Portal Switch */}
          <button
            onClick={() => onNavigate(activeTab === 'public' ? 'dashboard' : 'public')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border ${
              activeTab === 'public'
                ? 'bg-[#4A0E17] text-white border-[#4A0E17]'
                : 'bg-[#FDF8EA] text-[#4A0E17] border-[#EADBB6] hover:bg-[#F2E5C9]'
            }`}
          >
            <Globe size={14} />
            <span className="hidden sm:inline">{activeTab === 'public' ? 'অ্যাডমিন প্যানেল' : 'পাবলিক ভিউ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
