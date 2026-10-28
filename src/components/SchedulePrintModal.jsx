import React, { useEffect } from 'react';
import { Printer, X, Calendar, Clock, Flame } from 'lucide-react';
import { toBnDigits } from '../utils/formatters';
import { MAA_SHYAMA_IMG } from '../assets/maaShyamaImage';

export default function SchedulePrintModal({ 
  schedule = [], 
  clubName = 'প্রগতি সংঘ', 
  eventName = 'শ্রী শ্রী শ্যামা পূজা ২০২৬', 
  onClose 
}) {
  useEffect(() => {
    document.body.classList.add('schedule-printing-active');
    return () => {
      document.body.classList.remove('schedule-printing-active');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white schedule-print-container">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-amber-200 overflow-hidden my-auto print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:my-0">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-[#4A0E17] text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm sm:text-base">পূজার নির্ঘণ্ট ও সময়সূচি (প্রিন্ট প্রিভিউ)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              <Printer size={16} />
              <span>এখনই প্রিন্ট করুন / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="বন্ধ করুন"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Notice Paper Sheet */}
        <div className="p-6 sm:p-10 bg-[#FFFDF7] text-[#2D1810] print:p-6 print:m-0 print:bg-white">
          {/* Decorative Ornate Border */}
          <div className="border-2 border-double border-[#800020] p-6 sm:p-8 rounded-2xl relative bg-white print:border-2 print:border-[#800020]">
            
            {/* Corner Decorative Motifs */}
            <div className="absolute top-2 left-2 text-[#800020] text-sm select-none">❖</div>
            <div className="absolute top-2 right-2 text-[#800020] text-sm select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-[#800020] text-sm select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-[#800020] text-sm select-none">❖</div>

            {/* Letterhead & Sacred Invocation */}
            <div className="text-center border-b-2 border-[#800020]/30 pb-4 mb-5">
              <div className="text-xs sm:text-sm font-bold tracking-widest text-[#800020] mb-2">
                ॥ শ্রী শ্রী শ্যামা পূজায় নমঃ ॥
              </div>

              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm shrink-0">
                  <img
                    src={MAA_SHYAMA_IMG}
                    alt="মা শ্যামা"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#4A0E17] tracking-wide">
                    {clubName || 'প্রগতি সংঘ'}
                  </h1>
                  <p className="text-sm sm:text-base font-bold text-amber-900 mt-0.5">
                    {eventName || 'শ্রী শ্রী শ্যামা পূজা ২০২৬'}
                  </p>
                  <p className="text-xs text-stone-500">
                    ক্লাব প্রাঙ্গণ ও মন্দির কমপ্লেক্স • স্থাপিত: ১৯৭৫
                  </p>
                </div>
              </div>

              <div className="inline-block px-4 py-1 bg-amber-100/90 border border-amber-300 rounded-full text-xs sm:text-sm font-bold text-[#4A0E17] mt-1 shadow-2xs">
                পূজার নির্ঘণ্ট ও আনুষ্ঠানিক সময়সূচি
              </div>
            </div>

            {/* Schedule Table */}
            {schedule.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-sm">
                বর্তমানে কোনো নির্ঘণ্ট যুক্ত করা নেই।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#800020] bg-amber-50/70 text-[#4A0E17]">
                      <th className="py-2.5 px-3 font-bold w-12 text-center">ক্র:</th>
                      <th className="py-2.5 px-3 font-bold">পূজার পর্ব বা আচার</th>
                      <th className="py-2.5 px-3 font-bold">তিথি ও দিন</th>
                      <th className="py-2.5 px-3 font-bold">সময়সূচি</th>
                      <th className="py-2.5 px-3 font-bold">ধরন</th>
                      <th className="py-2.5 px-3 font-bold">বিশেষ জ্ঞাতব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {schedule.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/30">
                        <td className="py-2.5 px-3 text-center font-bold text-stone-700">
                          {toBnDigits(idx + 1)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#4A0E17]">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-3 text-stone-700">
                          {item.tithi_or_date || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-950">
                          {item.time || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                            {item.category || 'পূজার আচার'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-stone-600 italic">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sacred Invitation Message */}
            <div className="mt-6 pt-3 border-t border-dashed border-stone-300 text-center text-xs sm:text-sm text-stone-700">
              <p className="font-semibold text-[#800020]">
                মা শ্যামার পূজার পবিত্র পুষ্পাঞ্জলি গ্রহণ ও মহাপ্রসাদ বিতরণে ক্লাবের সকল সদস্য ও পাড়ার সকল ধর্মপ্রাণ নাগরিকবৃন্দকে সপরিবারে উপস্থিত থাকার জন্য সাদর আমন্ত্রণ জানানো হচ্ছে।
              </p>
            </div>

            {/* Official Signatures */}
            <div className="mt-12 pt-6 border-t border-stone-400 grid grid-cols-3 gap-4 text-center text-xs text-stone-700">
              <div>
                <div className="w-24 sm:w-28 border-b border-stone-700 mx-auto mb-1"></div>
                <p className="font-bold text-stone-900">সভাপতি</p>
                <p className="text-[11px] text-stone-500">প্রগতি সংঘ</p>
              </div>
              <div>
                <div className="w-24 sm:w-28 border-b border-stone-700 mx-auto mb-1"></div>
                <p className="font-bold text-stone-900">সাধারণ সম্পাদক</p>
                <p className="text-[11px] text-stone-500">পূজা পরিচালন সমিতি</p>
              </div>
              <div>
                <div className="w-24 sm:w-28 border-b border-stone-700 mx-auto mb-1"></div>
                <p className="font-bold text-stone-900">পূজা আহ্বায়ক / কোষাধ্যক্ষ</p>
                <p className="text-[11px] text-stone-500">অর্থ ও পূজা পরিচালনা</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
