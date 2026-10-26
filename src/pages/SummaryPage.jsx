import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Save, 
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { formatTaka, toBnDigits } from '../utils/formatters';

export default function SummaryPage({ db, onUpdateDB, showToast }) {
  const [otherIncomeInput, setOtherIncomeInput] = useState(db.settings?.other_income || 0);

  // Income Breakdown
  const totalChanda = (db.members || []).reduce((sum, m) => sum + (Number(m.collected_amount) || 0), 0);
  const totalSponsors = (db.sponsors || []).reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
  const otherIncome = Number(db.settings?.other_income) || 0;
  const grandTotalIncome = totalChanda + totalSponsors + otherIncome;

  // Expenses Breakdown
  const totalMarket = (db.marketEntries || []).reduce((sum, mk) => sum + (Number(mk.amount) || 0), 0);
  const totalExpenses = (db.expenses || []).reduce((sum, ex) => sum + (Number(ex.amount) || 0), 0);
  const grandTotalExpenses = totalMarket + totalExpenses;

  const netBalance = grandTotalIncome - grandTotalExpenses;

  // Category-wise expenses
  const categoryExpenses = {};
  (db.expenses || []).forEach((e) => {
    categoryExpenses[e.category] = (categoryExpenses[e.category] || 0) + (Number(e.amount) || 0);
  });
  categoryExpenses['বাজার খরচ'] = totalMarket;

  const handleSaveOtherIncome = (e) => {
    e.preventDefault();
    const val = Number(otherIncomeInput) || 0;
    onUpdateDB((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        other_income: val
      }
    }));
    showToast('অন্যান্য আয় সফলভাবে সংরক্ষিত হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
          আয়-ব্যয় চূড়ান্ত হিসাব ও ভাণ্ডার স্থিতি
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          পূজা কমিটির সামগ্রিক আর্থিক ব্যালেন্স শিট
        </p>
      </div>

      {/* Big Balance Banner */}
      <div className={`p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        netBalance >= 0 
          ? 'bg-gradient-to-r from-[#4A0E17] via-[#800020] to-[#5C101B] border-2 border-amber-300' 
          : 'bg-gradient-to-r from-rose-900 to-red-950 border-2 border-rose-300'
      }`}>
        <div>
          <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
            হাতে নগদ / নিট তহবিল স্থিতি
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold mt-1">
            {formatTaka(netBalance)}
          </h3>
          <p className="text-xs text-stone-200 mt-1">
            {netBalance >= 0 ? 'তহবিল উদ্বৃত্ত রয়েছে (Surplus)' : 'তহবিলে ঘাটতি রয়েছে (Deficit)'}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 text-right">
            <span className="text-xs text-amber-200 block">সর্বমোট আয়</span>
            <span className="text-xl font-extrabold text-amber-300">{formatTaka(grandTotalIncome)}</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 text-right">
            <span className="text-xs text-rose-200 block">সর্বমোট ব্যয়</span>
            <span className="text-xl font-extrabold text-rose-300">{formatTaka(grandTotalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Income Sheet & Expense Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EADBB6] pb-3 text-emerald-800">
            <TrendingUp size={20} />
            <h3 className="font-bold text-base text-[#4A0E17]">১. আয়ের বিস্তারিত বিবরণী (Income)</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
              <div>
                <span className="font-bold text-stone-800 block">নাগরিক ও সদস্যদের সংগৃহীত চাঁদা</span>
                <span className="text-xs text-stone-500">
                  পরিশোধকারী: {toBnDigits((db.members || []).filter(m => m.collected_amount > 0).length)} জন
                </span>
              </div>
              <span className="text-base font-extrabold text-[#4A0E17]">{formatTaka(totalChanda)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200">
              <div>
                <span className="font-bold text-stone-800 block">বিজ্ঞাপন ও ব্যানার স্পনসরশিপ</span>
                <span className="text-xs text-stone-500">
                  দাতা প্রতিষ্ঠান: {toBnDigits((db.sponsors || []).length)} টি
                </span>
              </div>
              <span className="text-base font-extrabold text-purple-900">{formatTaka(totalSponsors)}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 block">অন্যান্য বিবিধ আয় ও সাধারণ দান</span>
                  <span className="text-xs text-stone-500">প্রণামী বাক্স, দানপত্র ইত্যাদি</span>
                </div>
                <span className="text-base font-extrabold text-stone-900">{formatTaka(otherIncome)}</span>
              </div>

              {/* Editable Input */}
              <form onSubmit={handleSaveOtherIncome} className="flex gap-2 pt-2 border-t border-stone-200">
                <input
                  type="number"
                  min="0"
                  value={otherIncomeInput}
                  onChange={(e) => setOtherIncomeInput(e.target.value)}
                  placeholder="টাকার পরিমাণ লিখুন"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Save size={13} />
                  <span>আপডেট</span>
                </button>
              </form>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between font-extrabold text-sm sm:text-base text-emerald-900">
              <span>সর্বমোট আয়</span>
              <span>{formatTaka(grandTotalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EADBB6] pb-3 text-rose-800">
            <TrendingDown size={20} />
            <h3 className="font-bold text-base text-[#4A0E17]">২. ব্যয়ের বিস্তারিত বিবরণী (Expenses)</h3>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            {Object.entries(categoryExpenses).map(([cat, amt]) => {
              const pct = grandTotalExpenses > 0 ? Math.round((amt / grandTotalExpenses) * 100) : 0;
              return (
                <div key={cat} className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#800020]"></span>
                    <div>
                      <span className="font-bold text-stone-800">{cat}</span>
                      <span className="text-[11px] text-stone-500 ml-1.5 font-semibold">({toBnDigits(pct)}%)</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-rose-800">{formatTaka(amt)}</span>
                </div>
              );
            })}

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between font-extrabold text-sm sm:text-base text-rose-900 mt-4">
              <span>সর্বমোট ব্যয়</span>
              <span>{formatTaka(grandTotalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
