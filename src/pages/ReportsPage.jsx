import React, { useState } from 'react';
import { Printer, Download, Calendar, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { 
  exportMembersToExcel, 
  exportExpensesToExcel, 
  exportSponsorsToExcel, 
  exportBhogToExcel 
} from '../services/exportService';

export default function ReportsPage({ db }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const inRange = (dStr) => {
    if (!dStr) return false;
    if (fromDate && dStr < fromDate) return false;
    if (toDate && dStr > toDate) return false;
    return true;
  };

  const filteredExpenses = (db.expenses || []).filter(e => !fromDate && !toDate ? true : inRange(e.expense_date));
  const filteredMarket = (db.marketEntries || []).filter(m => !fromDate && !toDate ? true : inRange(m.entry_date));
  const filteredPayments = (db.payments || []).filter(p => !fromDate && !toDate ? true : inRange(p.payment_date));

  const totalFilteredExpense = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalFilteredMarket = filteredMarket.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalFilteredCollection = filteredPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            রিপোর্ট ও অডিট বিবরণী
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            তারিখ অনুযায়ী ফিল্টার ও আনুষ্ঠানিক অডিট প্রিন্ট
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportExpensesToExcel(db.expenses || [], db.marketEntries || [])}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel খরচ</span>
          </button>
          <button
            onClick={() => exportMembersToExcel(db.members || [])}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel সদস্য</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Printer size={16} />
            <span>অডিট রিপোর্ট প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar (No print) */}
      <div className="no-print p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6] flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold text-stone-700 uppercase flex items-center gap-1">
          <Filter size={14} />
          তারিখ অনুযায়ী রিপোর্ট:
        </span>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-stone-500">শুরু:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-medium focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-stone-500">শেষ:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-medium focus:outline-none"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="text-xs text-[#800020] underline font-bold"
          >
            রিসেট
          </button>
        )}
      </div>

      {/* Printable Official Audit Sheet */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EADBB6] shadow-sm print:p-0 print:border-none print:shadow-none text-[#2D1810]">
        {/* Official Letterhead */}
        <div className="text-center border-b-2 border-[#800020] pb-4 mb-6">
          <div className="text-xs font-semibold text-[#800020] tracking-widest mb-1">
            ।। ওঁ শ্রী শ্রী শ্যামা পূজায়ৈ নমঃ ।।
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4A0E17]">
            {db.settings?.club_name || 'প্রগতি সংঘ'}
          </h1>
          <p className="text-base font-bold text-amber-900 mt-1">
            {db.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
          </p>
          <p className="text-xs text-stone-600 mt-1">
            বার্ষিক আয় ও ব্যয় সংক্রান্ত আর্থিক নিরীক্ষা ও বিবরণী (Official Audit Statement)
          </p>
          {(fromDate || toDate) && (
            <p className="text-xs font-semibold text-stone-700 mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">
              সময়কাল: {fromDate ? formatBnDate(fromDate) : 'শুরু থেকে'} - {toDate ? formatBnDate(toDate) : 'বর্তমান পর্যন্ত'}
            </p>
          )}
        </div>

        {/* 3 Summary Blocks */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center text-xs sm:text-sm">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-stone-600 block">মোট সংগৃহীত চাঁদা</span>
            <span className="text-lg font-bold text-[#4A0E17]">{formatTaka(totalFilteredCollection)}</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-stone-600 block">মোট বাজার খরচ</span>
            <span className="text-lg font-bold text-rose-800">{formatTaka(totalFilteredMarket)}</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-stone-600 block">মোট পূজা খরচ</span>
            <span className="text-lg font-bold text-purple-900">{formatTaka(totalFilteredExpense)}</span>
          </div>
        </div>

        {/* Expenses List */}
        <div className="mb-8">
          <h3 className="font-bold text-[#4A0E17] text-sm sm:text-base border-b border-stone-200 pb-2 mb-3">
            পূজা ব্যয়ের বিবরণী ({toBnDigits(filteredExpenses.length)} টি ভাউচার)
          </h3>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-stone-600">
                <th className="py-2">তারিখ</th>
                <th className="py-2">খাত</th>
                <th className="py-2">ক্যাটাগরি</th>
                <th className="py-2">কে করলেন</th>
                <th className="py-2 text-right">টাকা (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 text-stone-500">{e.expense_date}</td>
                  <td className="py-2 font-bold text-stone-800">{e.title}</td>
                  <td className="py-2 text-stone-600">{e.category}</td>
                  <td className="py-2 text-stone-600">{e.paid_by || '-'}</td>
                  <td className="py-2 text-right font-bold text-rose-800">{formatTaka(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures for Audit */}
        <div className="mt-16 pt-8 border-t border-stone-400 grid grid-cols-3 gap-6 text-center text-xs text-stone-700">
          <div>
            <div className="w-32 border-b border-stone-800 mx-auto mb-1"></div>
            <p className="font-bold text-stone-900">সভাপতি</p>
            <p className="text-[11px] text-stone-500">প্রগতি সংঘ</p>
          </div>
          <div>
            <div className="w-32 border-b border-stone-800 mx-auto mb-1"></div>
            <p className="font-bold text-stone-900">সাধারণ সম্পাদক</p>
            <p className="text-[11px] text-stone-500">পূজা কমিটি</p>
          </div>
          <div>
            <div className="w-32 border-b border-stone-800 mx-auto mb-1"></div>
            <p className="font-bold text-stone-900">কোষাধ্যক্ষ</p>
            <p className="text-[11px] text-stone-500">অর্থ ও হিসাব</p>
          </div>
        </div>
      </div>
    </div>
  );
}
