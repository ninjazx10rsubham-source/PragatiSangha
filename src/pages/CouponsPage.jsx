import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Share2, 
  Download, 
  Wallet, 
  Calendar, 
  Phone,
  User,
  Tag,
  AlertTriangle,
  Save,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { exportCouponsToExcel, getWhatsAppCouponUrl } from '../services/exportService';
import { getNextCouponNo } from '../services/dataService';

export default function CouponsPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('সব');
  
  // Modal states: 'add' | 'edit' | 'delete'
  const [modalState, setModalState] = useState(null); // { type, coupon }

  const coupons = db.bhogCoupons || [];

  const [form, setForm] = useState({
    coupon_no: '',
    donor_name: '',
    phone: '',
    coupon_count: 1,
    rate: 50,
    amount: 50,
    payment_mode: 'নগদ',
    payment_date: new Date().toISOString().split('T')[0],
    collected_by: 'কোষাধ্যক্ষ',
    notes: ''
  });

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch =
        !search ||
        (c.coupon_no && c.coupon_no.toLowerCase().includes(search.toLowerCase())) ||
        (c.donor_name && c.donor_name.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.collected_by && c.collected_by.toLowerCase().includes(search.toLowerCase()));

      const matchMode = modeFilter === 'সব' || c.payment_mode === modeFilter;
      return matchSearch && matchMode;
    });
  }, [coupons, search, modeFilter]);

  // Statistics
  const totalCollected = coupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalCount = coupons.reduce((sum, c) => sum + (Number(c.coupon_count) || 0), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextNo = getNextCouponNo(coupons);
    setForm({
      coupon_no: nextNo,
      donor_name: '',
      phone: '',
      coupon_count: 1,
      rate: 50,
      amount: 50,
      payment_mode: 'নগদ',
      payment_date: new Date().toISOString().split('T')[0],
      collected_by: 'কোষাধ্যক্ষ',
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setForm({
      coupon_no: coupon.coupon_no || '',
      donor_name: coupon.donor_name || '',
      phone: coupon.phone || '',
      coupon_count: coupon.coupon_count || 1,
      rate: coupon.rate || 50,
      amount: coupon.amount || 50,
      payment_mode: coupon.payment_mode || 'নগদ',
      payment_date: coupon.payment_date || new Date().toISOString().split('T')[0],
      collected_by: coupon.collected_by || 'কোষাধ্যক্ষ',
      notes: coupon.notes || ''
    });
    setModalState({ type: 'edit', coupon });
  };

  // Save Add / Edit
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.donor_name.trim()) {
      showToast('অনুগ্রহ করে ক্রেতা বা দাতার নাম লিখুন', 'error');
      return;
    }

    const amt = Number(form.amount) || 0;
    if (amt <= 0) {
      showToast('সঠিক টাকার পরিমাণ দিন', 'error');
      return;
    }

    if (modalState.type === 'add') {
      const newCoupon = {
        id: 'cpn_' + Date.now(),
        coupon_no: form.coupon_no.trim() || getNextCouponNo(coupons),
        donor_name: form.donor_name.trim(),
        phone: form.phone.trim(),
        coupon_count: Number(form.coupon_count) || 1,
        rate: Number(form.rate) || 50,
        amount: amt,
        payment_mode: form.payment_mode,
        payment_date: form.payment_date,
        collected_by: form.collected_by.trim() || 'কোষাধ্যক্ষ',
        notes: form.notes.trim()
      };

      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: [newCoupon, ...(prev.bhogCoupons || [])]
      }));

      showToast(`কুপন আদায় সফল! রসিদ নং: ${newCoupon.coupon_no}`);
      setModalState(null);
    } else if (modalState.type === 'edit') {
      const updatedCoupon = {
        ...modalState.coupon,
        coupon_no: form.coupon_no.trim(),
        donor_name: form.donor_name.trim(),
        phone: form.phone.trim(),
        coupon_count: Number(form.coupon_count) || 1,
        rate: Number(form.rate) || 50,
        amount: amt,
        payment_mode: form.payment_mode,
        payment_date: form.payment_date,
        collected_by: form.collected_by.trim() || 'কোষাধ্যক্ষ',
        notes: form.notes.trim()
      };

      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: (prev.bhogCoupons || []).map((c) =>
          c.id === modalState.coupon.id ? updatedCoupon : c
        )
      }));

      showToast(`কুপন নং ${updatedCoupon.coupon_no} সফলভাবে আপডেট হয়েছে!`);
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

    showToast(`কুপন নং ${target.coupon_no} মুছে ফেলা হয়েছে!`);
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] flex items-center gap-2">
            <Ticket className="text-[#800020]" />
            <span>কুপন থেকে তোলা টাকা ও হিসাব</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            পূজা উপলক্ষে কুপন বিক্রি থেকে মোট সংগৃহীত টাকার দৈনিক ও পূর্ণাঙ্গ হিসাব খাতা
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
            <span>+ নতুন কুপন আদায়</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
            <Wallet size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase block">কুপন থেকে মোট আদায়</span>
            <p className="text-2xl font-extrabold text-[#4A0E17]">{formatTaka(totalCollected)}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800">
            <Ticket size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase block">মোট বিক্রীত কুপন সংখ্যা</span>
            <p className="text-2xl font-extrabold text-stone-900">{toBnDigits(totalCount)} <span className="text-sm font-semibold text-stone-500">টি</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-100 text-[#800020]">
            <Tag size={24} />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-bold uppercase block">মোট কালেকশন এন্ট্রি</span>
            <p className="text-2xl font-extrabold text-[#800020]">{toBnDigits(coupons.length)} <span className="text-sm font-semibold text-stone-500">টি রেকর্ড</span></p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="কুপন নম্বর, দাতার নাম, ফোন বা সংগ্রাহকের নাম দিয়ে খুঁজুন..."
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

      {/* Coupons Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            এখনো কোনো কুপন আদায়ের হিসাব পাওয়া যায়নি। উপরে "+ নতুন কুপন আদায়" বাটনে ক্লিক করে প্রথম এন্ট্রি দিন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">কুপন / বই নং</th>
                  <th className="py-3 px-4">ক্রেতা / দাতার নাম</th>
                  <th className="py-3 px-4">কুপন সংখ্যা</th>
                  <th className="py-3 px-4">দর (₹)</th>
                  <th className="py-3 px-4">মোট আদায় (₹)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">মাধ্যম</th>
                  <th className="py-3 px-4">আদায়কারী</th>
                  <th className="py-3 px-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCoupons.map((c) => {
                  const waUrl = getWhatsAppCouponUrl(c.phone, c, db.settings?.club_name || 'প্রগতি সংঘ');

                  return (
                    <tr key={c.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#800020]">
                        {c.coupon_no || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {c.donor_name}
                        {c.notes && (
                          <span className="block text-[11px] text-stone-400 font-normal">
                            {c.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {toBnDigits(c.coupon_count || 1)} টি
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        ₹{toBnDigits(c.rate || 50)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                        {formatTaka(c.amount)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {formatBnDate(c.payment_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200">
                          {c.payment_mode || 'নগদ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {c.collected_by || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition border border-emerald-200"
                              title="WhatsApp-এ স্বীকৃতি পাঠান"
                            >
                              <Share2 size={13} />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition shadow-xs"
                            title="কুপন তথ্য এডিট করুন"
                          >
                            <Edit3 size={13} />
                            <span className="hidden sm:inline">এডিট</span>
                          </button>

                          <button
                            onClick={() => setModalState({ type: 'delete', coupon: c })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-xs"
                            title="কুপন এন্ট্রি ডিলিট করুন"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">ডিলিট</span>
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

      {/* Add / Edit Modal */}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <Modal
          title={modalState.type === 'add' ? 'নতুন কুপন আদায় অন্তর্ভুক্তি' : `কুপন এডিট (${modalState.coupon?.coupon_no})`}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">কুপন / বই নম্বর *</label>
                <input
                  type="text"
                  required
                  value={form.coupon_no}
                  onChange={(e) => setForm(prev => ({ ...prev, coupon_no: e.target.value }))}
                  placeholder="যেমন: CPN-001 বা বই নং ২"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-[#800020] focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ক্রেতা / দাতার নাম *</label>
                <input
                  type="text"
                  required
                  value={form.donor_name}
                  onChange={(e) => setForm(prev => ({ ...prev, donor_name: e.target.value }))}
                  placeholder="যেমন: শ্রী অনিল দাস / সাধারণ ভক্ত"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">কুপন সংখ্যা *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.coupon_count}
                  onChange={(e) => {
                    const count = Math.max(1, parseInt(e.target.value, 10) || 1);
                    const newAmt = count * (Number(form.rate) || 50);
                    setForm(prev => ({ ...prev, coupon_count: count, amount: newAmt }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">প্রতিটির দর (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.rate}
                  onChange={(e) => {
                    const rate = Number(e.target.value) || 0;
                    const newAmt = (Number(form.coupon_count) || 1) * rate;
                    setForm(prev => ({ ...prev, rate, amount: newAmt }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">মোট আদায় (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 font-extrabold text-emerald-800 text-base focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">পেমেন্টের তারিখ *</label>
                <input
                  type="date"
                  required
                  value={form.payment_date}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={form.payment_mode}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="নগদ">নগদ</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="যেমন: 9830012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">আদায়কারী / সংগ্রাহক</label>
                <input
                  type="text"
                  value={form.collected_by}
                  onChange={(e) => setForm(prev => ({ ...prev, collected_by: e.target.value }))}
                  placeholder="যেমন: কোষাধ্যক্ষ / সদস্যের নাম"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="কোনো অতিরিক্ত বিবরণ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>
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
                এই কুপন এন্ট্রিটি ডিলিট করলে কুপন খাতা ও মোট তহবিল থেকে <strong>{formatTaka(modalState.coupon.amount)}</strong> টাকা স্বয়ংক্রিয়ভাবে বাদ যাবে।
              </div>
            </div>

            <div className="bg-[#F7EED3]/50 p-4 rounded-xl border border-[#EADBB6] space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">কুপন নম্বর:</span>
                <span className="font-mono font-bold text-[#800020]">{modalState.coupon.coupon_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ক্রেতা / দাতার নাম:</span>
                <span className="font-bold text-stone-900">{modalState.coupon.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">কুপন সংখ্যা:</span>
                <span className="font-semibold text-stone-800">{modalState.coupon.coupon_count} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">মোট আদায়:</span>
                <span className="font-extrabold text-emerald-700">{formatTaka(modalState.coupon.amount)}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              আপনি কি নিশ্চিত যে আপনি এই কুপন এন্ট্রিটি সম্পূর্ণ মুছে ফেলতে চান?
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
