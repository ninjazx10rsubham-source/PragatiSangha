import React from 'react';
import { 
  Users, 
  Wallet, 
  ShoppingBag, 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  UtensilsCrossed,
  Share2,
  Printer
} from 'lucide-react';
import { formatTaka, toBnDigits } from '../utils/formatters';

export default function DashboardPage({ db, onNavigate, onOpenReceipt }) {
  // Calculations
  const totalChanda = (db.members || []).reduce((sum, m) => sum + (Number(m.collected_amount) || 0), 0);
  const targetChanda = (db.members || []).reduce((sum, m) => sum + (Number(m.target_amount) || 0), 0);
  const otherIncome = Number(db.settings?.other_income) || 0;
  
  const sponsorIncome = (db.sponsors || []).reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
  const totalIncome = totalChanda + otherIncome + sponsorIncome;

  const totalMarket = (db.marketEntries || []).reduce((sum, mk) => sum + (Number(mk.amount) || 0), 0);
  const totalExpenses = (db.expenses || []).reduce((sum, ex) => sum + (Number(ex.amount) || 0), 0);
  const grandExpenses = totalMarket + totalExpenses;

  const netBalance = totalIncome - grandExpenses;

  const paidMembersCount = (db.members || []).filter(m => m.status === 'জমা হয়েছে').length;
  const partialMembersCount = (db.members || []).filter(m => m.status === 'আংশিক জমা').length;
  const pendingMembersCount = (db.members || []).filter(m => m.status === 'বাকি').length;

  const totalBhogCoupons = (db.bhogCoupons || []).reduce((sum, b) => sum + (Number(b.coupon_count) || 0), 0);
  const deliveredBhogCount = (db.bhogCoupons || [])
    .filter(b => b.status === 'দেওয়া হয়েছে')
    .reduce((sum, b) => sum + (Number(b.coupon_count) || 0), 0);

  const recentPayments = (db.payments || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#3B0710] via-[#800020] to-[#4A0E17] text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-amber-400/40">
        <div className="absolute right-4 -bottom-6 text-9xl opacity-10 select-none">🪔</div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)] shrink-0">
            <img src="/maa_shyama.jpg" alt="মা শ্যামা" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-1 border border-amber-300/30">
              🌸 ।। শ্রী শ্রী শ্যামা পূজায় নমঃ ।। 🌸
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-white">
              {db.settings?.club_name || 'প্রগতি সংঘ'} ড্যাশবোর্ড
            </h2>
            <p className="text-amber-100/90 text-xs sm:text-sm font-medium mt-0.5">
              {db.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
            </p>
          </div>
        </div>

        {(db.members || []).length === 0 && (
          <div className="relative z-10">
            <button
              onClick={() => onNavigate('members')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#3B0710] font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              <span>প্রথম সদস্যের চাঁদা ইনপুট দিন</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance Card */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">তহবিলের বর্তমান স্থিতি</span>
            <div className={`p-2.5 rounded-xl ${netBalance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              <Wallet size={20} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-[#4A0E17]' : 'text-rose-700'}`}>
            {formatTaka(netBalance)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-stone-600">
            <TrendingUp size={14} className="text-amber-600" />
            <span>আয় - মোট খরচ</span>
          </div>
        </div>

        {/* Total Collection Card */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">মোট সংগৃহীত চাঁদা</span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Receipt size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#4A0E17] mt-2">
            {formatTaka(totalChanda)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-stone-600">
            <span>লক্ষ্যমাত্রা: {formatTaka(targetChanda)}</span>
            <span className="text-amber-800 font-bold ml-1">
              ({toBnDigits(targetChanda > 0 ? Math.round((totalChanda / targetChanda) * 100) : 0)}%)
            </span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">মোট খরচ (পূজা + বাজার)</span>
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-800 mt-2">
            {formatTaka(grandExpenses)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-600">
            <span>পূজা: {formatTaka(totalExpenses)}</span>
            <span>বাজার: {formatTaka(totalMarket)}</span>
          </div>
        </div>

        {/* Other Income & Sponsorship */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">বিজ্ঞাপন ও অনুদান</span>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-2">
            {formatTaka(otherIncome + sponsorIncome)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-600">
            <span>স্পনসর: {formatTaka(sponsorIncome)}</span>
            <span>দান: {formatTaka(otherIncome)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Rows: Members Progress & Bhog Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Members Status Breakdown */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#4A0E17] flex items-center gap-2">
              <Users size={18} className="text-amber-800" />
              <span>সদস্য ও চাঁদা পরিসংখ্যান</span>
            </h3>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs font-bold text-[#800020] hover:underline"
            >
              সব সদস্য দেখুন →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-1">
                <CheckCircle2 size={14} />
                <span>পরিশোধিত</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-800">{toBnDigits(paidMembersCount)} জন</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-semibold mb-1">
                <Clock size={14} />
                <span>আংশিক জমা</span>
              </div>
              <span className="text-xl font-extrabold text-amber-800">{toBnDigits(partialMembersCount)} জন</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-1">
                <AlertCircle size={14} />
                <span>বাকি আছে</span>
              </div>
              <span className="text-xl font-extrabold text-rose-800">{toBnDigits(pendingMembersCount)} জন</span>
            </div>
          </div>
        </div>

        {/* Bhog Distribution Overview */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#4A0E17] flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-amber-800" />
              <span>ভোগ বিতরণ পরিস্থিতি</span>
            </h3>
            <button
              onClick={() => onNavigate('bhog')}
              className="text-xs font-bold text-[#800020] hover:underline"
            >
              ভোগ তালিকা দেখুন →
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div>
              <p className="text-xs text-stone-600 font-medium">মোট নথিভুক্ত ভোগ কুপন</p>
              <p className="text-2xl font-extrabold text-[#4A0E17] mt-0.5">{toBnDigits(totalBhogCoupons)} টি</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-600 font-medium">বিতরণ সম্পন্ন হয়েছে</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                {toBnDigits(deliveredBhogCount)} টি 
                <span className="text-xs font-semibold text-stone-500 ml-1">
                  ({toBnDigits(totalBhogCoupons > 0 ? Math.round((deliveredBhogCount / totalBhogCoupons) * 100) : 0)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#4A0E17] text-base">সাম্প্রতিক জমা হওয়া চাঁদা ও রসিদ</h3>
            <p className="text-xs text-stone-500">সর্বশেষ ৫টি ট্রানজাকশন</p>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="text-xs font-bold text-[#800020] hover:underline"
          >
            সব রসিদ দেখুন →
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-sm">
            এখনো কোনো চাঁদা জমা হয়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="pb-2.5">রসিদ নং</th>
                  <th className="pb-2.5">সদস্যের নাম</th>
                  <th className="pb-2.5">টাকা</th>
                  <th className="pb-2.5">তারিখ</th>
                  <th className="pb-2.5">মাধ্যম</th>
                  <th className="pb-2.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentPayments.map((p) => {
                  const member = (db.members || []).find(m => m.id === p.member_id || m.name === p.member_name);
                  return (
                    <tr key={p.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 font-mono font-bold text-[#800020]">{p.receipt_no}</td>
                      <td className="py-3 font-semibold text-stone-900">{p.member_name}</td>
                      <td className="py-3 font-bold text-emerald-700">{formatTaka(p.amount)}</td>
                      <td className="py-3 text-stone-600">{p.payment_date}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
                          {p.payment_mode || 'নগদ'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenReceipt(p, member)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-[#4A0E17] rounded-lg text-xs font-bold transition"
                        >
                          <Printer size={13} />
                          <span>রশিদ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
