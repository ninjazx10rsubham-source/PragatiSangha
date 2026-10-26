import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Phone, 
  User, 
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits } from '../utils/formatters';
import { exportSponsorsToExcel } from '../services/exportService';

export default function SponsorsPage({ db, onUpdateDB, showToast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('সব');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'pay' | 'delete', sponsor }

  const sponsors = db.sponsors || [];

  const [form, setForm] = useState({
    sponsor_name: '',
    contact_person: '',
    phone: '',
    banner_type: 'গেট ব্যানার',
    promised_amount: '',
    notes: ''
  });

  const [payAmount, setPayAmount] = useState('');

  const filteredSponsors = useMemo(() => {
    return sponsors.filter((s) => {
      const matchSearch =
        !search ||
        s.sponsor_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase())) ||
        (s.phone && s.phone.includes(search));

      const matchStatus = statusFilter === 'সব' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sponsors, search, statusFilter]);

  const totalPromised = sponsors.reduce((sum, s) => sum + (Number(s.promised_amount) || 0), 0);
  const totalPaid = sponsors.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
  const totalDue = Math.max(0, totalPromised - totalPaid);

  const deriveStatus = (promised, paid) => {
    if (paid <= 0) return 'বাকি';
    if (paid >= promised) return 'পরিশোধিত';
    return 'আংশিক জমা';
  };

  const handleOpenAdd = () => {
    setForm({
      sponsor_name: '',
      contact_person: '',
      phone: '',
      banner_type: 'গেট ব্যানার',
      promised_amount: '',
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  const handleOpenEdit = (sp) => {
    setForm({
      sponsor_name: sp.sponsor_name,
      contact_person: sp.contact_person || '',
      phone: sp.phone || '',
      banner_type: sp.banner_type || 'গেট ব্যানার',
      promised_amount: sp.promised_amount,
      notes: sp.notes || ''
    });
    setModalState({ type: 'edit', sponsor: sp });
  };

  const handleOpenPay = (sp) => {
    const due = Math.max(0, (sp.promised_amount || 0) - (sp.paid_amount || 0));
    setPayAmount(due > 0 ? due : '');
    setModalState({ type: 'pay', sponsor: sp });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.sponsor_name.trim() || !form.promised_amount) {
      showToast('বিজ্ঞাপনদাতার নাম ও প্রতিশ্রুত অর্থ আবশ্যক', 'error');
      return;
    }

    const promised = Number(form.promised_amount) || 0;

    if (modalState.type === 'add') {
      const newSp = {
        id: 'sp_' + Date.now(),
        sponsor_name: form.sponsor_name.trim(),
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        banner_type: form.banner_type,
        promised_amount: promised,
        paid_amount: 0,
        status: 'বাকি',
        notes: form.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        sponsors: [...(prev.sponsors || []), newSp]
      }));
      showToast('বিজ্ঞাপনদাতা তালিকাভুক্ত হয়েছেন');
    } else if (modalState.type === 'edit') {
      onUpdateDB((prev) => ({
        ...prev,
        sponsors: (prev.sponsors || []).map((s) =>
          s.id === modalState.sponsor.id
            ? {
                ...s,
                sponsor_name: form.sponsor_name.trim(),
                contact_person: form.contact_person.trim(),
                phone: form.phone.trim(),
                banner_type: form.banner_type,
                promised_amount: promised,
                status: deriveStatus(promised, s.paid_amount),
                notes: form.notes.trim()
              }
            : s
        )
      }));
      showToast('বিজ্ঞাপন তথ্য হালনাগাদ হয়েছে');
    }
    setModalState(null);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      showToast('বৈধ টাকার পরিমাণ লিখুন', 'error');
      return;
    }

    const sp = modalState.sponsor;
    const currentPaid = Number(sp.paid_amount) || 0;
    const newPaid = currentPaid + amount;
    const promised = Number(sp.promised_amount) || 0;

    onUpdateDB((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).map((s) =>
        s.id === sp.id
          ? { ...s, paid_amount: newPaid, status: deriveStatus(promised, newPaid) }
          : s
      )
    }));

    showToast(`বিজ্ঞাপন বাবদ ${formatTaka(amount)} জমা হয়েছে!`);
    setModalState(null);
  };

  const handleDelete = () => {
    onUpdateDB((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).filter((s) => s.id !== modalState.sponsor.id)
    }));
    showToast('বিজ্ঞাপনদাতা মুছে ফেলা হয়েছে');
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            ব্যানার, তোরণ ও বিজ্ঞাপন স্পনসরশিপ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            গেটের তোরণ, স্মরণিকা ও ব্যানার স্পনসরদের অনুদান ট্র্যাকিং
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSponsorsToExcel(sponsors)}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel স্পনসর</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>নতুন স্পনসর যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#EADBB6]">
          <span className="text-xs font-bold text-stone-500 uppercase">মোট প্রতিশ্রুত স্পনসরশিপ</span>
          <p className="text-2xl font-extrabold text-[#4A0E17] mt-1">{formatTaka(totalPromised)}</p>
          <span className="text-xs text-stone-500">মোট দাতা প্রতিষ্ঠান: {toBnDigits(sponsors.length)} টি</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <span className="text-xs font-bold text-purple-800 uppercase">মোট সংগৃহীত বিজ্ঞাপন অর্থ</span>
          <p className="text-2xl font-extrabold text-purple-900 mt-1">{formatTaka(totalPaid)}</p>
          <span className="text-xs text-purple-700">
            আদায় হয়েছে: {toBnDigits(totalPromised > 0 ? Math.round((totalPaid / totalPromised) * 100) : 0)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
          <span className="text-xs font-bold text-rose-800 uppercase">বাকি অনুদান</span>
          <p className="text-2xl font-extrabold text-rose-800 mt-1">{formatTaka(totalDue)}</p>
          <span className="text-xs text-rose-600">সংগ্রহের অপেক্ষায়</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="প্রতিষ্ঠান বা যোগাযোগ ব্যক্তির নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0">
          {['সব', 'পরিশোধিত', 'আংশিক জমা', 'বাকি'].map((st) => (
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

      {/* Sponsors Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredSponsors.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো বিজ্ঞাপনদাতা বা স্পনসর পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">প্রতিষ্ঠান / দাতা</th>
                  <th className="py-3 px-4">বিজ্ঞাপনের ধরন</th>
                  <th className="py-3 px-4">প্রতিশ্রুত (₹)</th>
                  <th className="py-3 px-4">জমা (₹)</th>
                  <th className="py-3 px-4">বাকি (₹)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSponsors.map((s) => {
                  const promised = Number(s.promised_amount) || 0;
                  const paid = Number(s.paid_amount) || 0;
                  const due = Math.max(0, promised - paid);

                  return (
                    <tr key={s.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm sm:text-base">{s.sponsor_name}</div>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                          {s.contact_person && (
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              <span>{s.contact_person}</span>
                            </span>
                          )}
                          {s.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={12} />
                              <span>{s.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200">
                          {s.banner_type || 'গেট ব্যানার'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800">{formatTaka(promised)}</td>
                      <td className="py-3 px-4 font-bold text-purple-900">{formatTaka(paid)}</td>
                      <td className="py-3 px-4 font-bold text-rose-700">{formatTaka(due)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'পরিশোধিত' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : s.status === 'আংশিক জমা' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.status === 'পরিশোধিত' && <CheckCircle2 size={12} />}
                          {s.status === 'আংশিক জমা' && <Clock size={12} />}
                          {s.status === 'বাকি' && <AlertCircle size={12} />}
                          <span>{s.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPay(s)}
                            className="px-2.5 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                            title="টাকা জমা নিন"
                          >
                            <DollarSign size={14} />
                            <span>জমা নিন</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="সম্পাদনা"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => setModalState({ type: 'delete', sponsor: s })}
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
          title={modalState.type === 'add' ? 'নতুন বিজ্ঞাপন স্পনসর যোগ করুন' : 'স্পনসর তথ্য সম্পাদনা'}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">বিজ্ঞাপনদাতা / প্রতিষ্ঠানের নাম *</label>
              <input
                type="text"
                required
                value={form.sponsor_name}
                onChange={(e) => setForm({ ...form, sponsor_name: e.target.value })}
                placeholder="যেমন: দাস ব্রাদার্স জুয়েলার্স"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">যোগাযোগ ব্যক্তি</label>
                <input
                  type="text"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="যেমন: শ্যামল দাস"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="যেমন: 9830001122"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বিজ্ঞাপনের ধরন</label>
                <select
                  value={form.banner_type}
                  onChange={(e) => setForm({ ...form, banner_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none bg-white font-medium"
                >
                  <option value="গেট ব্যানার">গেট ব্যানার (Main Gate)</option>
                  <option value="প্যান্ডেল তোরণ">প্যান্ডেল তোরণ</option>
                  <option value="স্টেজ ব্যানার">স্টেজ ব্যানার</option>
                  <option value="স্মরণিকা বিজ্ঞাপন">স্মরণিকা বিজ্ঞাপন (Souvenir)</option>
                  <option value="অন্যান্য স্পনসর">অন্যান্য স্পনসর</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">প্রতিশ্রুত অর্থ (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.promised_amount}
                  onChange={(e) => setForm({ ...form, promised_amount: e.target.value })}
                  placeholder="যেমন: 15000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-purple-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="যেমন: তোরণ সাইজ ২০x১০ ফুট"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
              />
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

      {/* Pay Modal */}
      {modalState?.type === 'pay' && (
        <Modal
          title={`স্পনসর অর্থ গ্রহণ: ${modalState.sponsor.sponsor_name}`}
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSavePayment} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between">
              <div>
                <span className="text-stone-500 block">প্রতিশ্রুত অর্থ</span>
                <span className="font-bold text-stone-800">{formatTaka(modalState.sponsor.promised_amount)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">পূর্বে জমা</span>
                <span className="font-bold text-purple-800">{formatTaka(modalState.sponsor.paid_amount)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">বাকি</span>
                <span className="font-bold text-rose-700">
                  {formatTaka(Math.max(0, modalState.sponsor.promised_amount - modalState.sponsor.paid_amount))}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">এখন জমা দেওয়ার পরিমাণ (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-800 text-lg font-bold text-purple-900 focus:outline-none"
              />
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
                className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-xl shadow-md"
              >
                জমা নিশ্চিত করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {modalState?.type === 'delete' && (
        <Modal title="বিজ্ঞাপন স্পনসর মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.sponsor.sponsor_name}</span>-এর রেকর্ড মুছে ফেলতে চান?
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
