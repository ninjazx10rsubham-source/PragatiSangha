import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  Heart, 
  Phone, 
  MapPin, 
  Sparkles,
  Receipt,
  UtensilsCrossed,
  Printer
} from 'lucide-react';
import { formatTaka, toBnDigits } from '../utils/formatters';

export default function PublicPortalPage({ db, onOpenReceipt }) {
  const [search, setSearch] = useState('');

  const members = db.members || [];
  const sponsors = db.sponsors || [];

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.address && m.address.toLowerCase().includes(search.toLowerCase())) ||
      (m.phone && m.phone.includes(search))
    );
  }, [members, search]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#4A0E17] via-[#800020] to-[#36080F] text-white shadow-2xl relative overflow-hidden border-2 border-amber-300">
        <div className="absolute top-2 left-4 text-6xl opacity-10 select-none">🪔</div>
        <div className="absolute bottom-2 right-4 text-6xl opacity-10 select-none">🪔</div>
        
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs sm:text-sm font-bold mb-3 border border-amber-300/40">
          ।। শ্রী শ্রী শ্যামা পূজায়ৈ নমঃ ।।
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wide text-amber-300">
          {db.settings?.club_name || 'প্রগতি সংঘ'}
        </h1>
        <p className="text-lg sm:text-xl font-bold text-stone-200 mt-2">
          {db.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
        </p>
        <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-xl mx-auto">
          পাড়া ও ক্লাবের সকল নাগরিক ও ভক্তবৃন্দকে শ্রী শ্রী শ্যামা পূজার আন্তরিক প্রীতি ও শুভেচ্ছা।
        </p>
      </div>

      {/* Puja Schedule Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#4A0E17] flex items-center gap-2">
          <Calendar className="text-amber-700" size={22} />
          <span>পূজার নির্ঘণ্ট ও সময়সূচি</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
            <div className="flex items-center gap-2 text-[#800020] font-bold text-sm mb-2">
              <Clock size={16} />
              <span>নিশিপূজা ও আরতি</span>
            </div>
            <p className="text-lg font-extrabold text-stone-900">অমাবস্যা রাত্রি ১১:০০</p>
            <p className="text-xs text-stone-500 mt-1">মা শ্যামার মহা আরাধনা ও হোম যজ্ঞ</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-sm mb-2">
              <Sparkles size={16} />
              <span>পুষ্পাঞ্জলি প্রদান</span>
            </div>
            <p className="text-lg font-extrabold text-stone-900">রাত্রি ১২:৩০ ও সকাল ৯:০০</p>
            <p className="text-xs text-stone-500 mt-1">পুষ্পাঞ্জলির ফুল ও বেলপাতা ক্লাব থেকে দেওয়া হবে</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
              <UtensilsCrossed size={16} />
              <span>মহাপ্রসাদ ও ভোগ বিতরণ</span>
            </div>
            <p className="text-lg font-extrabold text-stone-900">পরদিন দুপুর ১:০০</p>
            <p className="text-xs text-stone-500 mt-1">কুপন প্রদর্শন সাপেক্ষে ভোগ সংগ্রহ করুন</p>
          </div>
        </div>
      </div>

      {/* Citizen Receipt Verification Tool */}
      <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-md space-y-4">
        <div className="flex items-center gap-2 text-[#4A0E17]">
          <Receipt size={22} />
          <div>
            <h3 className="font-bold text-base sm:text-lg">ডিজিটাল চাঁদা রসিদ যাচাই ও অনুসন্ধান</h3>
            <p className="text-xs text-stone-500">আপনার নাম বা বাড়ি নম্বর লিখে চাঁদা জমার স্ট্যাটাস দেখুন</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="আপনার নাম বা বাড়ি নম্বর লিখুন (যেমন: ১২/এ)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {search.trim() && (
          <div className="space-y-3 pt-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-4">কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক বানান লিখুন।</p>
            ) : (
              searchResults.map((m) => {
                const recentPay = (db.payments || []).find(p => p.member_id === m.id || p.member_name === m.name);
                return (
                  <div key={m.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-stone-900 text-base">{m.name}</div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        বাড়ি: <span className="font-semibold text-stone-800">{m.address || '-'}</span> | ধরন: {m.member_type}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-medium text-stone-700">জমা: <b className="text-emerald-700">{formatTaka(m.collected_amount)}</b></span>
                        <span className="font-medium text-stone-700">বাকি: <b className="text-rose-700">{formatTaka(Math.max(0, m.target_amount - m.collected_amount))}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.status === 'জমা হয়েছে' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>

                      {recentPay && (
                        <button
                          onClick={() => onOpenReceipt(recentPay, m)}
                          className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                        >
                          <Printer size={13} />
                          <span>রশিদ দেখুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Donors & Sponsors Roll of Honor */}
      {sponsors.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-purple-900 border-b border-[#EADBB6] pb-3">
            <Heart size={20} className="text-rose-600 fill-rose-600" />
            <h3 className="font-bold text-base sm:text-lg text-[#4A0E17]">
              কৃতজ্ঞতা স্বীকার ও প্রধান পৃষ্ঠপোষকবৃন্দ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sponsors.map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block text-sm">{s.sponsor_name}</span>
                  <span className="text-xs text-stone-500">{s.banner_type}</span>
                </div>
                <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full">
                  সহযোগী পৃষ্ঠপোষক
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Contact */}
      <div className="p-4 rounded-xl bg-stone-100 text-center text-xs text-stone-600">
        <p className="font-semibold text-stone-800">প্রগতি সংঘ পূজা পরিচালন সমিতি</p>
        <p className="mt-0.5">যে কোনো প্রয়োজনে যোগাযোগ করুন: সম্পাদক (98300XXXXX) • কোষাধ্যক্ষ (98311XXXXX)</p>
      </div>
    </div>
  );
}
