import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { MAA_SHYAMA_IMG } from '../assets/maaShyamaImage';

export default function WelcomeSplash({ onComplete, clubName = 'প্রগতি সংঘ', eventName = 'শ্রী শ্রী শ্যামা পূজা ২০২৬' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar over 2.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 70);

    // Auto complete after 2.8s
    const timer = setTimeout(() => {
      handleClose();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-500 font-bengali ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #35050D 0%, #1A0206 55%, #0B0002 100%)'
      }}
    >
      {/* Decorative ambient background lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none animate-pulse delay-700"></div>

      {/* Skip button top right */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-semibold backdrop-blur-md border border-amber-300/30 transition flex items-center gap-1.5 z-20"
      >
        <span>সরাসরি প্রবেশ</span>
        <X size={14} />
      </button>

      {/* Main Center Modal Content */}
      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center">
        
        {/* Divine Image Container with Multi-layer Glow & Sacred Aura */}
        <div className="relative mb-6 group cursor-pointer" onClick={handleClose}>
          {/* Pulsating Golden/Crimson Aura Rings */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-300 opacity-60 blur-lg animate-pulse"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-200 opacity-80 blur-xs"></div>
          
          {/* Maa Shyama Photo */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.6)]">
            <img
              src={MAA_SHYAMA_IMG}
              alt="মা শ্যামা"
              className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
            />
          </div>

          {/* Sacred Diya badge */}
          <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-500 to-[#800020] text-amber-100 p-2 rounded-full border-2 border-amber-300 shadow-lg text-sm sm:text-base">
            🪔
          </div>
        </div>

        {/* Sacred Invocation Mantra */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/40 text-amber-300 text-xs font-bold tracking-widest uppercase shadow-inner">
            <Sparkles size={13} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>মা শ্যামার চরণে সশ্রদ্ধ প্রণাম</span>
            <Sparkles size={13} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_2px_15px_rgba(251,191,36,0.5)]">
            ॥ শ্রী শ্রী শ্যামা পূজায় নমঃ ॥
          </h1>

          <div className="pt-1">
            <h2 className="text-lg sm:text-xl font-bold text-amber-200">
              {clubName}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium mt-0.5">
              {eventName} • ক্লাউড পূজা পোর্টাল
            </p>
          </div>

          <p className="text-xs text-stone-400 max-w-xs mx-auto italic pt-1">
            "শুভ শ্যামা পূজা ও দীপাবলির আন্তরিক প্রীতি, শুভেচ্ছা ও অভিনন্দন"
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden mb-5 border border-amber-400/20">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-75 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleClose}
          className="group px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#35050D] font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(251,191,36,0.6)] transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>ওয়েবসাইটে প্রবেশ করুন</span>
          <ArrowRight size={17} className="group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
}
