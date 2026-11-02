import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, Wallet, Receipt, Download, Users } from 'lucide-react';
import { formatTaka, toBnDigits, formatBnDate, getBnDayName } from '../utils/formatters';

export default function DailyCollectionSection({ payments = [], onSelectDate, selectedDate }) {
  const [expandedDate, setExpandedDate] = useState(null);

  // Group payments by date and calculate total sum
  const dailyData = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      const d = p.payment_date || (p.created_at ? p.created_at.slice(0, 10) : 'অজানা');
      if (!map[d]) {
        map[d] = {
          date: d,
          total: 0,
          count: 0,
          payments: []
        };
      }
      map[d].total += Number(p.amount) || 0;
      map[d].count += 1;
      map[d].payments.push(p);
    });

    // Sort descending by date
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [payments]);

  const grandTotal = dailyData.reduce((sum, d) => sum + d.total, 0);
  const totalReceiptsCount = dailyData.reduce((sum, d) => sum + d.count, 0);

  const toggleExpand = (date) => {
    setExpandedDate(prev => (prev === date ? null : date));
  };

  return (
    <div className="rounded-2xl bg-[#FFFDF7] border-2 border-[#EADBB6] shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#F7EED3] to-[#FDF8EA] border-b border-[#EADBB6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#800020] text-amber-300 shadow-sm shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#4A0E17] flex items-center gap-2">
              <span>📅 দিন অনুযায়ী মোট চাঁদা জমার খাতা</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] font-bold">
                Daily Sum Register
              </span>
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              কোন তারিখে মোট কত টাকা জমা হয়েছে তার নির্দিষ্ট যোগফল (তারিখ অনুযায়ী সাজানো)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#EADBB6] text-right shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">সর্বমোট জমা (Sum)</span>
            <span className="text-lg font-black text-[#800020]">{formatTaka(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#F7EED3]/80 text-[#4A0E17] font-extrabold border-b border-[#EADBB6]">
            <tr>
              <th className="py-3 px-4">ক্রমিক</th>
              <th className="py-3 px-4">তারিখ (Date)</th>
              <th className="py-3 px-4">বার (Day)</th>
              <th className="py-3 px-4 text-center">রসিদ সংখ্যা</th>
              <th className="py-3 px-4 text-right">ওই দিনের মোট যোগফল (Total Sum)</th>
              <th className="py-3 px-4 text-center">সদস্য ও রসিদ তালিকা</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBB6]/60">
            {dailyData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-stone-400 font-medium">
                  এখনও কোনো চাঁদা জমার রেকর্ড নেই।
                </td>
              </tr>
            ) : (
              dailyData.map((item, idx) => {
                const isExpanded = expandedDate === item.date;
                const isSelected = selectedDate === item.date;

                return (
                  <React.Fragment key={item.date}>
                    <tr
                      className={`transition ${
                        isSelected 
                          ? 'bg-amber-100/70 font-semibold' 
                          : idx % 2 === 0 
                            ? 'bg-white hover:bg-[#FFFDF7]' 
                            : 'bg-[#FFFDF7]/60 hover:bg-[#FFFDF7]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                        {toBnDigits(idx + 1)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <span>📅 {formatBnDate(item.date)}</span>
                          <span className="text-[11px] font-mono text-stone-500 font-normal">
                            ({item.date})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-600">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 text-xs">
                          {getBnDayName(item.date)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-stone-700">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-mono text-xs">
                          {toBnDigits(item.count)} টি রসিদ
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base sm:text-lg font-black text-[#800020] bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/70 inline-block font-mono">
                          {formatTaka(item.total)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleExpand(item.date)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 border ${
                            isExpanded
                              ? 'bg-[#800020] text-white border-[#800020]'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-[#800020] hover:text-[#800020]'
                          }`}
                        >
                          <Users size={14} />
                          <span>{isExpanded ? 'লুকান' : 'কারা দিয়েছেন দেখুন'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>

                    {/* Accordion / Expanded Details for this date */}
                    {isExpanded && (
                      <tr className="bg-[#FFF8E7]/70">
                        <td colSpan="6" className="p-4 sm:p-5 border-y border-amber-200">
                          <div className="bg-white rounded-xl border border-[#EADBB6] p-4 shadow-inner space-y-3">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                              <span className="font-bold text-xs sm:text-sm text-[#4A0E17]">
                                📋 {formatBnDate(item.date)} তারিখে আদায়কৃত {toBnDigits(item.count)} টি রসিদের পূর্ণ বিবরণ:
                              </span>
                              <span className="font-extrabold text-sm text-[#800020]">
                                মোট আদায়: {formatTaka(item.total)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {item.payments.map((p) => (
                                <div
                                  key={p.id}
                                  className="p-2.5 rounded-lg border border-stone-200 bg-[#FFFDF7] flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-stone-900">{p.member_name}</div>
                                    <div className="text-[11px] font-mono text-stone-500">
                                      রসিদ: {p.receipt_no} ({p.payment_mode || 'নগদ'})
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-emerald-800 text-sm font-mono">
                                      {formatTaka(p.amount)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* Grand Total Footer */}
          {dailyData.length > 0 && (
            <tfoot className="bg-[#F7EED3] text-[#4A0E17] font-black border-t-2 border-[#800020]">
              <tr>
                <td className="py-3.5 px-4 text-center font-bold" colSpan="3">
                  সর্বমোট সংগৃহীত চাঁদা (Grand Total Collection - {toBnDigits(dailyData.length)} দিন)
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-sm">
                  {toBnDigits(totalReceiptsCount)} টি রসিদ
                </td>
                <td className="py-3.5 px-4 text-right text-lg sm:text-xl font-black text-[#800020] font-mono">
                  {formatTaka(grandTotal)}
                </td>
                <td className="py-3.5 px-4 text-center text-xs font-semibold text-stone-600">
                  সম্পূর্ণ হিসাব সঠিক ✓
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
