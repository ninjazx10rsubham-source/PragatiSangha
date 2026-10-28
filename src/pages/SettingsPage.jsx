import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Cloud, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Edit3,
  Printer
} from 'lucide-react';
import Modal from '../components/Modal';
import SchedulePrintModal from '../components/SchedulePrintModal';
import { initialDatabase, resetAllDataToEmpty } from '../services/dataService';

export default function SettingsPage({ 
  db, 
  onUpdateDB, 
  showToast, 
  isCloudConnected, 
  onOpenCloudSettings 
}) {
  const [clubName, setClubName] = useState(db.settings?.club_name || 'প্রগতি সংঘ');
  const [eventName, setEventName] = useState(db.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬');
  
  const [newType, setNewType] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newMarketCat, setNewMarketCat] = useState('');

  const [confirmReset, setConfirmReset] = useState(false);

  const membershipTypes = db.settings?.membership_types || [];
  const expenseCategories = db.settings?.expense_categories || [];
  const marketCategories = db.settings?.market_categories || [];
  const pujaSchedule = db.settings?.puja_schedule || [];

  const [scheduleModal, setScheduleModal] = useState(null); // { type: 'add' | 'edit' | 'delete', item }
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    tithi_or_date: '',
    time: '',
    category: 'পুজো ও আরতি',
    notes: ''
  });

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
      showToast('পূজার পর্বের নাম আবশ্যক', 'error');
      return;
    }

    if (scheduleModal.type === 'add') {
      const newItem = {
        id: 'sch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title: scheduleForm.title.trim(),
        tithi_or_date: scheduleForm.tithi_or_date.trim(),
        time: scheduleForm.time.trim(),
        category: scheduleForm.category,
        notes: scheduleForm.notes.trim()
      };
      onUpdateDB((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          puja_schedule: [...(prev.settings?.puja_schedule || []), newItem]
        }
      }));
      showToast(`'${newItem.title}' পূজার নির্ঘণ্টে যুক্ত হয়েছে!`);
    } else if (scheduleModal.type === 'edit') {
      onUpdateDB((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          puja_schedule: (prev.settings?.puja_schedule || []).map((s) =>
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
          )
        }
      }));
      showToast('নির্ঘণ্টের তথ্য সফলভাবে হালনাগাদ হয়েছে!');
    }
    setScheduleModal(null);
  };

  const handleDeleteSchedule = () => {
    if (!scheduleModal?.item) return;
    onUpdateDB((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        puja_schedule: (prev.settings?.puja_schedule || []).filter(
          (s) => s.id !== scheduleModal.item.id
        )
      }
    }));
    showToast(`'${scheduleModal.item.title}' নির্ঘণ্ট থেকে মুছে ফেলা হয়েছে!`);
    setScheduleModal(null);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    onUpdateDB((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        club_name: clubName.trim(),
        event_name: eventName.trim()
      }
    }));
    showToast('ক্লাব ও পূজার নাম সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleAddMembershipType = (e) => {
    e.preventDefault();
    if (!newType.trim()) return;
    const name = newType.trim();
    if (membershipTypes.some(t => t.name === name)) {
      showToast('এই সদস্যপদের ধরন ইতিমধ্যে বিদ্যমান', 'error');
      return;
    }
    const updated = [...membershipTypes, { id: 'm_' + Date.now(), name, amount: 0 }];
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), membership_types: updated }
    }));
    setNewType('');
    showToast('সদস্যপদের নতুন ধরন যুক্ত হয়েছে');
  };

  const handleDeleteMembershipType = (id) => {
    const updated = membershipTypes.filter(t => t.id !== id);
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), membership_types: updated }
    }));
    showToast('সদস্যপদের ধরন মুছে ফেলা হয়েছে');
  };

  const handleAddExpenseCategory = (e) => {
    e.preventDefault();
    if (!newExpenseCat.trim()) return;
    const name = newExpenseCat.trim();
    if (expenseCategories.includes(name)) {
      showToast('এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান', 'error');
      return;
    }
    const updated = [...expenseCategories, name];
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), expense_categories: updated }
    }));
    setNewExpenseCat('');
    showToast('নতুন খরচের ক্যাটাগরি যুক্ত হয়েছে');
  };

  const handleDeleteExpenseCategory = (cat) => {
    const updated = expenseCategories.filter(c => c !== cat);
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), expense_categories: updated }
    }));
    showToast('ক্যাটাগরি মুছে ফেলা হয়েছে');
  };

  const handleAddMarketCategory = (e) => {
    e.preventDefault();
    if (!newMarketCat.trim()) return;
    const name = newMarketCat.trim();
    if (marketCategories.includes(name)) {
      showToast('এই বিভাগ ইতিমধ্যে বিদ্যমান', 'error');
      return;
    }
    const updated = [...marketCategories, name];
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), market_categories: updated }
    }));
    setNewMarketCat('');
    showToast('নতুন বাজার বিভাগ যুক্ত হয়েছে');
  };

  const handleDeleteMarketCategory = (cat) => {
    const updated = marketCategories.filter(c => c !== cat);
    onUpdateDB((prev) => ({
      ...prev,
      settings: { ...(prev.settings || {}), market_categories: updated }
    }));
    showToast('বাজার বিভাগ মুছে ফেলা হয়েছে');
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `প্রগতি_সংঘ_সম্পূর্ণ_ব্যাকআপ_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    showToast('সম্পূর্ণ ডাটাবেস ব্যাকআপ ডাউনলোড হয়েছে');
  };

  // Import JSON Backup
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && typeof parsed === 'object') {
          onUpdateDB(parsed);
          showToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!');
        } else {
          showToast('অবৈধ ব্যাকআপ ফাইল', 'error');
        }
      } catch (err) {
        showToast('ফাইল পড়তে ব্যর্থ: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = async () => {
    try {
      const emptyDb = await resetAllDataToEmpty();
      onUpdateDB(emptyDb);
      showToast('সম্পূর্ণ ডাটাবেজ সফলভাবে খালি করা হয়েছে! এখন নতুন করে ডাটা ইনপুট দিতে পারেন।');
    } catch (err) {
      onUpdateDB(initialDatabase);
      showToast('ডাটাবেজ রিসেট সম্পন্ন হয়েছে।');
    }
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A0E17]">
          সেটিংস, ক্লাউড কানেকশন ও ব্যাকআপ
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          ক্লাবের তথ্য, সদস্যপদের ধরন, খরচের বিভাগ এবং ডাটাবেস ব্যবস্থাপনা
        </p>
      </div>

      {/* Cloud Status Card - Permanent */}
      <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>Supabase ক্লাউড ডাটাবেস স্থায়ীভাবে সংযুক্ত ও সক্রিয়</span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </h3>
            <p className="text-xs mt-1 text-emerald-800/90 leading-relaxed max-w-2xl">
              সদস্যপদ, পূর্ববর্তী বছরের চাঁদা বৃদ্ধি/হ্রাস, রসিদ, খরচ এবং ভোগ কুপন সংক্রান্ত যাবতীয় তথ্য স্বয়ংক্রিয়ভাবে সরাসরি ক্লাউডে সেভ হচ্ছে।
              ব্রাউজার বন্ধ করলে বা লগআউট করলেও ডাটাবেসের সংযোগ কখনোই বিচ্ছিন্ন হবে না এবং সমস্ত ডেটা সুরক্ষিত থাকবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-2 rounded-xl bg-emerald-200/90 text-emerald-950 font-extrabold text-xs flex items-center gap-2 border border-emerald-300 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>24/7 লাইভ অটো-সিঙ্ক</span>
          </span>
        </div>
      </div>

      {/* General Settings */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A0E17] text-base border-b border-[#EADBB6] pb-2">
          ১. ক্লাব ও ইভেন্টের শিরোনাম
        </h3>
        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-stone-700 font-bold mb-1">ক্লাব / সমিতির নাম</label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">উৎসব বা পূজার নাম</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <Save size={14} />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Membership Types Management */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A0E17] text-base border-b border-[#EADBB6] pb-2">
          ২. সদস্যপদের ধরনসমূহ
        </h3>

        <form onSubmit={handleAddMembershipType} className="flex gap-2">
          <input
            type="text"
            placeholder="নতুন ধরন লিখুন (যেমন: আজীবন সদস্য)..."
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <Plus size={14} />
            <span>যোগ করুন</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {membershipTypes.map((t) => (
            <span
              key={t.id || t.name}
              className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-stone-800 flex items-center gap-2"
            >
              <span>{t.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteMembershipType(t.id)}
                className="text-stone-400 hover:text-rose-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A0E17] text-base border-b border-[#EADBB6] pb-2">
          ৩. পূজার খরচের ক্যাটাগরি
        </h3>

        <form onSubmit={handleAddExpenseCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="নতুন ক্যাটাগরি লিখুন..."
            value={newExpenseCat}
            onChange={(e) => setNewExpenseCat(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <Plus size={14} />
            <span>যোগ করুন</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {expenseCategories.map((c) => (
            <span
              key={c}
              className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2"
            >
              <span>{c}</span>
              <button
                type="button"
                onClick={() => handleDeleteExpenseCategory(c)}
                className="text-stone-400 hover:text-rose-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Puja Schedule Management */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EADBB6] pb-2">
          <div>
            <h3 className="font-bold text-[#4A0E17] text-base">
              ৪. পূজার নির্ঘণ্ট ও সময়সূচি ব্যবস্থাপনা
            </h3>
            <p className="text-xs text-stone-500">
              পাবলিক পোর্টালে প্রদর্শিত পূজার আচার, পুষ্পাঞ্জলি ও ভোগের সময়সূচি
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-800 border border-[#EADBB6] rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
              title="পূজার নির্ঘণ্টের আনুষ্ঠানিক নোটিশ প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
            >
              <Printer size={14} className="text-[#800020]" />
              <span>নির্ঘণ্ট প্রিন্ট</span>
            </button>
            <button
              onClick={handleOpenAddSchedule}
              className="px-3.5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <Plus size={14} />
              <span>নতুন নির্ঘণ্ট</span>
            </button>
          </div>
        </div>

        {pujaSchedule.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
            এখনও কোনো নির্ঘণ্ট যুক্ত করা হয়নি। "নতুন নির্ঘণ্ট" বাটনে ক্লিক করে যোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pujaSchedule.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-[#EADBB6] shadow-xs flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-[#4A0E17] text-sm block">{item.title}</span>
                  <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                    {item.tithi_or_date && <span>{item.tithi_or_date}</span>}
                    {item.time && <span className="font-bold text-amber-900">• {item.time}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditSchedule(item)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                    title="সম্পাদনা করুন"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setScheduleModal({ type: 'delete', item })}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A0E17] text-base border-b border-[#EADBB6] pb-2">
          ৫. ডাটাবেস ব্যাকআপ ও রিস্টোর (JSON)
        </h3>
        <p className="text-xs text-stone-600">
          আপনার কম্পিউটারে অফলাইন ব্যাকআপ ফাইল সংরক্ষণ করুন অথবা পূর্বের ব্যাকআপ ফাইল আপলোড করে ডেটা পুনরুদ্ধার করুন।
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-800 border border-[#EADBB6] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Download size={15} />
            <span>ব্যাকআপ ডাউনলোড করুন (JSON)</span>
          </button>

          <label className="px-4 py-2 bg-[#FFFDF7] hover:bg-[#F2E5C9] text-stone-800 border border-[#EADBB6] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Upload size={15} />
            <span>ব্যাকআপ ফাইল আপলোড</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs ml-auto"
          >
            <RotateCcw size={14} />
            <span>ডিফল্ট ডেটা রিসেট</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <Modal title="ডাটাবেস রিসেট নিশ্চিতকরণ" onClose={() => setConfirmReset(false)}>
          <div className="space-y-4 text-sm">
            <p className="text-stone-700">
              আপনি কি নিশ্চিতভাবে সমস্ত ডেটা রিসেট করে প্রাথমিক ডেমো ডেটায় ফিরে যেতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleResetData}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                হ্যাঁ, রিসেট করুন
              </button>
            </div>
          </div>
        </Modal>
      )}

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
          schedule={pujaSchedule}
          clubName={clubName}
          eventName={eventName}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
