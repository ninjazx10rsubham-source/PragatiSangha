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
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';
import { initialDatabase } from '../services/dataService';

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

  const handleResetData = () => {
    onUpdateDB(initialDatabase);
    showToast('ডিফল্ট ডেটা রিস্টোর করা হয়েছে');
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

      {/* Cloud Status Card */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isCloudConnected 
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' 
          : 'bg-amber-50/70 border-amber-300 text-amber-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isCloudConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>{isCloudConnected ? 'Supabase ক্লাউড ডাটাবেস সংযুক্ত' : 'অফলাইন মোড (লোকাল স্টোরেজ)'}</span>
              {isCloudConnected && <CheckCircle2 size={16} className="text-emerald-600" />}
            </h3>
            <p className="text-xs mt-0.5 opacity-90">
              {isCloudConnected
                ? 'রিয়েলটাইম ক্লাউড সিঙ্ক সক্রিয় রয়েছে। একাধিক ফোন থেকে একযোগে কাজ করা যাবে।'
                : 'বর্তমানে সমস্ত ডেটা এই ব্রাউজারে সেভ রয়েছে। ক্লাউড ব্যাকআপের জন্য Supabase কানেক্ট করুন।'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCloudSettings}
          className="px-4 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-amber-300 text-xs font-bold rounded-xl transition shadow-md shrink-0"
        >
          ক্লাউড সেটিংস পরিবর্তন
        </button>
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

      {/* Backup & Restore */}
      <div className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EADBB6] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A0E17] text-base border-b border-[#EADBB6] pb-2">
          ৪. ডাটাবেস ব্যাকআপ ও রিস্টোর (JSON)
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
    </div>
  );
}
