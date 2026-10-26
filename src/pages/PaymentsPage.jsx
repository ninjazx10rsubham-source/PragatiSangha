import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Share2, 
  Download, 
  Wallet,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { exportToExcel, getWhatsAppReceiptUrl } from '../services/exportService';

export default function PaymentsPage({ db, onOpenReceipt }) {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('সব');

  const payments = db.payments || [];
  const members = db.members || [];

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        !search ||
        p.receipt_no.toLowerCase().includes(search.toLowerCase()) ||
        p.member_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.collected_by && p.collected_by.toLowerCase().includes(search.toLowerCase()));

      const matchMode = modeFilter === 'সব' || p.payment_mode === modeFilter;
      return matchSearch && matchMode;
    });
  }, [payments, search, modeFilter]);

  const totalCollected = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleExportExcel = () => {
    const data = payments.map((p, idx) => ({
      'ক্রমিক': idx + 1,
      'রসিদ নং': p.receipt_no,
      'সদস্যের নাম': p.member_name,
      'জমা চাঁদা (₹)': p.amount,
      'পেমেন্ট তারিখ': p.payment_date,
      'পেমেন্ট মাধ্যম': p.payment_mode || 'নগদ',
      'আদায়কারী': p.collected_by || '-',
      'মন্তব্য': p.notes || '-'
    }));
    exportToExcel(data, 'প্রগতি_সংঘ_চাঁদার_রসিদ_ও_লেনদেন_হিসাব', 'লেনদেন হিস্ট্রি');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            চাঁদার রসিদ ও ট্রানজাকশন হিস্ট্রি
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            ইস্যুকৃত প্রতিটি চাঁদার ডিজিটাল রসিদ, পুনঃপ্রিন্ট ও হোয়াটসঅ্যাপ শেয়ার
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel রসিদ তালিকা</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Bar */}
      <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Wallet size={20} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase">রসিদভিত্তিক মোট আদায়</span>
            <p className="text-xl font-extrabold text-[#4A0E17]">{formatTaka(totalCollected)}</p>
          </div>
        </div>

        <div className="text-xs font-semibold text-stone-600">
          মোট ইস্যুকৃত রসিদ: <span className="text-stone-900 font-bold">{toBnDigits(filteredPayments.length)} টি</span>
        </div>
      </div>

      {/* Search & Mode Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="রসিদ নং (যেমন PS-2026-0001) বা নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0">
          {['সব', 'নগদ', 'UPI'].map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                modeFilter === m ? 'bg-[#4A0E17] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো রসিদ পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">রসিদ নং</th>
                  <th className="py-3 px-4">দাতার নাম</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">মাধ্যম</th>
                  <th className="py-3 px-4">আদায়কারী</th>
                  <th className="py-3 px-4 text-right">রশিদ ও শেয়ার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPayments.map((p) => {
                  const member = members.find(m => m.id === p.member_id || m.name === p.member_name);
                  const whatsappUrl = member?.phone ? getWhatsAppReceiptUrl(member.phone, p) : null;

                  return (
                    <tr key={p.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#800020]">
                        {p.receipt_no}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {p.member_name}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">
                        {formatTaka(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {formatBnDate(p.payment_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200">
                          {p.payment_mode || 'নগদ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {p.collected_by || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition border border-emerald-200"
                              title="WhatsApp-এ রশিদ পাঠান"
                            >
                              <Share2 size={13} />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => onOpenReceipt(p, member)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            <Printer size={13} />
                            <span>রশিদ প্রিন্ট</span>
                          </button>
                        </div>
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
