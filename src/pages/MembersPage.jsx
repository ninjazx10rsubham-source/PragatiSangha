import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Receipt, 
  Phone, 
  Home, 
  Share2, 
  Download, 
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits } from '../utils/formatters';
import { exportMembersToExcel, getWhatsAppDueReminderUrl } from '../services/exportService';

export default function MembersPage({ db, onUpdateDB, showToast, onOpenReceipt }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('সবাই');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'pay' | 'delete', member }
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_mode: 'নগদ',
    collected_by: 'কোষাধ্যক্ষ',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    address: '',
    member_type: 'সক্রিয় সদস্য',
    target_amount: 500,
    notes: ''
  });

  const members = db.members || [];
  const membershipTypes = db.settings?.membership_types || [];

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (m.visible === false) return false;
      const matchesSearch = 
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.address && m.address.toLowerCase().includes(search.toLowerCase())) ||
        (m.phone && m.phone.includes(search));
      
      const matchesFilter = filter === 'সবাই' || m.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const deriveStatus = (target, collected) => {
    if (collected <= 0) return 'বাকি';
    if (collected >= target) return 'জমা হয়েছে';
    return 'আংশিক জমা';
  };

  const handleOpenAdd = () => {
    setMemberForm({
      name: '',
      phone: '',
      address: '',
      member_type: membershipTypes[0]?.name || 'সক্রিয় সদস্য',
      target_amount: 500,
      notes: ''
    });
    setModalState({ type: 'add' });
  };

  const handleOpenEdit = (member) => {
    setMemberForm({
      name: member.name,
      phone: member.phone || '',
      address: member.address || '',
      member_type: member.member_type,
      target_amount: member.target_amount,
      notes: member.notes || ''
    });
    setModalState({ type: 'edit', member });
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      showToast('সদস্যের নাম আবশ্যক', 'error');
      return;
    }

    if (modalState.type === 'add') {
      const newMember = {
        id: 'mem_' + Date.now(),
        sl_no: members.length + 1,
        name: memberForm.name.trim(),
        phone: memberForm.phone.trim(),
        address: memberForm.address.trim(),
        member_type: memberForm.member_type,
        target_amount: Number(memberForm.target_amount) || 0,
        collected_amount: 0,
        status: 'বাকি',
        last_payment_date: '',
        notes: memberForm.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        members: [...(prev.members || []), newMember]
      }));
      showToast('নতুন সদস্য সফলভাবে যুক্ত হয়েছে!');
    } else if (modalState.type === 'edit') {
      const target = Number(memberForm.target_amount) || 0;
      onUpdateDB((prev) => ({
        ...prev,
        members: (prev.members || []).map((m) =>
          m.id === modalState.member.id
            ? {
                ...m,
                name: memberForm.name.trim(),
                phone: memberForm.phone.trim(),
                address: memberForm.address.trim(),
                member_type: memberForm.member_type,
                target_amount: target,
                notes: memberForm.notes.trim(),
                status: deriveStatus(target, m.collected_amount)
              }
            : m
        )
      }));
      showToast('সদস্যের তথ্য সফলভাবে হালনাগাদ হয়েছে!');
    }
    setModalState(null);
  };

  const handleOpenPay = (member) => {
    const due = Math.max(0, (member.target_amount || 0) - (member.collected_amount || 0));
    setPaymentForm({
      amount: due > 0 ? due : '',
      payment_mode: 'নগদ',
      collected_by: 'কোষাধ্যক্ষ',
      payment_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalState({ type: 'pay', member });
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      showToast('বৈধ টাকার পরিমাণ লিখুন', 'error');
      return;
    }

    const member = modalState.member;
    const currentCollected = Number(member.collected_amount) || 0;
    const newCollected = currentCollected + amount;
    const target = Number(member.target_amount) || 0;
    const newStatus = deriveStatus(target, newCollected);

    const totalExistingPayments = (db.payments || []).length;
    const receiptNo = `PS-2026-${String(totalExistingPayments + 1).padStart(4, '0')}`;

    const newPayment = {
      id: 'pay_' + Date.now(),
      receipt_no: receiptNo,
      member_id: member.id,
      member_name: member.name,
      amount: amount,
      payment_date: paymentForm.payment_date,
      payment_mode: paymentForm.payment_mode,
      collected_by: paymentForm.collected_by,
      notes: paymentForm.notes.trim()
    };

    onUpdateDB((prev) => ({
      ...prev,
      members: (prev.members || []).map((m) =>
        m.id === member.id
          ? {
              ...m,
              collected_amount: newCollected,
              last_payment_date: paymentForm.payment_date,
              status: newStatus
            }
          : m
      ),
      payments: [newPayment, ...(prev.payments || [])]
    }));

    // Trigger celebration confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`চাঁদা জমা সফল! রসিদ নং: ${receiptNo}`);
    setModalState(null);

    // Open receipt modal right away
    onOpenReceipt(newPayment, { ...member, collected_amount: newCollected });
  };

  const handleDeleteMember = () => {
    onUpdateDB((prev) => ({
      ...prev,
      members: (prev.members || []).filter((m) => m.id !== modalState.member.id)
    }));
    showToast('সদস্য মুছে ফেলা হয়েছে');
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            সদস্য ও চাঁদা সংগ্রহ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            নাগরিকদের নির্ধারিত চাঁদা, জমা, বাকি হিসাব ও ডিজিটাল রশিদ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMembersToExcel(members)}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Excel এক্সপোর্ট</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>নতুন নাগরিক যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input
            type="text"
            placeholder="নাম, বাড়ি নম্বর বা মোবাইল দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0 overflow-x-auto">
          {['সবাই', 'জমা হয়েছে', 'আংশিক জমা', 'বাকি'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === tab
                  ? 'bg-[#4A0E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            কোনো নাগরিক বা সদস্য খুঁজে পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                <tr>
                  <th className="py-3 px-4">ক্রমিক</th>
                  <th className="py-3 px-4">নাম ও বিবরণ</th>
                  <th className="py-3 px-4">সদস্যপদের ধরন</th>
                  <th className="py-3 px-4">নির্ধারিত</th>
                  <th className="py-3 px-4">জমা</th>
                  <th className="py-3 px-4">বাকি</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((m, idx) => {
                  const target = Number(m.target_amount) || 0;
                  const collected = Number(m.collected_amount) || 0;
                  const due = Math.max(0, target - collected);
                  const reminderUrl = getWhatsAppDueReminderUrl(m);

                  return (
                    <tr key={m.id} className="hover:bg-[#FDF8EA]/60 transition">
                      <td className="py-3 px-4 font-mono text-stone-500">{toBnDigits(m.sl_no || idx + 1)}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm sm:text-base">{m.name}</div>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                          {m.address && (
                            <span className="flex items-center gap-1">
                              <Home size={12} />
                              <span>{m.address}</span>
                            </span>
                          )}
                          {m.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              <span>{m.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                          {m.member_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800">{formatTaka(target)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{formatTaka(collected)}</td>
                      <td className="py-3 px-4 font-bold text-rose-700">{formatTaka(due)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.status === 'জমা হয়েছে' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : m.status === 'আংশিক জমা' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.status === 'জমা হয়েছে' && <CheckCircle2 size={12} />}
                          {m.status === 'আংশিক জমা' && <Clock size={12} />}
                          {m.status === 'বাকি' && <AlertCircle size={12} />}
                          <span>{m.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pay Button */}
                          <button
                            onClick={() => handleOpenPay(m)}
                            className="px-2.5 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                            title="চাঁদা জমা গ্রহণ করুন"
                          >
                            <Receipt size={14} />
                            <span>জমা নিন</span>
                          </button>

                          {/* WhatsApp Reminder (If unpaid & phone exists) */}
                          {reminderUrl && m.status !== 'জমা হয়েছে' && (
                            <a
                              href={reminderUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                              title="হোয়াটসঅ্যাপে স্মরণ করিয়ে দিন"
                            >
                              <Share2 size={15} />
                            </a>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setModalState({ type: 'delete', member: m })}
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

      {/* Add / Edit Member Modal */}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <Modal 
          title={modalState.type === 'add' ? 'নতুন নাগরিক ও চাঁদা নির্ধারণ' : 'সদস্যের তথ্য সম্পাদনা'} 
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSaveMember} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="যেমন: শ্রী নিমাই চন্দ্র দাস"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বাড়ি / ফ্ল্যাট নং</label>
                <input
                  type="text"
                  value={memberForm.address}
                  onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                  placeholder="যেমন: ১২/এ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="যেমন: 9830012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">সদস্যপদের ধরন</label>
                <select
                  value={memberForm.member_type}
                  onChange={(e) => setMemberForm({ ...memberForm, member_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white"
                >
                  {membershipTypes.map((t) => (
                    <option key={t.id || t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">নির্ধারিত চাঁদা (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={memberForm.target_amount}
                  onChange={(e) => setMemberForm({ ...memberForm, target_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <input
                type="text"
                value={memberForm.notes}
                onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                placeholder="যেমন: পূজার ২ দিন আগে চাঁদা সংগ্রহ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
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

      {/* Collect Payment Modal */}
      {modalState?.type === 'pay' && (
        <Modal 
          title={`চাঁদা সংগ্রহ ও রসিদ তৈরি: ${modalState.member.name}`} 
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSavePayment} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between text-xs">
              <div>
                <span className="text-stone-500 block">নির্ধারিত চাঁদা</span>
                <span className="font-bold text-stone-800">{formatTaka(modalState.member.target_amount)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">পূর্বে জমা</span>
                <span className="font-bold text-emerald-700">{formatTaka(modalState.member.collected_amount)}</span>
              </div>
              <div>
                <span className="text-stone-500 block">অবশিষ্ট বাকি</span>
                <span className="font-bold text-rose-700">
                  {formatTaka(Math.max(0, modalState.member.target_amount - modalState.member.collected_amount))}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">এখন জমা দেওয়ার পরিমাণ (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="যেমন: 500"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#800020] text-lg font-bold text-[#4A0E17] focus:outline-none bg-amber-50/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentForm.payment_mode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none bg-white font-medium"
                >
                  <option value="নগদ">নগদ (Cash)</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
                  <option value="চেক">চেক</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">জমার তারিখ</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">কে সংগ্রহ করলেন?</label>
                <input
                  type="text"
                  value={paymentForm.collected_by}
                  onChange={(e) => setPaymentForm({ ...paymentForm, collected_by: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="যেমন: ১ম কিস্তি"
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
                className="px-5 py-2.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 font-extrabold rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Receipt size={17} />
                <span>জমা নিশ্চিত ও রসিদ তৈরি করুন</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {modalState?.type === 'delete' && (
        <Modal title="সদস্য মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.member.name}</span>-এর যাবতীয় তথ্য মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteMember}
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
