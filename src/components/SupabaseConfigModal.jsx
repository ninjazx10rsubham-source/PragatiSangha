import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, UploadCloud, Copy, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../services/supabase';
import { pushLocalToSupabase } from '../services/dataService';

export default function SupabaseConfigModal({ onClose, onConfigSaved, localDb, showToast }) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [key, setKey] = useState(currentCreds.key);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTest = async () => {
    if (!url || !key) {
      setTestResult({ success: false, message: 'URL এবং Anon Key দুটোই প্রদান করুন' });
      return;
    }
    setLoading(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, key);
    setLoading(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveSupabaseCredentials(url, key);
    showToast('Supabase কনফিগারেশন সংরক্ষিত হয়েছে!');
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleSyncToCloud = async () => {
    if (!url || !key) {
      showToast('প্রথমে URL ও Key সংরক্ষণ করুন', 'error');
      return;
    }
    setSyncing(true);
    try {
      saveSupabaseCredentials(url, key);
      await pushLocalToSupabase(localDb);
      showToast('লোকাল ডেটা Supabase ক্লাউডে সফলভাবে আপলোড হয়েছে!');
      if (onConfigSaved) onConfigSaved();
    } catch (err) {
      showToast('ক্লাউড সিঙ্ক ব্যর্থ: ' + err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Modal title="Supabase ক্লাউড ডাটাবেস সেটিংস" onClose={onClose} wide>
      <div className="space-y-5 text-sm">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-stone-800 leading-relaxed">
          <p className="font-semibold text-[#4A0E17] flex items-center gap-1.5 mb-1">
            <Database size={16} />
            ক্লাউড সিঙ্ক কীভাবে কাজ করে?
          </p>
          <p className="text-xs text-stone-600">
            Supabase যুক্ত করলে ক্লাবের সম্পাদক, ক্যাশিয়ার এবং চাঁদা আদায়কারী যে কোনো ফোন বা কম্পিউটার থেকে রিয়েলটাইমে একযোগে কাজ করতে পারবেন। ডেটা আর ব্রাউজার ক্যাশে হারিয়ে যাওয়ার ভয় থাকবে না।
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white font-mono text-xs"
            />
          </div>
        </div>

        {/* Test Result Indicator */}
        {testResult && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <RefreshCw size={14} className="animate-spin" />}
              কানেকশন টেস্ট করুন
            </button>

            <button
              onClick={handleSyncToCloud}
              disabled={syncing}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow"
            >
              <UploadCloud size={15} />
              {syncing ? 'আপলোড হচ্ছে...' : 'লোকাল ডেটা আপলোড করুন'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 transition"
            >
              বাতিল
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#4A0E17] hover:bg-[#6b1421] text-white rounded-xl text-xs font-bold transition shadow"
            >
              সেভ ও কানেক্ট করুন
            </button>
          </div>
        </div>

        {/* SQL Schema Notice */}
        <div className="pt-3 border-t border-dashed border-stone-200">
          <p className="text-xs text-stone-500">
            💡 নতুন Supabase প্রজেক্ট তৈরি করার পর আপনার প্রজেক্টের <code className="bg-stone-100 px-1 py-0.5 rounded text-[#800020]">supabase/schema.sql</code> ফাইলের সব কোড কপি করে Supabase SQL Editor-এ একবার রান করে দিন।
          </p>
        </div>
      </div>
    </Modal>
  );
}
