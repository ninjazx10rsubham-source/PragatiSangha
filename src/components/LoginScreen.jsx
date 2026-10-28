import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Globe, Database, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin, onOpenPublic, clubName, eventName, storedPin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const input = password.trim();
    const correctPin = String(storedPin || '1234').trim();

    // Accept 'pragati', '1234', or the customized admin PIN
    if (input === 'pragati' || input === '1234' || input === correctPin) {
      onLogin();
    } else {
      setError('পাসওয়ার্ড বা পিন সঠিক নয়। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#2D0A10] via-[#4A0E17] to-[#1E050A] px-4 py-8">
      {/* Decorative background glow */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#800020]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/50 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl mx-auto">
              <img src="/maa_shyama.jpg" alt="মা শ্যামা" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs font-extrabold text-amber-800 tracking-wider">
              🌸 ॥ শ্রী শ্রী শ্যামা পূজায় নমঃ ॥ 🌸
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#4A0E17] tracking-tight">
              {clubName || 'প্রগতি সংঘ'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/70 inline-block px-3 py-1 rounded-full border border-amber-200">
              {eventName || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
            </p>
            <p className="text-xs text-stone-500 font-medium pt-1">
              অ্যাডমিন পোর্টাল ও চাঁদা ব্যবস্থাপনা লগইন
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                অ্যাডমিন পাসওয়ার্ড বা পিন
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="পাসওয়ার্ড দিন (যেমন: pragati বা 1234)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white text-sm font-medium"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#800020] to-[#4A0E17] hover:from-[#6b1421] hover:to-[#360910] text-amber-300 font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <span>লগইন করুন</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Public View Button */}
          {onOpenPublic && (
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onOpenPublic}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-[#4A0E17] border border-amber-300 font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs"
              >
                <Globe size={15} />
                <span>সর্বজনীন চাঁদার খাতা ও হিসাব দেখুন (পাবলিক ভিউ)</span>
              </button>
            </div>
          )}

          {/* Permanent Supabase Live Banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database size={13} className="text-emerald-600" />
              <span>Supabase ক্লাউড ডাটাবেস 24/7 সংযুক্ত</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              লগআউট বা পেজ রিলোড করলেও সমস্ত তথ্য স্থায়ীভাবে ক্লাউডে সেভ থাকে।
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-amber-200/60 mt-4">
          প্রগতি সংঘ পূজা কমিটি • সুরক্ষিত ক্লাউড এডিশন ২.০
        </p>
      </div>
    </div>
  );
}
