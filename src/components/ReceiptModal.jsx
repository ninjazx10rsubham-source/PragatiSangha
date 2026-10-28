import React, { useEffect } from 'react';
import { Printer, Share2, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatTaka, toBnDigits, formatBnDate, numberToBengaliWords } from '../utils/formatters';
import { getWhatsAppReceiptUrl } from '../services/exportService';

export default function ReceiptModal({ receipt, member, onClose }) {
  if (!receipt) return null;

  useEffect(() => {
    document.body.classList.add('receipt-printing-active');
    return () => {
      document.body.classList.remove('receipt-printing-active');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = member?.phone ? getWhatsAppReceiptUrl(member.phone, receipt) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white receipt-print-container">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-amber-200 overflow-hidden transform transition-all print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-[#4A0E17] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm sm:text-base">চাঁদার ডিজিটাল রশিদ</span>
          </div>
          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow"
              >
                <Share2 size={15} />
                <span>WhatsApp-এ পাঠান</span>
              </a>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs sm:text-sm font-bold transition shadow"
            >
              <Printer size={15} />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Traditional Receipt Paper */}
        <div className="p-6 sm:p-8 bg-[#FFFDF7] print:p-6 print:m-0 print:border-none print:shadow-none text-[#2D1810]">
          {/* Decorative Border Frame */}
          <div className="border-2 border-double border-[#800020] p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#FFFDF9] to-[#FDF8EA] relative">
            
            {/* Corner Decorative Dots */}
            <div className="absolute top-2 left-2 text-[#800020] text-xs">❖</div>
            <div className="absolute top-2 right-2 text-[#800020] text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-[#800020] text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-[#800020] text-xs">❖</div>

            {/* Header */}
            <div className="text-center border-b-2 border-[#800020]/20 pb-4 mb-4">
              <div className="text-xs font-semibold tracking-widest text-[#800020] mb-1">
                ।। ওঁ শ্রী শ্রী শ্যামা পূজায়ৈ নমঃ ।।
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A0E17] tracking-wide">
                প্রগতি সংঘ
              </h2>
              <p className="text-sm font-bold text-amber-900 mt-0.5">
                শ্রী শ্রী শ্যামা পূজা ২০২৬
              </p>
              <p className="text-xs text-stone-600 mt-1">
                ক্লাব প্রাঙ্গণ ও মন্দির কমপ্লেক্স • স্থাপিত: ১৯৭৫
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-dashed border-stone-300 pb-3 mb-4 font-medium text-stone-700">
              <div>
                রসিদ নং: <span className="font-bold text-[#800020] bg-amber-100 px-2 py-0.5 rounded font-mono">{receipt.receipt_no}</span>
              </div>
              <div>
                তারিখ: <span className="font-semibold text-stone-900">{formatBnDate(receipt.payment_date)}</span>
              </div>
            </div>

            {/* Body of the Receipt */}
            <div className="space-y-3.5 text-sm sm:text-base leading-relaxed">
              <div className="flex items-baseline border-b border-dotted border-stone-400 pb-1">
                <span className="text-stone-600 shrink-0 w-32">শ্রদ্ধেয় / দাতা:</span>
                <span className="font-bold text-[#4A0E17] flex-1 text-base sm:text-lg">
                  {receipt.member_name}
                </span>
              </div>

              {member?.address && (
                <div className="flex items-baseline border-b border-dotted border-stone-400 pb-1 text-sm">
                  <span className="text-stone-600 shrink-0 w-32">বাড়ি / ঠিকানা:</span>
                  <span className="font-medium text-stone-800 flex-1">{member.address}</span>
                  {member.phone && (
                    <span className="text-xs text-stone-500 ml-2">মোবাইল: {member.phone}</span>
                  )}
                </div>
              )}

              <div className="flex items-baseline border-b border-dotted border-stone-400 pb-1 text-sm">
                <span className="text-stone-600 shrink-0 w-32">বাবদ:</span>
                <span className="text-stone-800 flex-1 font-medium">শ্রী শ্রী শ্যামা পূজা ২০২৬ এর চাঁদা ও অনুদান</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-400 pb-1 text-sm">
                <span className="text-stone-600 shrink-0 w-32">টাকার পরিমাণ (কথায়):</span>
                <span className="font-semibold text-[#800020] flex-1">
                  {numberToBengaliWords(receipt.amount)}
                </span>
              </div>

              {member && Number(member.previous_year_amount) > 0 && (
                <div className="flex items-center justify-between text-xs text-stone-600 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/80">
                  <span>বিগত বছরের চাঁদা: <b className="text-stone-800">{formatTaka(member.previous_year_amount)}</b></span>
                  <span className={`font-bold ${Number(member.target_amount) > Number(member.previous_year_amount) ? 'text-emerald-700' : (Number(member.target_amount) < Number(member.previous_year_amount) ? 'text-rose-700' : 'text-stone-700')}`}>
                    {Number(member.target_amount) > Number(member.previous_year_amount) 
                      ? `+${formatTaka(Number(member.target_amount) - Number(member.previous_year_amount))} বৃদ্ধি পেয়েছে` 
                      : (Number(member.target_amount) < Number(member.previous_year_amount) 
                        ? `-${formatTaka(Number(member.previous_year_amount) - Number(member.target_amount))} হ্রাস` 
                        : 'অপরিবর্তিত রয়েছে')}
                  </span>
                </div>
              )}

              {/* Amount Highlight Box */}
              <div className="my-4 p-3 bg-[#4A0E17] text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-200 block">জমা টাকার পরিমাণ</span>
                  <span className="text-xl sm:text-2xl font-bold tracking-wider text-amber-400">
                    {formatTaka(receipt.amount)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="bg-white/20 px-2.5 py-1 rounded-full font-medium inline-block">
                    মাধ্যম: {receipt.payment_mode || 'নগদ'}
                  </span>
                  {receipt.notes && (
                    <p className="text-stone-300 mt-1 italic text-[11px]">{receipt.notes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Signatures */}
            <div className="mt-8 pt-4 border-t border-stone-300 flex items-end justify-between text-xs sm:text-sm text-stone-600">
              <div className="text-center">
                <div className="w-24 sm:w-28 border-b border-stone-800 mb-1 mx-auto"></div>
                <p>হিসাবরক্ষক</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-dashed border-[#800020] text-[#800020] text-[10px] font-bold p-1 leading-tight transform -rotate-12 bg-amber-50 mb-1">
                  প্রগতি সংঘ<br/>সিলমোহর
                </div>
              </div>

              <div className="text-center">
                <div className="w-28 sm:w-32 border-b border-stone-800 mb-1 mx-auto font-semibold text-stone-900">
                  {receipt.collected_by || 'কোষাধ্যক্ষ'}
                </div>
                <p>আদায়কারী / সম্পাদক</p>
              </div>
            </div>

            {/* Bottom blessings */}
            <div className="mt-4 pt-2 border-t border-dashed border-stone-300 text-center text-[11px] text-amber-900 italic">
              মা শ্যামার আশীর্বাদে সকলের মঙ্গল ও শান্তি কামনা করি।
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
