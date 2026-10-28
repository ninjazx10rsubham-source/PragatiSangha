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
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  BookOpen,
  Check,
  ArrowRight,
  UserPlus,
  Zap,
  Layers,
  CheckCheck,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../components/Modal';
import { formatTaka, toBnDigits } from '../utils/formatters';
import { exportMembersToExcel, exportPreviousYearMembersToExcel, getWhatsAppDueReminderUrl } from '../services/exportService';
import { deleteMemberFromSupabase, deletePreviousYearMemberFromSupabase, defaultPreviousYearMembers } from '../services/dataService';

export default function MembersPage({ db, onUpdateDB, showToast, onOpenReceipt }) {
  const [activeMainTab, setActiveMainTab] = useState('current'); // Show current members where all 205 members are listed!
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('সবাই');
  const [diffFilter, setDiffFilter] = useState('সব'); // 'সব', 'বৃদ্ধি', 'হ্রাস', 'একই', 'নতুন'
  const [prevSearch, setPrevSearch] = useState('');
  const [modalState, setModalState] = useState(null); // { type: 'add' | 'edit' | 'pay' | 'delete' | 'add_prev' | 'edit_prev' | 'delete_prev', member, prevRecord }
  const [autoFilledNotice, setAutoFilledNotice] = useState(null);

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
    previous_year_amount: 0,
    target_amount: 500,
    notes: ''
  });

  const [prevRecordForm, setPrevRecordForm] = useState({
    name: '',
    phone: '',
    address: '',
    member_type: 'সক্রিয় সদস্য',
    previous_year_amount: '',
    notes: ''
  });

  const members = db.members || [];
  const membershipTypes = db.settings?.membership_types || [];

  // Previous year ledger records (Directly bound to editable db.previousYearMembers)
  const previousYearList = useMemo(() => {
    if (Array.isArray(db.previousYearMembers)) {
      return db.previousYearMembers;
    }
    return defaultPreviousYearMembers;
  }, [db.previousYearMembers]);

  // Set of names already present in current year
  const currentMembersMap = useMemo(() => {
    const map = new Map();
    members.forEach(m => {
      map.set(m.name.trim().toLowerCase(), m);
    });
    return map;
  }, [members]);

  // Archive filtered members
  const filteredPreviousList = useMemo(() => {
    return previousYearList.filter(p => {
      if (!prevSearch) return true;
      const q = prevSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    });
  }, [previousYearList, prevSearch]);

  // Archive counts
  const archiveTotalCount = previousYearList.length;
  const archiveImportedCount = previousYearList.filter(p => currentMembersMap.has(p.name.trim().toLowerCase())).length;
  const archiveRemainingCount = Math.max(0, archiveTotalCount - archiveImportedCount);
  const archiveTotalAmount = previousYearList.reduce((sum, p) => sum + (Number(p.previous_year_amount) || 0), 0);

  // Live matching previous records when typing in Add modal
  const matchingPrevious = useMemo(() => {
    if (modalState?.type !== 'add') return [];
    const q = memberForm.name.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    return previousYearList.filter(p => {
      const pName = p.name.toLowerCase();
      const pPhone = (p.phone || '').toLowerCase();
      const pAddr = (p.address || '').toLowerCase();
      return pName.includes(q) || pPhone.includes(q) || pAddr.includes(q);
    }).slice(0, 4);
  }, [modalState?.type, memberForm.name, previousYearList]);

  // KPI Computations for Current Year
  const totalTarget = members.reduce((sum, m) => sum + (Number(m.target_amount) || 0), 0);
  const totalPrevious = members.reduce((sum, m) => sum + (Number(m.previous_year_amount) || 0), 0);
  const totalCollected = members.reduce((sum, m) => sum + (Number(m.collected_amount) || 0), 0);
  const netGrowth = totalTarget - totalPrevious;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (m.visible === false) return false;
      const matchesSearch = 
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.address && m.address.toLowerCase().includes(search.toLowerCase())) ||
        (m.phone && m.phone.includes(search));
      
      const matchesStatus = statusFilter === 'সবাই' || m.status === statusFilter;

      const prev = Number(m.previous_year_amount) || 0;
      const curr = Number(m.target_amount) || 0;
      const diff = curr - prev;

      let matchesDiff = true;
      if (diffFilter === 'বৃদ্ধি') matchesDiff = prev > 0 && diff > 0;
      else if (diffFilter === 'হ্রাস') matchesDiff = prev > 0 && diff < 0;
      else if (diffFilter === 'একই') matchesDiff = prev > 0 && diff === 0;
      else if (diffFilter === 'নতুন') matchesDiff = prev === 0;

      return matchesSearch && matchesStatus && matchesDiff;
    });
  }, [members, search, statusFilter, diffFilter]);

  const deriveStatus = (target, collected) => {
    if (collected <= 0) return 'বাকি';
    if (collected >= target) return 'জমা হয়েছে';
    return 'আংশিক জমা';
  };

  // --- Current Year Member Handlers ---
  const handleOpenAdd = (prefillData = null) => {
    setAutoFilledNotice(prefillData ? { ...prefillData } : null);
    setMemberForm({
      name: prefillData?.name || '',
      phone: prefillData?.phone || '',
      address: prefillData?.address || '',
      member_type: prefillData?.member_type || membershipTypes[0]?.name || 'সক্রিয় সদস্য',
      previous_year_amount: prefillData ? (Number(prefillData.previous_year_amount) || 0) : 0,
      target_amount: prefillData ? (Number(prefillData.previous_year_amount) || 500) : 500,
      notes: prefillData?.notes || ''
    });
    setModalState({ type: 'add' });
  };

  const handleSelectPreviousSuggestion = (p) => {
    const prevAmt = Number(p.previous_year_amount) || 0;
    setMemberForm({
      ...memberForm,
      name: p.name,
      phone: p.phone || memberForm.phone,
      address: p.address || memberForm.address,
      member_type: p.member_type || memberForm.member_type,
      previous_year_amount: prevAmt,
      target_amount: memberForm.target_amount > 0 && memberForm.target_amount !== 500 
        ? memberForm.target_amount 
        : prevAmt > 0 ? prevAmt : 500,
      notes: p.notes || memberForm.notes
    });
    setAutoFilledNotice(p);
  };

  const handleOpenEdit = (member) => {
    setAutoFilledNotice(null);
    setMemberForm({
      name: member.name,
      phone: member.phone || '',
      address: member.address || '',
      member_type: member.member_type,
      previous_year_amount: Number(member.previous_year_amount) || 0,
      target_amount: Number(member.target_amount) || 0,
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

    const prevAmt = Number(memberForm.previous_year_amount) || 0;
    const targetAmt = Number(memberForm.target_amount) || 0;

    if (modalState.type === 'add') {
      const newMember = {
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        sl_no: members.length + 1,
        name: memberForm.name.trim(),
        phone: memberForm.phone.trim(),
        address: memberForm.address.trim(),
        member_type: memberForm.member_type,
        previous_year_amount: prevAmt,
        target_amount: targetAmt,
        collected_amount: 0,
        status: 'বাকি',
        last_payment_date: null,
        notes: memberForm.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        members: [...(prev.members || []), newMember]
      }));
      showToast(`'${newMember.name}' সফলভাবে চলতি বছরে যুক্ত হয়েছে!`);
    } else if (modalState.type === 'edit') {
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
                previous_year_amount: prevAmt,
                target_amount: targetAmt,
                notes: memberForm.notes.trim(),
                status: deriveStatus(targetAmt, m.collected_amount)
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

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`চাঁদা জমা সফল! রসিদ নং: ${receiptNo}`);
    setModalState(null);

    onOpenReceipt(newPayment, { ...member, collected_amount: newCollected });
  };

  // Fixed Member Deletion: Deletes from Supabase directly & updates DB state
  const handleDeleteMember = async () => {
    const memberToDelete = modalState?.member;
    if (!memberToDelete) return;

    try {
      if (memberToDelete.id) {
        await deleteMemberFromSupabase(memberToDelete.id);
      }
    } catch (err) {
      console.error('Error deleting member from Supabase:', err);
    }

    onUpdateDB((prev) => ({
      ...prev,
      members: (prev.members || []).filter((m) => m.id !== memberToDelete.id)
    }));
    showToast(`'${memberToDelete.name}' সফলভাবে মুছে ফেলা হয়েছে!`);
    setModalState(null);
  };

  // --- Previous Year Ledger Handlers (Editable & Deletable) ---
  const handleOpenAddPrevRecord = () => {
    setPrevRecordForm({
      name: '',
      phone: '',
      address: '',
      member_type: membershipTypes[0]?.name || 'সক্রিয় সদস্য',
      previous_year_amount: '',
      notes: ''
    });
    setModalState({ type: 'add_prev' });
  };

  const handleOpenEditPrevRecord = (record) => {
    setPrevRecordForm({
      name: record.name,
      phone: record.phone || '',
      address: record.address || '',
      member_type: record.member_type || membershipTypes[0]?.name || 'সক্রিয় সদস্য',
      previous_year_amount: record.previous_year_amount ?? '',
      notes: record.notes || ''
    });
    setModalState({ type: 'edit_prev', prevRecord: record });
  };

  const handleSavePrevRecord = (e) => {
    e.preventDefault();
    if (!prevRecordForm.name.trim()) {
      showToast('সদস্যের নাম আবশ্যক', 'error');
      return;
    }

    const prevAmt = Number(prevRecordForm.previous_year_amount) || 0;

    if (modalState.type === 'add_prev') {
      const newRecord = {
        id: 'prev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: prevRecordForm.name.trim(),
        phone: prevRecordForm.phone.trim(),
        address: prevRecordForm.address.trim(),
        member_type: prevRecordForm.member_type,
        previous_year_amount: prevAmt,
        notes: prevRecordForm.notes.trim()
      };

      onUpdateDB(prev => ({
        ...prev,
        previousYearMembers: [newRecord, ...(prev.previousYearMembers || defaultPreviousYearMembers)]
      }));

      showToast(`'${newRecord.name}' বিগত বছরের খাতায় সফলভাবে যোগ করা হয়েছে!`);
    } else if (modalState.type === 'edit_prev') {
      const targetRecord = modalState.prevRecord;
      const oldName = targetRecord.name.trim().toLowerCase();
      const updatedName = prevRecordForm.name.trim();

      onUpdateDB(prev => {
        const currentList = prev.previousYearMembers || defaultPreviousYearMembers;
        const updatedList = currentList.map(p =>
          p.id === targetRecord.id
            ? {
                ...p,
                name: updatedName,
                phone: prevRecordForm.phone.trim(),
                address: prevRecordForm.address.trim(),
                member_type: prevRecordForm.member_type,
                previous_year_amount: prevAmt,
                notes: prevRecordForm.notes.trim()
              }
            : p
        );

        // Synchronize corresponding member in current year if present
        const updatedMembers = (prev.members || []).map(m => {
          if (m.name.trim().toLowerCase() === oldName) {
            return {
              ...m,
              previous_year_amount: prevAmt,
              phone: m.phone || prevRecordForm.phone.trim(),
              address: m.address || prevRecordForm.address.trim()
            };
          }
          return m;
        });

        return {
          ...prev,
          previousYearMembers: updatedList,
          members: updatedMembers
        };
      });

      showToast(`'${updatedName}'-এর বিগত বছরের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!`);
    }

    setModalState(null);
  };

  const handleDeletePrevRecord = async () => {
    const toDelete = modalState?.prevRecord;
    if (!toDelete) return;

    try {
      if (toDelete.id) {
        await deletePreviousYearMemberFromSupabase(toDelete.id);
      }
    } catch (err) {
      console.error('Error deleting prev member from Supabase:', err);
    }

    onUpdateDB(prev => ({
      ...prev,
      previousYearMembers: (prev.previousYearMembers || defaultPreviousYearMembers).filter(p => p.id !== toDelete.id)
    }));

    showToast(`'${toDelete.name}'-এর রেকর্ড বিগত বছরের খাতা থেকে মুছে ফেলা হয়েছে!`);
    setModalState(null);
  };

  // Bulk import remaining previous year members to current year
  const handleBulkImportPrevious = () => {
    const unimported = previousYearList.filter(p => !currentMembersMap.has(p.name.trim().toLowerCase()));

    if (unimported.length === 0) {
      showToast('বিগত বছরের সকল সদস্য ইতিমধ্যে চলতি তালিকায় যুক্ত রয়েছে!', 'info');
      return;
    }

    const currentCount = members.length;
    const newMembers = unimported.map((p, idx) => ({
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + idx,
      sl_no: currentCount + idx + 1,
      name: p.name.trim(),
      phone: (p.phone || '').trim(),
      address: (p.address || '').trim(),
      member_type: p.member_type || 'সক্রিয় সদস্য',
      previous_year_amount: Number(p.previous_year_amount) || 0,
      target_amount: Number(p.previous_year_amount) || 500,
      collected_amount: 0,
      status: 'বাকি',
      last_payment_date: null,
      notes: 'বিগত বছরের খাতা থেকে অটো-ইম্পোর্ট'
    }));

    onUpdateDB(prev => ({
      ...prev,
      members: [...(prev.members || []), ...newMembers]
    }));

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    showToast(`সফলভাবে ${toBnDigits(unimported.length)} জন সদস্য চলতি বছরে অন্তর্ভুক্ত করা হয়েছে!`);
    setActiveMainTab('current');
  };

  // Helper calculation for live form difference preview
  const formPrev = Number(memberForm.previous_year_amount) || 0;
  const formTarget = Number(memberForm.target_amount) || 0;
  const formDiff = formTarget - formPrev;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
            সদস্য ও চাঁদা সংগ্রহ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            পূর্ববর্তী বছরের তুলনা, চাঁদা বৃদ্ধি/হ্রাস ট্র্যাকিং, অটো-ফেচ ও খাতা সম্পাদনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'current' ? (
            <button
              onClick={() => exportMembersToExcel(members)}
              className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download size={15} />
              <span>Excel এক্সপোর্ট</span>
            </button>
          ) : (
            <button
              onClick={() => exportPreviousYearMembersToExcel(previousYearList)}
              className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-700 border border-[#EADBB6] text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet size={15} />
              <span>খাতা এক্সপোর্ট (Excel)</span>
            </button>
          )}

          {activeMainTab === 'current' ? (
            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus size={16} />
              <span>নতুন সদস্য যোগ করুন</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddPrevRecord}
              className="px-4 py-2 rounded-xl bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus size={16} />
              <span>বিগত বছরের খাতায় নাম যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation: Current Year vs Previous Year Archive */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveMainTab('current')}
          className={`pb-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'current'
              ? 'border-[#800020] text-[#800020]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users size={16} />
          <span>চলতি বছরের সদস্য ও চাঁদা ({toBnDigits(members.length)})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('archive')}
          className={`pb-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'archive'
              ? 'border-[#800020] text-[#800020]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen size={16} />
          <span>বিগত বছরের খাতা ও অটো-ইম্পোর্ট ({toBnDigits(archiveTotalCount)})</span>
          {archiveRemainingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {toBnDigits(archiveRemainingCount)} জন বাকি
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CURRENT YEAR MEMBERS & COLLECTIONS */}
      {activeMainTab === 'current' && (
        <div className="space-y-6">
          {/* Comparison KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase block">মোট সদস্য</span>
              <p className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] mt-1">{toBnDigits(members.length)} জন</p>
              <span className="text-[11px] text-stone-500">নিবন্ধিত নাগরিক</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase block">আগের বছরের মোট চাঁদা</span>
              <p className="text-xl sm:text-2xl font-extrabold text-stone-700 mt-1">{formatTaka(totalPrevious)}</p>
              <span className="text-[11px] text-stone-500">বিগত বছরের ভিত্তি</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase block">এই বছরের নির্ধারিত চাঁদা</span>
              <p className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] mt-1">{formatTaka(totalTarget)}</p>
              <span className="text-[11px] text-emerald-700 font-semibold">আদায় হয়েছে: {formatTaka(totalCollected)}</span>
            </div>

            <div className={`p-4 rounded-2xl border shadow-xs ${netGrowth >= 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-stone-700">সামগ্রিক চাঁদার প্রবৃদ্ধি</span>
                {netGrowth >= 0 ? (
                  <TrendingUp size={16} className="text-emerald-700" />
                ) : (
                  <TrendingDown size={16} className="text-rose-700" />
                )}
              </div>
              <p className={`text-xl sm:text-2xl font-extrabold mt-1 ${netGrowth >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {netGrowth >= 0 ? '+' : ''}{formatTaka(netGrowth)}
              </p>
              <span className={`text-[11px] font-bold ${netGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netGrowth >= 0 ? 'পূর্ববর্তী বছরের চেয়ে বৃদ্ধি 📈' : 'পূর্ববর্তী বছরের চেয়ে হ্রাস 📉'}
              </span>
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

            {/* Change Comparison Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0 overflow-x-auto">
              {[
                { id: 'সব', label: 'সব চাঁদা' },
                { id: 'বৃদ্ধি', label: 'বৃদ্ধি 📈' },
                { id: 'হ্রাস', label: 'হ্রাস 📉' },
                { id: 'একই', label: 'একই ➖' },
                { id: 'নতুন', label: 'নতুন 🌟' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDiffFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    diffFilter === tab.id
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 bg-[#FFFDF7] p-1 rounded-xl border border-stone-200 shrink-0 overflow-x-auto">
              {['সবাই', 'জমা হয়েছে', 'আংশিক জমা', 'বাকি'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === tab
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
                কোনো সদস্য খুঁজে পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                    <tr>
                      <th className="py-3 px-4">ক্রমিক</th>
                      <th className="py-3 px-4">নাম ও ঠিকানা</th>
                      <th className="py-3 px-4">সদস্যপদের ধরন</th>
                      <th className="py-3 px-4">আগের বছর বনাম বর্তমান</th>
                      <th className="py-3 px-4">চাঁদার পরিবর্তন</th>
                      <th className="py-3 px-4">মোট জমা</th>
                      <th className="py-3 px-4">বাকি</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMembers.map((m, idx) => {
                      const prev = Number(m.previous_year_amount) || 0;
                      const target = Number(m.target_amount) || 0;
                      const collected = Number(m.collected_amount) || 0;
                      const due = Math.max(0, target - collected);
                      const diff = target - prev;
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

                          {/* Previous Year vs Current Year */}
                          <td className="py-3 px-4">
                            <div className="text-xs">
                              <span className="text-stone-500 block">পূর্বে: <b className="text-stone-700 font-semibold">{prev > 0 ? formatTaka(prev) : '০'}</b></span>
                              <span className="text-stone-900 font-extrabold text-sm block">বর্তমানে: {formatTaka(target)}</span>
                            </div>
                          </td>

                          {/* Growth / Difference Badge */}
                          <td className="py-3 px-4">
                            {prev === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                <Sparkles size={12} className="text-sky-600" />
                                <span>নতুন সদস্য</span>
                              </span>
                            ) : diff > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                                <ArrowUpRight size={13} className="text-emerald-700 font-extrabold" />
                                <span>+{formatTaka(diff)} বৃদ্ধি</span>
                              </span>
                            ) : diff < 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <ArrowDownRight size={13} className="text-rose-700 font-extrabold" />
                                <span>-{formatTaka(Math.abs(diff))} হ্রাস</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                                <Minus size={12} />
                                <span>একই রয়েছে</span>
                              </span>
                            )}
                          </td>

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
        </div>
      )}

      {/* TAB 2: PREVIOUS YEAR ARCHIVE & AUTO-IMPORT (ALL EDITABLE & DELETABLE) */}
      {activeMainTab === 'archive' && (
        <div className="space-y-6">
          {/* Archive KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase block">বিগত বছরের মোট সদস্য</span>
              <p className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] mt-1">{toBnDigits(archiveTotalCount)} জন</p>
              <span className="text-[11px] text-stone-500">সম্পূর্ণ খাতার তালিকা</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase block">বিগত বছরের মোট চাঁদা</span>
              <p className="text-xl sm:text-2xl font-extrabold text-stone-700 mt-1">{formatTaka(archiveTotalAmount)}</p>
              <span className="text-[11px] text-stone-500">পূর্ববর্তী সংগ্রহ</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase block">চলতি বছরে অন্তর্ভুক্ত</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">{toBnDigits(archiveImportedCount)} জন</p>
              <span className="text-[11px] text-emerald-700 font-bold">ইতিমধ্যে ২০২৬ তালিকায় যুক্ত</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-xs">
              <span className="text-xs font-bold text-amber-900 uppercase block">এখনও অন্তর্ভুক্ত বাকি</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-1">{toBnDigits(archiveRemainingCount)} জন</p>
              <span className="text-[11px] text-amber-700 font-bold">চলতি বছরের তালিকায় আনার অপেক্ষায়</span>
            </div>
          </div>

          {/* Action & Search Bar for Archive */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF7] p-3 rounded-2xl border border-[#EADBB6]">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
              <input
                type="text"
                placeholder="বিগত বছরের সদস্যের নাম, ঠিকানা বা মোবাইল দিয়ে খুঁজুন..."
                value={prevSearch}
                onChange={(e) => setPrevSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={handleOpenAddPrevRecord}
                className="px-3.5 py-2.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>নতুন রেকর্ড যোগ করুন</span>
              </button>

              {archiveRemainingCount > 0 && (
                <button
                  onClick={handleBulkImportPrevious}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <Zap size={16} className="text-amber-200 animate-pulse" />
                  <span>বাকি {toBnDigits(archiveRemainingCount)} জনকে চলতি বছরে আনুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Archive Table with Full Edit & Delete Options */}
          <div className="bg-[#FFFDF7] rounded-2xl border border-[#EADBB6] shadow-sm overflow-hidden">
            {filteredPreviousList.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-sm">
                বিগত বছরের কোনো রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7EED3]/70 text-[#4A0E17] font-bold border-b border-[#EADBB6]">
                    <tr>
                      <th className="py-3 px-4">ক্রমিক</th>
                      <th className="py-3 px-4">নাম ও পরিচয়</th>
                      <th className="py-3 px-4">সদস্যপদের ধরন</th>
                      <th className="py-3 px-4">বিল নং</th>
                      <th className="py-3 px-4">নির্ধারিত চাঁদা</th>
                      <th className="py-3 px-4">জমা দেওয়া পরিমাণ (Paid)</th>
                      <th className="py-3 px-4">চলতি বছরে স্ট্যাটাস</th>
                      <th className="py-3 px-4">তারিখ ও মন্তব্য</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPreviousList.map((p, idx) => {
                      const isImported = currentMembersMap.has(p.name.trim().toLowerCase());
                      const currentMember = currentMembersMap.get(p.name.trim().toLowerCase());

                      return (
                        <tr key={p.id || idx} className="hover:bg-[#FDF8EA]/60 transition">
                          <td className="py-3 px-4 font-mono text-stone-500">{toBnDigits(idx + 1)}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900 text-sm sm:text-base">{p.name}</div>
                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                              {p.address && (
                                <span className="flex items-center gap-1">
                                  <Home size={12} />
                                  <span>{p.address}</span>
                                </span>
                              )}
                              {p.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  <span>{p.phone}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                              {p.member_type || 'পাড়ার নাগরিক বৃন্দ'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-600 text-xs">
                            {p.bill_no ? `#${p.bill_no}` : '—'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-stone-700 text-sm">
                            {p.nirdharito_amount ? formatTaka(p.nirdharito_amount) : '—'}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-emerald-800 text-sm">
                            {p.paid_amount > 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {formatTaka(p.paid_amount)}
                              </span>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isImported ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCheck size={13} className="text-emerald-700" />
                                  <span>চলতি বছরে অন্তর্ভুক্ত</span>
                                </span>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  (নির্ধারিত: {formatTaka(currentMember.target_amount)})
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Clock size={13} className="text-amber-700" />
                                <span>এখনও অন্তর্ভুক্ত হয়নি</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-stone-500">
                            {p.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Import or View Button */}
                              {isImported ? (
                                <button
                                  onClick={() => {
                                    setActiveMainTab('current');
                                    setSearch(p.name);
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="চলতি তালিকায় সদস্যটি দেখুন"
                                >
                                  <span>তালিকায় দেখুন</span>
                                  <ArrowRight size={13} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenAdd(p)}
                                  className="px-2.5 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                  title="চলতি বছরে চাঁদা নির্ধারণ করে যুক্ত করুন"
                                >
                                  <UserPlus size={13} />
                                  <span>চলতি বছরে আনুন ⚡</span>
                                </button>
                              )}

                              {/* Edit Previous Year Member Record */}
                              <button
                                onClick={() => handleOpenEditPrevRecord(p)}
                                className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200/80 rounded-lg transition"
                                title="বিগত বছরের তথ্য সম্পাদনা করুন"
                              >
                                <Edit3 size={15} />
                              </button>

                              {/* Delete Previous Year Member Record */}
                              <button
                                onClick={() => setModalState({ type: 'delete_prev', prevRecord: p })}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="বিগত বছরের খাতা থেকে রেকর্ডটি মুছে ফেলুন"
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
        </div>
      )}

      {/* Add / Edit Current Year Member Modal */}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <Modal 
          title={modalState.type === 'add' ? 'নতুন নাগরিক ও চাঁদা নির্ধারণ' : 'সদস্যের তথ্য ও চাঁদা সম্পাদনা'} 
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSaveMember} className="space-y-4 text-xs sm:text-sm">
            
            {/* Auto-fill notification if loaded from previous year */}
            {autoFilledNotice && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2 shadow-xs">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">✨ বিগত বছরের খাতা থেকে তথ্য অটো-ফেচ করা হয়েছে!</span>
                  <span>পূর্ববর্তী চাঁদা: <b className="font-bold">{formatTaka(autoFilledNotice.previous_year_amount || 0)}</b> | ঠিকানা: {autoFilledNotice.address || '—'}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-stone-700 font-bold mb-1">সদস্যের পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => {
                  setMemberForm({ ...memberForm, name: e.target.value });
                  if (autoFilledNotice && e.target.value !== autoFilledNotice.name) {
                    setAutoFilledNotice(null);
                  }
                }}
                placeholder="যেমন: শ্রী নিমাই চন্দ্র দাস"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-semibold"
              />

              {/* Live auto-suggestions from previous year records */}
              {modalState.type === 'add' && matchingPrevious.length > 0 && (
                <div className="mt-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <History size={13} className="text-amber-700" />
                    বিগত বছরের খাতার মিল পাওয়া গেছে (ক্লিক করলেই স্বয়ংক্রিয়ভাবে পূরণ হবে):
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchingPrevious.map((p) => (
                      <button
                        type="button"
                        key={p.id || p.name}
                        onClick={() => handleSelectPreviousSuggestion(p)}
                        className="px-2.5 py-1.5 bg-white hover:bg-amber-100/90 text-stone-800 rounded-lg border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs group"
                      >
                        <UserPlus size={12} className="text-amber-700 group-hover:scale-110 transition" />
                        <span>{p.name}</span>
                        <span className="text-emerald-700 font-extrabold">({formatTaka(p.previous_year_amount || 0)})</span>
                        {p.address && <span className="text-stone-400 text-[10px]">[{p.address}]</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

            <div>
              <label className="block text-stone-700 font-bold mb-1">সদস্যপদের ধরন</label>
              <select
                value={memberForm.member_type}
                onChange={(e) => setMemberForm({ ...memberForm, member_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-medium"
              >
                {membershipTypes.map((t) => (
                  <option key={t.id || t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Previous Year vs Current Year Chanda Inputs */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">
                চাঁদার তুলনা ও পরিমাণ নির্ধারণ
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    পূর্ববর্তী বছরের চাঁদা (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={memberForm.previous_year_amount}
                    onChange={(e) => setMemberForm({ ...memberForm, previous_year_amount: e.target.value })}
                    placeholder="যেমন: 400"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none font-semibold text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    এই বছরের নির্ধারিত চাঁদা (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={memberForm.target_amount}
                    onChange={(e) => setMemberForm({ ...memberForm, target_amount: e.target.value })}
                    placeholder="যেমন: 500"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#800020] focus:outline-none font-bold text-[#4A0E17]"
                  />
                </div>
              </div>

              {/* Dynamic Live Difference Box */}
              <div className="pt-1">
                {formPrev === 0 ? (
                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-sky-600" />
                    <span>নতুন সদস্য — পূর্ববর্তী বছরের কোনো চাঁদা নথিভুক্ত নেই</span>
                  </div>
                ) : formDiff > 0 ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={15} className="text-emerald-600 font-extrabold" />
                      <span>পূর্ববর্তী বছরের তুলনায় চাঁদা বৃদ্ধি পেয়েছে:</span>
                    </span>
                    <span className="text-sm font-extrabold text-emerald-900">
                      +{formatTaka(formDiff)} ({toBnDigits(Math.round((formDiff / formPrev) * 100))}%)
                    </span>
                  </div>
                ) : formDiff < 0 ? (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown size={15} className="text-rose-600 font-extrabold" />
                      <span>পূর্ববর্তী বছরের তুলনায় চাঁদা হ্রাস পেয়েছে:</span>
                    </span>
                    <span className="text-sm font-extrabold text-rose-900">
                      -{formatTaka(Math.abs(formDiff))} ({toBnDigits(Math.round((Math.abs(formDiff) / formPrev) * 100))}%)
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Minus size={14} />
                    <span>পূর্ববর্তী বছরের চাঁদার সমান অপরিবর্তিত রাখা হয়েছে</span>
                  </div>
                )}
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

      {/* Add / Edit Previous Year Record Modal */}
      {(modalState?.type === 'add_prev' || modalState?.type === 'edit_prev') && (
        <Modal 
          title={modalState.type === 'add_prev' ? 'বিগত বছরের খাতায় নতুন রেকর্ড যোগ করুন' : `বিগত বছরের রেকর্ড সম্পাদনা: ${modalState.prevRecord.name}`} 
          onClose={() => setModalState(null)}
        >
          <form onSubmit={handleSavePrevRecord} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">সদস্যের পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={prevRecordForm.name}
                onChange={(e) => setPrevRecordForm({ ...prevRecordForm, name: e.target.value })}
                placeholder="যেমন: শ্রী নিমাই চন্দ্র দাস"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">বাড়ি / ফ্ল্যাট নং</label>
                <input
                  type="text"
                  value={prevRecordForm.address}
                  onChange={(e) => setPrevRecordForm({ ...prevRecordForm, address: e.target.value })}
                  placeholder="যেমন: ১২/এ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  value={prevRecordForm.phone}
                  onChange={(e) => setPrevRecordForm({ ...prevRecordForm, phone: e.target.value })}
                  placeholder="যেমন: 9830012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">সদস্যপদের ধরন</label>
                <select
                  value={prevRecordForm.member_type}
                  onChange={(e) => setPrevRecordForm({ ...prevRecordForm, member_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-medium"
                >
                  {membershipTypes.map((t) => (
                    <option key={t.id || t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">বিগত বছরের চাঁদা (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={prevRecordForm.previous_year_amount}
                  onChange={(e) => setPrevRecordForm({ ...prevRecordForm, previous_year_amount: e.target.value })}
                  placeholder="যেমন: 400"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-stone-900 bg-amber-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <input
                type="text"
                value={prevRecordForm.notes}
                onChange={(e) => setPrevRecordForm({ ...prevRecordForm, notes: e.target.value })}
                placeholder="যেমন: গত বছর সম্পূর্ণ পরিশোধিত"
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

      {/* Delete Current Year Member Confirmation Modal */}
      {modalState?.type === 'delete' && (
        <Modal title="সদস্য মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.member.name}</span>-এর যাবতীয় তথ্য চলতি বছরের তালিকা থেকে মুছে ফেলতে চান?
            </p>
            <p className="text-xs text-stone-500 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              ⚠️ এটি সরাসরি ক্লাউড ডাটাবেজ (Supabase) ও ওয়েবসাইট থেকে সদস্যটিকে স্থায়ীভাবে মুছে ফেলবে।
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

      {/* Delete Previous Year Record Confirmation Modal */}
      {modalState?.type === 'delete_prev' && (
        <Modal title="বিগত বছরের রেকর্ড মুছে ফেলার নিশ্চিতকরণ" onClose={() => setModalState(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{modalState.prevRecord.name}</span>-এর বিগত বছরের খাতার রেকর্ডটি মুছে ফেলতে চান?
            </p>
            <p className="text-xs text-stone-500 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              ⚠️ এটি বিগত বছরের খাতা ও ক্লাউড ডাটাবেজ থেকে এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalState(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeletePrevRecord}
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
