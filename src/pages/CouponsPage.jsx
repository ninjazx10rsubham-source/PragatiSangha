import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Wallet, 
  Calendar, 
  MapPin,
  Target,
  AlertTriangle,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { exportCouponsToExcel } from '../services/exportService';

export default function CouponsPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  
  // Modal states: null | { type: 'add' } | { type: 'edit', coupon } | { type: 'delete', coupon }
  const [modalState, setModalState] = useState(null);

  const coupons = db.bhogCoupons || [];

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: todayStr,
    amount: '',
    source_location: '',
    purpose: '',
    payment_mode: 'নগদ'
  });

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch =
        !search ||
        (c.source_location && c.source_location.toLowerCase().includes(search.toLowerCase())) ||
        (c.purpose && c.purpose.toLowerCase().includes(search.toLowerCase())) ||
        (c.date && c.date.includes(search)) ||
        (c.amount && String(c.amount).includes(search));

      return matchSearch;
    });
  }, [coupons, search]);

  // Statistics
  const totalAmount = coupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const todayAmount = coupons
    .filter(c => (c.date || c.payment_date) === todayStr)
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    setForm({
      date: todayStr,
      amount: '',
      source_location: '',
      purpose: '',
      payment_mode: 'নগদ'
    });
    setModalState({ type: 'add' });
  };

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setForm({
      date: c.date || c.payment_date || todayStr,
      amount: c.amount || '',
      source_location: c.source_location || c.donor_name || '',
      purpose: c.purpose || '',
      payment_mode: c.payment_mode || 'নগদ'
    });
    setModalState({ type: 'edit', coupon: c });
  };

  // Save Add / Edit
  const handleSave = (e) => {
    e.preventDefault();

    const amt = Number(form.amount) || 0;
    if (amt <= 0) {
      showToast('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন', 'error');
      return;
    }

    if (!form.source_location.trim()) {
      showToast('টাকা কোথা থেকে তোলা হলো তা লিখুন', 'error');
      return;
    }

    if (!form.purpose.trim()) {
      showToast('কী উদ্দেশ্যে তোলা হলো তা লিখুন', 'error');
      return;
    }

    if (modalState.type === 'add') {
      const newEntry = {
        id: 'cpn_' + Date.now(),
        date: form.date,
        amount: amt,
        source_location: form.source_location.trim(),
        purpose: form.purpose.trim(),
        payment_mode: form.payment_mode || 'নগদ'
      };

      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: [newEntry, ...(prev.bhogCoupons || [])]
      }));

      showToast(`কুপন আদায় সফল! ${formatTaka(amt)} যুক্ত হয়েছে`);
      setModalState(null);
    } else if (modalState.type === 'edit') {
      const updatedEntry = {
        ...modalState.coupon,
        date: form.date,
        amount: amt,
        source_location: form.source_location.trim(),
        purpose: form.purpose.trim(),
        payment_mode: form.payment_mode || 'নগদ'
      };

      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: (prev.bhogCoupons || []).map((c) =>
          c.id === modalState.coupon.id ? updatedEntry : c
        )
      }));

      showToast('কুপন এন্ট্রি সফলভাবে পরিবর্তন হয়েছে!');
      setModalState(null);
    }
  };

  // Delete
  const handleDelete = () => {
    if (!modalState?.coupon) return;
    const target = modalState.coupon;

    onUpdateDB((prev) => ({
      ...prev,
      bhogCoupons: (prev.bhogCoupons || []).filter((c) => c.id !== target.id)
    }));

    showToast('কুপন এন্ট্রি মুছে ফেলা হয়েছে!');
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] flex items-center gap-2">
            <Ticket className="text-[#800020]" />
            <span>কুপন কালেকশন খাতা</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            তারিখ, কোথা থেকে তোলা হলো, কী উদ্দেশ্যে তোলা হলো এবং টাকার হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCouponsToExcel(coupons)}
            className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel এক্সপোর্ট</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>+ নতুন কুপন জমা</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A0E17] to-[#7B1113] text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">মোট সংগৃহীত টাকা</span>
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{formatTaka(totalAmount)}</p>
          <p className="text-xs text-amber-200/80 mt-1">
            সর্বমোট কুপন তহবিল
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase">মোট কালেকশন এন্ট্রি</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Ticket size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stone-900">{toBnDigits(coupons.length)} <span className="text-sm font-semibold text-stone-500">বার</span></p>
          <p className="text-xs text-stone-500 mt-1">
            মোট জমার সংখ্যা
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase">আজকের কালেকশন</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{formatTaka(todayAmount)}</p>
          <p className="text-xs text-stone-500 mt-1">
            আজকে আদায় হওয়া টাকা
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
        <input
          type="text"
          placeholder="কোথা থেকে তোলা হলো, কী উদ্দেশ্যে বা তারিখ দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            {search 
              ? 'আপনার অনুসন্ধানে কোনো কুপন এন্ট্রি পাওয়া যায়নি।' 
              : 'এখনো কোনো কুপন আদায়ের হিসাব পাওয়া যায়নি। উপরে "+ নতুন কুপন জমা" বাটনে ক্লিক করে প্রথম এন্ট্রি দিন।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">ক্রমিক</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">কোথা থেকে তোলা হলো</th>
                  <th className="py-3 px-4">কী উদ্দেশ্যে তোলা হলো</th>
                  <th className="py-3 px-4">কত টাকা উঠল (₹)</th>
                  <th className="py-3 px-4">মাধ্যম</th>
                  <th className="py-3 px-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCoupons.map((c, index) => {
                  return (
                    <tr key={c.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4 font-mono text-stone-500">
                        {toBnDigits(index + 1)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800 whitespace-nowrap">
                        {formatBnDate(c.date || c.payment_date)}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#800020] shrink-0" />
                          <span>{c.source_location || c.donor_name || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <Target size={14} className="text-amber-700 shrink-0" />
                          <span>{c.purpose || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-800 text-base">
                        {formatTaka(c.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-xs border ${
                          c.payment_mode === 'UPI' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-stone-100 text-stone-800 border-stone-200'
                        }`}>
                          {c.payment_mode || 'নগদ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition shadow-xs"
                            title="এডিট করুন"
                          >
                            <Edit3 size={13} />
                            <span>এডিট</span>
                          </button>

                          <button
                            onClick={() => setModalState({ type: 'delete', coupon: c })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                            <span>ডিলিট</span>
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

      {/* Simple Add / Edit Modal (Only the 4 fields requested) */}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <Modal
          title={modalState.type === 'add' ? 'নতুন কুপন আদায় অন্তর্ভুক্তি' : 'কুপন হিসাব পরিবর্তন (এডিট)'}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            {/* 1. Date */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar size={14} className="text-[#800020]" />
                <span>তারিখ *</span>
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            {/* 2. Amount */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Wallet size={14} className="text-emerald-700" />
                <span>কত টাকা উঠল (₹) *</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="যেমন: 500, 1000, 2500"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-emerald-800 text-base focus:ring-2 focus:ring-[#800020]"
              />
              {/* Quick amount chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
                <span className="text-[11px] text-stone-500 font-semibold">শর্টকাট:</span>
                {[100, 200, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, amount: (Number(prev.amount) || 0) + amt }))}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition whitespace-nowrap"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Source Location */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-[#800020]" />
                <span>কোথা থেকে তোলা হলো *</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: মণ্ডপ প্রাঙ্গণ, হরিসভা মোড়, ভোগ কাউন্টার..."
                value={form.source_location}
                onChange={(e) => setForm(prev => ({ ...prev, source_location: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
              />
              {/* Quick location chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['মণ্ডপ প্রাঙ্গণ', 'হরিসভা মোড়', 'ভোগ কাউন্টার', 'বাজার প্রাঙ্গণ', 'পাড়ার মোড়'].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, source_location: loc }))}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-medium transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Purpose */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Target size={14} className="text-amber-700" />
                <span>কী উদ্দেশ্যে তোলা হলো *</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: ভোগ প্রসাদ বিতরণ, পূজা মণ্ডপ কুপন, বিশেষ চাঁদা..."
                value={form.purpose}
                onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
              />
              {/* Quick purpose chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['ভোগ প্রসাদ বিতরণ', 'পূজা মণ্ডপ কুপন', 'শ্যামা পূজা চাঁদা কুপন', 'বিশেষ প্রসাদ কুপন'].map(pur => (
                  <button
                    key={pur}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, purpose: pur }))}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition"
                  >
                    {pur}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">পেমেন্ট মাধ্যম</label>
              <select
                value={form.payment_mode}
                onChange={(e) => setForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
              >
                <option value="নগদ">নগদ (Cash)</option>
                <option value="UPI">UPI / অনলাইন</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Save size={15} />
                <span>{modalState.type === 'add' ? 'কুপন জমা সংরক্ষণ করুন' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modalState?.type === 'delete' && modalState.coupon && (
        <Modal
          title="কুপন এন্ট্রি মুছে ফেলার নিশ্চিতকরণ"
          onClose={() => setModalState(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold block">সতর্কতা:</span>
                এই কুপন এন্ট্রিটি ডিলিট করলে মোট তহবিল থেকে <strong>{formatTaka(modalState.coupon.amount)}</strong> টাকা বাদ যাবে।
              </div>
            </div>

            <div className="bg-[#F7EED3]/50 p-4 rounded-xl border border-[#EADBB6] space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">তারিখ:</span>
                <span className="font-semibold text-stone-800">{formatBnDate(modalState.coupon.date || modalState.coupon.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">কোথা থেকে তোলা হলো:</span>
                <span className="font-bold text-stone-900">{modalState.coupon.source_location || modalState.coupon.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">কী উদ্দেশ্যে:</span>
                <span className="font-medium text-stone-800">{modalState.coupon.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">টাকার পরিমাণ:</span>
                <span className="font-extrabold text-emerald-800">{formatTaka(modalState.coupon.amount)}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              আপনি কি নিশ্চিত যে এই কুপন হিসাবটি সম্পূর্ণ মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={15} />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
