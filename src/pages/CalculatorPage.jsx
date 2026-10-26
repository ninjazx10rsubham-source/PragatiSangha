import React, { useState } from 'react';
import { Calculator, Sparkles, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatTaka, toBnDigits } from '../utils/formatters';

export default function CalculatorPage({ db }) {
  // Budget projection state
  const [projectedMembers, setProjectedMembers] = useState(150);
  const [avgChanda, setAvgChanda] = useState(500);
  const [projectedSponsors, setProjectedSponsors] = useState(30000);
  const [projectedDonations, setProjectedDonations] = useState(15000);

  // Projected Expenses
  const [expIdol, setExpIdol] = useState(18000);
  const [expPandal, setExpPandal] = useState(35000);
  const [expLight, setExpLight] = useState(15000);
  const [expBhog, setExpBhog] = useState(20000);
  const [expMarket, setExpMarket] = useState(12000);
  const [expSound, setExpSound] = useState(8000);
  const [expMisc, setExpMisc] = useState(5000);

  const projectedChandaTotal = projectedMembers * avgChanda;
  const projectedTotalIncome = projectedChandaTotal + Number(projectedSponsors) + Number(projectedDonations);
  
  const projectedTotalExpenses = 
    Number(expIdol) + 
    Number(expPandal) + 
    Number(expLight) + 
    Number(expBhog) + 
    Number(expMarket) + 
    Number(expSound) + 
    Number(expMisc);

  const projectedBalance = projectedTotalIncome - projectedTotalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
          পূজা বাজেট ও ব্যালেন্স ক্যালকুলেটর
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          প্রত্যাশিত চাঁদা, অনুদান এবং ব্যয়ের প্রাক্কলন (Budget Forecasting)
        </p>
      </div>

      {/* Projection Result Card */}
      <div className={`p-6 rounded-2xl text-white shadow-xl transition-all ${
        projectedBalance >= 0 
          ? 'bg-gradient-to-r from-emerald-800 to-teal-900 border-2 border-emerald-400' 
          : 'bg-gradient-to-r from-rose-900 to-red-950 border-2 border-rose-400'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              প্রাক্কলিত চূড়ান্ত ফলাফল
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold mt-1">
              {formatTaka(projectedBalance)}
            </h3>
            <p className="text-xs text-stone-200 mt-1">
              {projectedBalance >= 0 
                ? 'উদ্বৃত্ত বা লাভ (Surplus) তহবিলে অবশিষ্ট থাকবে' 
                : 'ঘাটতি (Deficit) - অতিরিক্ত অনুদান বা স্পনসর প্রয়োজন'}
            </p>
          </div>

          <div className="flex gap-6 text-xs sm:text-sm">
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <span className="text-stone-300 block">মোট প্রাক্কলিত আয়</span>
              <span className="text-lg font-bold text-amber-300">{formatTaka(projectedTotalIncome)}</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/20">
              <span className="text-stone-300 block">মোট প্রাক্কলিত ব্যয়</span>
              <span className="text-lg font-bold text-rose-300">{formatTaka(projectedTotalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Projection */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EADBB6] pb-3">
            <TrendingUp className="text-emerald-700" size={18} />
            <h3 className="font-bold text-[#4A0E17] text-base">১. প্রত্যাশিত আয় প্রাক্কলন</h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                সম্ভাব্য সদস্য / নাগরিক সংখ্যা: <span className="text-[#800020] font-mono">{toBnDigits(projectedMembers)} জন</span>
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={projectedMembers}
                onChange={(e) => setProjectedMembers(Number(e.target.value))}
                className="w-full accent-[#800020]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                গড় নির্ধারিত চাঁদা: <span className="text-[#800020] font-mono">{formatTaka(avgChanda)}</span>
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={avgChanda}
                onChange={(e) => setAvgChanda(Number(e.target.value))}
                className="w-full accent-[#800020]"
              />
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between font-bold text-xs">
              <span className="text-stone-600">চাঁদা বাবদ সম্ভাব্য আয়:</span>
              <span className="text-[#4A0E17] font-extrabold">{formatTaka(projectedChandaTotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-stone-700 font-bold mb-1">স্পনসর ও ব্যানার (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={projectedSponsors}
                  onChange={(e) => setProjectedSponsors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">বিবিধ দান ও অনুদান (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={projectedDonations}
                  onChange={(e) => setProjectedDonations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Projection */}
        <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EADBB6] pb-3">
            <TrendingDown className="text-rose-700" size={18} />
            <h3 className="font-bold text-[#4A0E17] text-base">২. সম্ভাব্য ব্যয়ের বাজেট</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">প্রতিমা (₹)</label>
              <input
                type="number"
                value={expIdol}
                onChange={(e) => setExpIdol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">প্যান্ডেল ও ডেকোরেশন (₹)</label>
              <input
                type="number"
                value={expPandal}
                onChange={(e) => setExpPandal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">আলো ও সাজসজ্জা (₹)</label>
              <input
                type="number"
                value={expLight}
                onChange={(e) => setExpLight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">ভোগ ও প্রসাদ সামগ্রী (₹)</label>
              <input
                type="number"
                value={expBhog}
                onChange={(e) => setExpBhog(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">বাজারের অন্যান্য ফর্দ (₹)</label>
              <input
                type="number"
                value={expMarket}
                onChange={(e) => setExpMarket(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">মাইক ও সাউন্ড (₹)</label>
              <input
                type="number"
                value={expSound}
                onChange={(e) => setExpSound(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-stone-700 font-bold mb-1">জরুরি ও আপৎকালীন তহবিল (₹)</label>
              <input
                type="number"
                value={expMisc}
                onChange={(e) => setExpMisc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
