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
  DollarSign,
  Coins
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';
import { exportCouponsToExcel, getWhatsAppCouponUrl } from '../services/exportService';
import { getNextCouponNo } from '../services/dataService';

export default function CouponsPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('সব'); // 'সব' | '₹10 কুপন' | '₹20 কুপন' | 'নগদ' | 'UPI'
  
  // Modal states: 'add' | 'edit' | 'delete'
  const [modalState, setModalState] = useState(null); // { type, coupon }

  const coupons = db.bhogCoupons || [];

  const [form, setForm] = useState({
    coupon_no: '',
    donor_name: '',
    phone: '',
    coupon_count: 1,
    rate: 10,
    amount: 10,
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

      let matchFilter = true;
      if (filterTab === '₹10 কুপন') {
        matchFilter = Number(c.rate) === 10;
      } else if (filterTab === '₹20 কুপন') {
        matchFilter = Number(c.rate) === 20;
      } else if (filterTab === 'নগদ') {
        matchFilter = c.payment_mode === 'নগদ';
      } else if (filterTab === 'UPI') {
        matchFilter = c.payment_mode === 'UPI';
      }

      return matchSearch && matchFilter;
    });
  }, [coupons, search, filterTab]);

  // Statistics
  const totalCollected = coupons.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalCount = coupons.reduce((sum, c) => sum + (Number(c.coupon_count) || 0), 0);

  // ₹10 & ₹20 breakdowns
  const coupons10 = coupons.filter(c => Number(c.rate) === 10);
  const count10 = coupons10.reduce((sum, c) => sum + (Number(c.coupon_count) || 0), 0);
  const amt10 = coupons10.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const coupons20 = coupons.filter(c => Number(c.rate) === 20);
  const count20 = coupons20.reduce((sum, c) => sum + (Number(c.coupon_count) || 0), 0);
  const amt20 = coupons20.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const cashTotal = coupons.filter(c => c.payment_mode !== 'UPI').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const upiTotal = coupons.filter(c => c.payment_mode === 'UPI').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextNo = getNextCouponNo(coupons);
    setForm({
      coupon_no: nextNo,
      donor_name: '',
      phone: '',
      coupon_count: 1,
      rate: 10,
      amount: 10,
      payment_mode: 'নগদ',
      payment_date: new Date().toISOString().split('T')[0],
      collected_by: 'কোষাধ্যক্ষ',
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    const rateVal = Number(coupon.rate) || 10;
    const countVal = Number(coupon.coupon_count) || 1;
    const amtVal = Number(coupon.amount) || (rateVal * countVal);

    setForm({
      coupon_no: coupon.coupon_no || '',
      donor_name: coupon.donor_name || '',
      phone: coupon.phone || '',
      coupon_count: countVal,
      rate: rateVal,
      amount: amtVal,
      payment_mode: coupon.payment_mode || 'নগদ',
      payment_date: coupon.payment_date || new Date().toISOString().split('T')[0],
      collected_by: coupon.collected_by || 'কোষাধ্যক্ষ',
      notes: coupon.notes || ''
    });
    setModalState({ type: 'edit', coupon });
  };

  // Helper to change rate & recalculate amount
  const handleSelectRate = (newRate) => {
    const count = Number(form.coupon_count) || 1;
    setForm(prev => ({
      ...prev,
      rate: newRate,
      amount: count * newRate
    }));
  };

  // Helper to change count & recalculate amount
  const handleCountChange = (newCount) => {
    const count = Math.max(1, parseInt(newCount, 10) || 1);
    const rate = Number(form.rate) || 10;
    setForm(prev => ({
      ...prev,
      coupon_count: count,
      amount: count * rate
    }));
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
        rate: Number(form.rate) || 10,
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
        rate: Number(form.rate) || 10,
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
            পূজা উপলক্ষে ১০ টাকা ও ২০ টাকার কুপন বিক্রি থেকে সংগৃহীত টাকার দৈনিক ও পূর্ণাঙ্গ হিসাব খাতা
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

      {/* KPI Stats Bar - 10 Tk & 20 Tk focused */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A0E17] to-[#7B1113] text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">মোট কুপন আদায়</span>
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{formatTaka(totalCollected)}</p>
          <p className="text-xs text-amber-200/80 mt-1">
            মোট বিক্রীত কুপন: <span className="font-bold text-white">{toBnDigits(totalCount)}</span> টি ({toBnDigits(coupons.length)} এন্ট্রি)
          </p>
        </div>

        {/* 10 Taka Coupons */}
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase">১০ টাকার কুপন আদায়</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
              ₹১০
            </span>
          </div>
          <p className="text-2xl font-extrabold text-amber-900">{formatTaka(amt10)}</p>
          <p className="text-xs text-stone-500 mt-1">
            বিক্রি হয়েছে: <span className="font-bold text-amber-900">{toBnDigits(count10)}</span> টি কুপন
          </p>
        </div>

        {/* 20 Taka Coupons */}
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-emerald-300 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 uppercase">২০ টাকার কুপন আদায়</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ₹২০
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-900">{formatTaka(amt20)}</p>
          <p className="text-xs text-stone-500 mt-1">
            বিক্রি হয়েছে: <span className="font-bold text-emerald-900">{toBnDigits(count20)}</span> টি কুপন
          </p>
        </div>

        {/* Mode Split */}
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase">নগদ / UPI মাধ্যম</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Coins size={18} />
            </div>
          </div>
          <div className="space-y-1 mt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">নগদ আদায়:</span>
              <span className="font-extrabold text-stone-900">{formatTaka(cashTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">অনলাইন / UPI:</span>
              <span className="font-extrabold text-[#800020]">{formatTaka(upiTotal)}</span>
            </div>
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

        <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0 overflow-x-auto">
          {['সব', '₹10 কুপন', '₹20 কুপন', 'নগদ', 'UPI'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterTab === tab ? 'bg-[#4A0E17] text-amber-300 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            {search || filterTab !== 'সব' 
              ? 'আপনার ফিল্টারে কোনো কুপন এন্ট্রি পাওয়া যায়নি।' 
              : 'এখনো কোনো কুপন আদায়ের হিসাব পাওয়া যায়নি। উপরে "+ নতুন কুপন আদায়" বাটনে ক্লিক করে প্রথম এন্ট্রি দিন।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">কুপন / বই নং</th>
                  <th className="py-3 px-4">ক্রেতা / দাতার নাম</th>
                  <th className="py-3 px-4">কুপনের ধরন</th>
                  <th className="py-3 px-4">সংখ্যা</th>
                  <th className="py-3 px-4">মোট আদায় (₹)</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">মাধ্যম</th>
                  <th className="py-3 px-4">আদায়কারী</th>
                  <th className="py-3 px-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCoupons.map((c) => {
                  const rateVal = Number(c.rate) || 10;
                  const is10 = rateVal === 10;
                  const is20 = rateVal === 20;
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
                      <td className="py-3 px-4">
                        {is10 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300">
                            🎟️ ₹10 কুপন
                          </span>
                        )}
                        {is20 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-300">
                            🎟️ ₹20 কুপন
                          </span>
                        )}
                        {!is10 && !is20 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                            ₹{toBnDigits(rateVal)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {toBnDigits(c.coupon_count || 1)} <span className="text-xs font-normal text-stone-500">টি</span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                        {formatTaka(c.amount)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {formatBnDate(c.payment_date)}
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
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {c.collected_by || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.phone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-xs"
                              title="WhatsApp-এ কুপন প্রাপ্তি স্বীকার পাঠান"
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
            {/* Coupon Denomination (10 Tk vs 20 Tk) Selection */}
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                কুপনের মূল্য নির্বাচন করুন *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectRate(10)}
                  className={`p-3 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${
                    Number(form.rate) === 10
                      ? 'border-[#800020] bg-[#4A0E17] text-amber-300 shadow-md ring-2 ring-amber-300/40'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <Ticket size={18} />
                  <div className="text-left">
                    <div className="text-sm font-extrabold">₹১০ কুপন</div>
                    <div className="text-[10px] opacity-80">দশ টাকার কুপন</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRate(20)}
                  className={`p-3 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${
                    Number(form.rate) === 20
                      ? 'border-[#800020] bg-[#4A0E17] text-amber-300 shadow-md ring-2 ring-emerald-300/40'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <Ticket size={18} />
                  <div className="text-left">
                    <div className="text-sm font-extrabold">₹২০ কুপন</div>
                    <div className="text-[10px] opacity-80">কুড়ি টাকার কুপন</div>
                  </div>
                </button>
              </div>
            </div>

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
                  placeholder="যেমন: শ্রী অনিল দাস / ভক্ত"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            {/* Quick Count Selector */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">কুপন সংখ্যা (ক'টি কুপন দেওয়া হয়েছে) *</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={form.coupon_count}
                  onChange={(e) => handleCountChange(e.target.value)}
                  className="w-32 px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-bold text-base focus:ring-2 focus:ring-[#800020]"
                />
                <span className="text-xs text-stone-500 font-semibold">টি</span>

                <div className="flex items-center gap-1.5 overflow-x-auto ml-2">
                  {[1, 2, 5, 10, 20, 50].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => handleCountChange(qty)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        Number(form.coupon_count) === qty
                          ? 'bg-[#4A0E17] text-white border-[#4A0E17]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {qty}টি
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">প্রতিটির দর (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.rate}
                  onChange={(e) => {
                    const r = Number(e.target.value) || 0;
                    handleSelectRate(r);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">মোট আদায় (₹) [স্বয়ংক্রিয়]</label>
                <div className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-extrabold text-base flex items-center justify-between">
                  <span>{formatTaka(form.amount)}</span>
                  <span className="text-xs font-normal text-emerald-600">
                    ({form.coupon_count} টি × ₹{form.rate})
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="যেমন: 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={form.payment_mode}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="নগদ">নগদ (Cash)</option>
                  <option value="UPI">UPI / অনলাইন</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">জমার তারিখ</label>
                <input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => setForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">আদায়কারী সদস্য</label>
                <input
                  type="text"
                  value={form.collected_by}
                  onChange={(e) => setForm(prev => ({ ...prev, collected_by: e.target.value }))}
                  placeholder="যেমন: কোষাধ্যক্ষ / শ্যামল দাস"
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
                <span className="text-stone-500">কুপন দর ও সংখ্যা:</span>
                <span className="font-semibold text-stone-800">₹{modalState.coupon.rate || 10} × {modalState.coupon.coupon_count} টি</span>
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
