import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  Heart, 
  Phone, 
  MapPin, 
  Sparkles, 
  Receipt, 
  UtensilsCrossed, 
  Printer, 
  Info,
  Plus,
  Edit3,
  Trash2,
  Flame,
  Bell,
  Music
} from 'lucide-react';
import Modal from '../components/Modal';
import SchedulePrintModal from '../components/SchedulePrintModal';
import { formatTaka, toBnDigits } from '../utils/formatters';
import { MAA_SHYAMA_IMG } from '../assets/maaShyamaImage';

export default function PublicPortalPage({ db, onUpdateDB, showToast, onOpenReceipt }) {
  const [search, setSearch] = useState('');
  const [scheduleModal, setScheduleModal] = useState(null); // { type: 'add' | 'edit' | 'delete', item }
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    tithi_or_date: '',
    time: '',
    category: 'পুজো ও আরতি',
    notes: ''
  });

  const members = db.members || [];
  const sponsors = db.sponsors || [];
  const scheduleList = db.settings?.puja_schedule || [];

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.address && m.address.toLowerCase().includes(search.toLowerCase())) ||
      (m.phone && m.phone.includes(search))
    );
  }, [members, search]);

  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'পুষ্পাঞ্জলি':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: Sparkles };
      case 'মহাপ্রসাদ ও ভোগ':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: UtensilsCrossed };
      case 'আরতি ও নিশিপূজা':
      case 'পুজো ও আরতি':
        return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', icon: Flame };
      case 'শোভাযাত্রা ও বিসর্জন':
        return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', icon: Bell };
      case 'সাংস্কৃতিক অনুষ্ঠান':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', icon: Music };
      default:
        return { bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-[#4A0E17]', icon: Clock };
    }
  };

  // --- Schedule Handlers ---
  const handleOpenAddSchedule = () => {
    setScheduleForm({
      title: '',
      tithi_or_date: '',
      time: '',
      category: 'পুজো ও আরতি',
      notes: ''
    });
    setScheduleModal({ type: 'add' });
  };

  const handleOpenEditSchedule = (item) => {
    setScheduleForm({
      title: item.title,
      tithi_or_date: item.tithi_or_date || '',
      time: item.time || '',
      category: item.category || 'পুজো ও আরতি',
      notes: item.notes || ''
    });
    setScheduleModal({ type: 'edit', item });
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) {
      showToast?.('পূজার পর্ব বা রীতির নাম আবশ্যক', 'error');
      return;
    }

    const currentList = db.settings?.puja_schedule || [];

    if (scheduleModal.type === 'add') {
      const newItem = {
        id: 'sch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title: scheduleForm.title.trim(),
        tithi_or_date: scheduleForm.tithi_or_date.trim(),
        time: scheduleForm.time.trim(),
        category: scheduleForm.category,
        notes: scheduleForm.notes.trim()
      };

      const updatedList = [...currentList, newItem];
      onUpdateDB?.((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          puja_schedule: updatedList
        }
      }));

      showToast?.(`'${newItem.title}' পূজার নির্ঘণ্টে সফলভাবে যুক্ত হয়েছে!`);
    } else if (scheduleModal.type === 'edit') {
      const updatedList = currentList.map((s) =>
        s.id === scheduleModal.item.id
          ? {
              ...s,
              title: scheduleForm.title.trim(),
              tithi_or_date: scheduleForm.tithi_or_date.trim(),
              time: scheduleForm.time.trim(),
              category: scheduleForm.category,
              notes: scheduleForm.notes.trim()
            }
          : s
      );

      onUpdateDB?.((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          puja_schedule: updatedList
        }
      }));

      showToast?.(`নির্ঘণ্টের তথ্য সফলভাবে হালনাগাদ হয়েছে!`);
    }

    setScheduleModal(null);
  };

  const handleDeleteSchedule = () => {
    const targetItem = scheduleModal?.item;
    if (!targetItem) return;

    const currentList = db.settings?.puja_schedule || [];
    const updatedList = currentList.filter((s) => s.id !== targetItem.id);

    onUpdateDB?.((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        puja_schedule: updatedList
      }
    }));

    showToast?.(`'${targetItem.title}' নির্ঘণ্ট থেকে মুছে ফেলা হয়েছে!`);
    setScheduleModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-bengali">
      {/* Hero Banner with Divine Maa Shyama Image */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#4A0E17] via-[#800020] to-[#2B040B] text-white shadow-2xl relative overflow-hidden border-2 border-amber-300">
        <div className="absolute top-2 left-4 text-6xl opacity-10 select-none">🪔</div>
        <div className="absolute bottom-2 right-4 text-6xl opacity-10 select-none">🪔</div>
        
        {/* Maa Shyama Divine Center Portrait */}
        <div className="relative inline-block mb-4">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-200 opacity-70 blur-md animate-pulse"></div>
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] mx-auto">
            <img
              src={MAA_SHYAMA_IMG}
              alt="মা শ্যামা"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs sm:text-sm font-extrabold mb-3 border border-amber-300/40">
            🌸 ।। শ্রী শ্রী শ্যামা পূজায় নমঃ ।। 🌸
          </span>
          <h1 className="text-2xl sm:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-sm">
            {db.settings?.club_name || 'প্রগতি সংঘ'}
          </h1>
          <p className="text-base sm:text-xl font-bold text-amber-200/90 mt-2">
            {db.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
          </p>
          <p className="text-xs sm:text-sm text-stone-200 mt-2 max-w-xl mx-auto leading-relaxed">
            পাড়া ও ক্লাবের সকল নাগরিক ও ভক্তবৃন্দকে শ্রী শ্রী শ্যামা পূজার আন্তরিক প্রীতি ও শুভেচ্ছা।
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 no-print">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Printer size={16} />
              <span>পূজার নির্ঘণ্ট প্রিন্ট করুন</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>সম্পূর্ণ পেজ প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Puja Schedule Cards - 100% User Editable */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBB6] pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17] flex items-center gap-2">
              <Calendar className="text-amber-700" size={24} />
              <span>পূজার নির্ঘণ্ট ও সময়সূচি</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              মা শ্যামার পূজা, পুষ্পাঞ্জলি, আরতি ও মহাপ্রসাদ বিতরণের পূর্ণাঙ্গ সময়সূচি
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto no-print">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-800 border border-[#EADBB6] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
              title="পূজার নির্ঘণ্টের আনুষ্ঠানিক নোটিশ প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
            >
              <Printer size={16} className="text-[#800020]" />
              <span>নির্ঘণ্ট প্রিন্ট করুন</span>
            </button>
            <button
              onClick={handleOpenAddSchedule}
              className="px-4 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>নির্ঘণ্ট যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Dynamic Schedule List */}
        {scheduleList.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#FFFDF7] border-2 border-dashed border-amber-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl">
              🪔
            </div>
            <h3 className="font-bold text-stone-800 text-base">
              পূজার কোনো নির্ঘণ্ট এখনও ইনপুট দেওয়া হয়নি
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              পূজার নির্দিষ্ট তারিখ, সময়, আরতি বা পুষ্পাঞ্জলির সময়সূচি আপনি নিজেই নির্ধারণ করে যুক্ত করতে পারেন।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 no-print">
              <button
                onClick={handleOpenAddSchedule}
                className="px-5 py-2.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-xl text-xs sm:text-sm font-bold shadow-md transition inline-flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>প্রথম পূজার নির্ঘণ্ট ইনপুট দিন</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduleList.map((item) => {
              const style = getCategoryStyle(item.category);
              const IconComp = style.icon;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border ${style.border} ${style.bg} shadow-xs relative flex flex-col justify-between group transition hover:shadow-md print-avoid-break`}
                >
                  <div>
                    {/* Top Row: Category & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${style.text} bg-white/80 border border-stone-200/60 shadow-2xs`}>
                        <IconComp size={13} />
                        <span>{item.category || 'পূজার আচার'}</span>
                      </span>

                      {/* Edit & Delete Action Buttons (Hidden on Print) */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition no-print">
                        <button
                          onClick={() => handleOpenEditSchedule(item)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white/80 rounded-lg transition"
                          title="নির্ঘণ্ট সম্পাদনা করুন"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setScheduleModal({ type: 'delete', item })}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="নির্ঘণ্ট মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-extrabold text-[#4A0E17] leading-snug">
                      {item.title}
                    </h3>

                    {/* Date/Tithi & Time */}
                    <div className="mt-2 space-y-1">
                      {item.tithi_or_date && (
                        <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                          <Calendar size={13} className="text-stone-400 shrink-0" />
                          <span>{item.tithi_or_date}</span>
                        </div>
                      )}
                      {item.time && (
                        <div className="text-xs sm:text-sm font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-700 shrink-0" />
                          <span>{item.time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Instructions */}
                  {item.notes && (
                    <p className="text-xs text-stone-600 mt-3 pt-2.5 border-t border-stone-200/60 leading-relaxed italic">
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Citizen Receipt Verification Tool */}
      <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-md space-y-4">
        <div className="flex items-center gap-2 text-[#4A0E17]">
          <Receipt size={22} />
          <div>
            <h3 className="font-bold text-base sm:text-lg">ডিজিটাল চাঁদা রসিদ যাচাই ও অনুসন্ধান</h3>
            <p className="text-xs text-stone-500">আপনার নাম বা বাড়ি নম্বর লিখে চাঁদা জমার স্ট্যাটাস দেখুন</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="আপনার নাম বা বাড়ি নম্বর লিখুন (যেমন: ১২/এ)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {search.trim() ? (
          <div className="space-y-3 pt-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-4">
                কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক বানান লিখুন অথবা কমিটির সাথে যোগাযোগ করুন।
              </p>
            ) : (
              searchResults.map((m) => {
                const recentPay = (db.payments || []).find(p => p.member_id === m.id || p.member_name === m.name);
                return (
                  <div key={m.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-stone-900 text-base">{m.name}</div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        বাড়ি: <span className="font-semibold text-stone-800">{m.address || '-'}</span> | ধরন: {m.member_type}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-medium text-stone-700">জমা: <b className="text-emerald-700">{formatTaka(m.collected_amount, true)}</b></span>
                        <span className="font-medium text-stone-700">বাকি: <b className="text-rose-700">{formatTaka(Math.max(0, m.target_amount - m.collected_amount), true)}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.status === 'জমা হয়েছে' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>

                      {recentPay && (
                        <button
                          onClick={() => onOpenReceipt(recentPay, m)}
                          className="px-3 py-1.5 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                        >
                          <Printer size={13} />
                          <span>রশিদ দেখুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          members.length === 0 && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-stone-600 flex items-center gap-2">
              <Info size={16} className="text-amber-700 shrink-0" />
              <span>নতুন বছরের চাঁদা সংগ্রহ তালিকা প্রণয়ন চলছে। শীঘ্রই নাগরিক তালিকা অনলাইনে হালনাগাদ হবে।</span>
            </div>
          )
        )}
      </div>

      {/* Donors & Sponsors Roll of Honor */}
      {sponsors.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-purple-900 border-b border-[#EADBB6] pb-3">
            <Heart size={20} className="text-rose-600 fill-rose-600" />
            <h3 className="font-bold text-base sm:text-lg text-[#4A0E17]">
              কৃতজ্ঞতা স্বীকার ও প্রধান পৃষ্ঠপোষকবৃন্দ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sponsors.map((s) => (
              <div key={s.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block text-sm">{s.sponsor_name}</span>
                  <span className="text-xs text-stone-500">{s.banner_type}</span>
                </div>
                <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full">
                  সহযোগী পৃষ্ঠপোষক
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Contact */}
      <div className="p-4 rounded-xl bg-stone-100 text-center text-xs text-stone-600">
        <p className="font-semibold text-stone-800">প্রগতি সংঘ পূজা পরিচালন সমিতি</p>
        <p className="mt-0.5">যে কোনো প্রয়োজনে যোগাযোগ করুন: সম্পাদক বা কোষাধ্যক্ষ</p>
      </div>

      {/* Add / Edit Puja Schedule Modal */}
      {(scheduleModal?.type === 'add' || scheduleModal?.type === 'edit') && (
        <Modal
          title={scheduleModal.type === 'add' ? 'পূজার নতুন নির্ঘণ্ট ও সময়সূচি নির্ধারণ' : 'পূজার নির্ঘণ্ট সম্পাদনা'}
          onClose={() => setScheduleModal(null)}
        >
          <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                পূজার পর্ব বা রীতির নাম *
              </label>
              <input
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="যেমন: নিশিপূজা ও মহাযজ্ঞ, পুষ্পাঞ্জলি প্রদান, ইত্যাদি"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-semibold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  তারিখ বা তিথি
                </label>
                <input
                  type="text"
                  value={scheduleForm.tithi_or_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, tithi_or_date: e.target.value })}
                  placeholder="যেমন: অমাবস্যা তিথি বা ৩১শে কার্তিক"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  সময় *
                </label>
                <input
                  type="text"
                  required
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  placeholder="যেমন: রাত্রি ১১:৩০ বা দুপুর ১:০০"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] font-bold text-amber-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                ক্যাটাগরি বা ধরন
              </label>
              <select
                value={scheduleForm.category}
                onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-medium"
              >
                <option value="পুজো ও আরতি">🪔 পুজো ও আরতি</option>
                <option value="পুষ্পাঞ্জলি">🌸 পুষ্পাঞ্জলি</option>
                <option value="মহাপ্রসাদ ও ভোগ">🍲 মহাপ্রসাদ ও ভোগ</option>
                <option value="শোভাযাত্রা ও বিসর্জন">🎺 শোভাযাত্রা ও বিসর্জন</option>
                <option value="সাংস্কৃতিক অনুষ্ঠান">🎭 সাংস্কৃতিক অনুষ্ঠান</option>
                <option value="অন্যান্য">📅 অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                বিশেষ নির্দেশিকা বা বিবরণ (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                placeholder="যেমন: পুষ্পাঞ্জলির ফুল ও বেলপাতা ক্লাব প্রাঙ্গণ থেকে দেওয়া হবে..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setScheduleModal(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 font-bold rounded-xl shadow-md"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {scheduleModal?.type === 'delete' && (
        <Modal title="নির্ঘণ্ট মুছে ফেলার নিশ্চিতকরণ" onClose={() => setScheduleModal(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#800020]">{scheduleModal.item.title}</span>-এর নির্ঘণ্টটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setScheduleModal(null)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteSchedule}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Print Modal */}
      {showPrintModal && (
        <SchedulePrintModal
          schedule={scheduleList}
          clubName={db.settings?.club_name}
          eventName={db.settings?.event_name}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
