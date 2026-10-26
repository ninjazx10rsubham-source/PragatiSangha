import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Download, 
  Home, 
  Phone, 
  User, 
  RefreshCw,
  Trash2,
  Edit3
} from 'lucide-react';
import Modal from '../components/Modal';
import { toBnDigits } from '../utils/formatters';
import { exportBhogToExcel } from '../services/exportService';

export default function BhogPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('সবাই');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'delete', coupon }

  const coupons = db.bhogCoupons || [];

  const [form, setForm] = useState({
    house_no: '',
    family_head: '',
    phone: '',
    coupon_count: 3,
    notes: ''
  });

  const filteredCoupons = useMemo(() => {
    return coupons.filter((b) => {
      const matchSearch =
        !search ||
        b.family_head.toLowerCase().includes(search.toLowerCase()) ||
        b.house_no.toLowerCase().includes(search.toLowerCase()) ||
        (b.phone && b.phone.includes(search));

      const matchStatus = statusFilter === 'সবাই' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [coupons, search, statusFilter]);

  const totalCoupons = coupons.reduce((sum, b) => sum + (Number(b.coupon_count) || 0), 0);
  const deliveredCoupons = coupons
    .filter(b => b.status === 'দেওয়া হয়েছে')
    .reduce((sum, b) => sum + (Number(b.coupon_count) || 0), 0);
  const pendingCoupons = totalCoupons - deliveredCoupons;

  // Toggle delivery status
  const handleToggleDelivery = (coupon) => {
    const isCurrentlyDelivered = coupon.status === 'দেওয়া হয়েছে';
    const newStatus = isCurrentlyDelivered ? 'বাকি' : 'দেওয়া হয়েছে';
    const newTime = isCurrentlyDelivered ? null : new Date().toISOString();

    onUpdateDB((prev) => ({
      ...prev,
      bhogCoupons: (prev.bhogCoupons || []).map((b) =>
        b.id === coupon.id
          ? { ...b, status: newStatus, delivered_time: newTime }
          : b
      )
    }));

    showToast(
      isCurrentlyDelivered
        ? 'ভোগ স্ট্যাটাস "বাকি"-তে পরিবর্তন করা হয়েছে'
        : `বাড়ি ${coupon.house_no}: ভোগ বিতরণ সম্পন্ন হিসেবে চিহ্নিত!`
    );
  };

  const handleOpenAdd = () => {
    setForm({
      house_no: '',
      family_head: '',
      phone: '',
      coupon_count: 3,
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  const handleOpenEdit = (coupon) => {
    setForm({
      house_no: coupon.house_no,
      family_head: coupon.family_head,
      phone: coupon.phone || '',
      coupon_count: coupon.coupon_count,
      notes: coupon.notes || ''
    });
    setModalState({ type: 'edit', coupon });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.house_no.trim() || !form.family_head.trim()) {
      showToast('বাড়ি নং ও পরিবারের প্রধানের নাম আবশ্যক', 'error');
      return;
    }

    if (modalState.type === 'add') {
      const newCoupon = {
        id: 'bhog_' + Date.now(),
        house_no: form.house_no.trim(),
        family_head: form.family_head.trim(),
        phone: form.phone.trim(),
        coupon_count: Number(form.coupon_count) || 1,
        status: 'বাকি',
        delivered_time: null,
        notes: form.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: [...(prev.bhogCoupons || []), newCoupon]
      }));
      showToast('ভোগ কুপন তালিকাভুক্ত হয়েছে');
    } else if (modalState.type === 'edit') {
      onUpdateDB((prev) => ({
        ...prev,
        bhogCoupons: (prev.bhogCoupons || []).map((b) =>
          b.id === modalState.coupon.id
            ? {
                ...b,
                house_no: form.house_no.trim(),
                family_head: form.family_head.trim(),
                phone: form.phone.trim(),
                coupon_count: Number(form.coupon_count) || 1,
                notes: form.notes.trim()
              }
            : b
        )
      }));
      showToast('ভোগ কুপন তথ্য হালনাগাদ হয়েছে');
    }
    setModalState(null);
  };

  const handleDelete = () => {
    onUpdateDB((prev) => ({
      ...prev,
      bhogCoupons: (prev.bhogCoupons || []).filter((b) => b.id !== modalState.coupon.id)
    }));
    showToast('ভোগ কুপন মুছে ফেলা হয়েছে');
    setModalState(null);
  };

  // Auto-import from members list
  const handleAutoImportFromMembers = () => {
    const existingHouseNos = new Set(coupons.map(b => b.house_no.trim().toLowerCase()));
    const newCoupons = [];

    (db.members || []).forEach((m) => {
      if (m.address && !existingHouseNos.has(m.address.trim().toLowerCase())) {
        existingHouseNos.add(m.address.trim().toLowerCase());
        newCoupons.push({
          id: 'bhog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          house_no: m.address.trim(),
          family_head: m.name.trim(),
          phone: m.phone || '',
          coupon_count: 3,
          status: 'বাকি',
          delivered_time: null,
          notes: 'সদস্য তালিকা থেকে সংগৃহীত'
        });
      }
    });

    if (newCoupons.length === 0) {
      showToast('নতুন কোনো বাড়ি পাওয়া যায়নি (ইতিমধ্যে যুক্ত আছে)', 'error');
      return;
    }

    onUpdateDB((prev) => ({
      ...prev,
      bhogCoupons: [...(prev.bhogCoupons || []), ...newCoupons]
    }));
    showToast(`${toBnDigits(newCoupons.length)} টি বাড়ির ভোগ কুপন স্বয়ংক্রিয়ভাবে তৈরি হয়েছে!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            ভোগ ও প্রসাদ বিতরণ ট্র্যাকার
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            পাড়ার প্রতিটি বাড়ির জন্য ভোগের কুপন বণ্টন ও বিতরণ নিশ্চয়ন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoImportFromMembers}
            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#4A0E17] text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-amber-300"
            title="সদস্য তালিকা থেকে বাড়িগুলো স্বয়ংক্রিয়ভাবে আনুন"
          >
            <RefreshCw size={14} />
            <span>সদস্য থেকে অটো-ইম্পোর্ট</span>
          </button>
          <button
            onClick={() => exportBhogToExcel(coupons)}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel ডাউনলোড</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>কুপন যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6]">
          <span className="text-xs font-bold text-stone-500 uppercase">মোট নির্ধারিত ভোগ কুপন</span>
          <p className="text-2xl font-extrabold text-[#4A0E17] mt-1">{toBnDigits(totalCoupons)} টি</p>
          <span className="text-xs text-stone-500">মোট পরিবার: {toBnDigits(coupons.length)} টি</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase">বিতরণ সম্পন্ন</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{toBnDigits(deliveredCoupons)} টি</p>
          <span className="text-xs text-emerald-700">
            অগ্রগতি: {toBnDigits(totalCoupons > 0 ? Math.round((deliveredCoupons / totalCoupons) * 100) : 0)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-xs font-bold text-amber-800 uppercase">বিতরণ বাকি</span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{toBnDigits(pendingCoupons)} টি</p>
          <span className="text-xs text-amber-700">প্রতীক্ষারত পরিবারবর্গ</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="বাড়ি নম্বর বা পরিবারের প্রধানের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0">
          {['সবাই', 'বাকি', 'দেওয়া হয়েছে'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st ? 'bg-[#4A0E17] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো ভোগ কুপন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">বাড়ি নং</th>
                  <th className="py-3 px-4">পরিবারের প্রধান</th>
                  <th className="py-3 px-4">মোবাইল</th>
                  <th className="py-3 px-4">ভোগ সংখ্যা</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">বিতরণ চেক ও অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCoupons.map((b) => {
                  const isDelivered = b.status === 'দেওয়া হয়েছে';
                  return (
                    <tr key={b.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4 font-bold text-[#800020] text-sm">
                        <span className="flex items-center gap-1">
                          <Home size={14} className="text-stone-400" />
                          <span>{b.house_no}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {b.family_head}
                        {b.notes && (
                          <p className="text-xs text-stone-500 font-normal italic mt-0.5">{b.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {b.phone ? (
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Phone size={12} className="text-stone-400" />
                            <span>{b.phone}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                          {toBnDigits(b.coupon_count)} টি
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isDelivered ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          <span>{b.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleDelivery(b)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1 ${
                              isDelivered
                                ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                            <span>{isDelivered ? 'আনচেক' : 'ভোগ দেওয়া হয়েছে'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="সম্পাদনা"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => setModalState({ type: 'delete', coupon: b })}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
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
          title={modalState.type === 'add' ? 'নতুন ভোগ কুপন এন্ট্রি' : 'ভোগ কুপন সম্পাদনা'}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বাড়ি নং / ফ্ল্যাট *</label>
                <input
                  type="text"
                  required
                  value={form.house_no}
                  onChange={(e) => setForm({ ...form, house_no: e.target.value })}
                  placeholder="যেমন: ১২/এ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ভোগের সংখ্যা (কুপন) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={form.coupon_count}
                  onChange={(e) => setForm({ ...form, coupon_count: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-amber-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">পরিবারের প্রধানের নাম *</label>
              <input
                type="text"
                required
                value={form.family_head}
                onChange={(e) => setForm({ ...form, family_head: e.target.value })}
                placeholder="যেমন: শ্রী নিমাই চন্দ্র দাস"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="যেমন: 9830012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="যেমন: স্পেশাল পার্সেল"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white rounded-xl font-bold shadow-md"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {modalState?.type === 'delete' && (
        <Modal title="ভোগ কুপন মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে বাড়ি <span className="font-bold text-[#800020]">{modalState.coupon.house_no}</span> ({modalState.coupon.family_head})-এর ভোগ কুপন মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
