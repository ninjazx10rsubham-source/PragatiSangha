import * as XLSX from 'xlsx';
import { formatTaka, toBnDigits, formatBnDate } from '../utils/formatters';

export function exportToExcel(data, filename, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportMembersToExcel(members) {
  const formatted = members.map((m, idx) => {
    const prev = Number(m.previous_year_amount) || 0;
    const curr = Number(m.target_amount) || 0;
    const diff = curr - prev;
    let comparison = 'একই রয়েছে';
    if (prev === 0) comparison = 'নতুন সদস্য';
    else if (diff > 0) comparison = `+₹${diff} (বৃদ্ধি)`;
    else if (diff < 0) comparison = `-₹${Math.abs(diff)} (হ্রাস)`;

    return {
      'ক্রমিক': m.sl_no || idx + 1,
      'নাম': m.name,
      'মোবাইল নম্বর': m.phone || '-',
      'বাড়ি / ঠিকানা': m.address || '-',
      'সদস্যপদের ধরন': m.member_type,
      'আগের বছরের চাঁদা (₹)': prev,
      'এই বছরের নির্ধারিত চাঁদা (₹)': curr,
      'পরিবর্তন (বৃদ্ধি/হ্রাস)': comparison,
      'মোট জমা (₹)': m.collected_amount,
      'বাকি (₹)': Math.max(0, curr - (m.collected_amount || 0)),
      'স্ট্যাটাস': m.status,
      'সর্বশেষ জমার তারিখ': m.last_payment_date || '-',
      'মন্তব্য': m.notes || '-'
    };
  });

  exportToExcel(formatted, 'প্রগতি_সংঘ_সদস্য_ও_চাঁদা_তালিকা', 'সদস্য তালিকা');
}

export function exportExpensesToExcel(expenses, marketEntries) {
  const wb = XLSX.utils.book_new();

  const expData = expenses.map((e, idx) => ({
    'ক্রমিক': idx + 1,
    'খাত': e.title,
    'ক্যাটাগরি': e.category,
    'টাকার পরিমাণ (₹)': e.amount,
    'তারিখ': e.expense_date,
    'কে খরচ করলেন': e.paid_by || '-',
    'বিল / ভাউচার': e.bill_no || '-',
    'মন্তব্য': e.notes || '-'
  }));
  const ws1 = XLSX.utils.json_to_sheet(expData);
  XLSX.utils.book_append_sheet(wb, ws1, 'পূজা খরচ');

  const mkData = marketEntries.map((m, idx) => ({
    'ক্রমিক': idx + 1,
    'বাজারের খাত': m.category,
    'দোকানের নাম': m.shop_name || '-',
    'সামগ্রী': m.item_name,
    'পরিমাণ': m.quantity || '-',
    'খরচ (₹)': m.amount,
    'তারিখ': m.entry_date,
    'মন্তব্য': m.notes || '-'
  }));
  const ws2 = XLSX.utils.json_to_sheet(mkData);
  XLSX.utils.book_append_sheet(wb, ws2, 'বাজার খরচ');

  XLSX.writeFile(wb, 'প্রগতি_সংঘ_সম্পূর্ণ_খরচের_হিসাব.xlsx');
}

export function exportSponsorsToExcel(sponsors) {
  const data = sponsors.map((s, idx) => ({
    'ক্রমিক': idx + 1,
    'প্রতিষ্ঠান / দাতার নাম': s.sponsor_name,
    'যোগাযোগ ব্যক্তি': s.contact_person || '-',
    'মোবাইল': s.phone || '-',
    'বিজ্ঞাপনের ধরন': s.banner_type,
    'প্রতিশ্রুত টাকা (₹)': s.promised_amount,
    'জমা টাকা (₹)': s.paid_amount,
    'বাকি (₹)': Math.max(0, s.promised_amount - s.paid_amount),
    'স্ট্যাটাস': s.status,
    'মন্তব্য': s.notes || '-'
  }));
  exportToExcel(data, 'প্রগতি_সংঘ_স্পনসর_ও_বিজ্ঞাপন_তালিকা', 'বিজ্ঞাপন তালিকা');
}

export function exportBhogToExcel(bhogCoupons) {
  const data = bhogCoupons.map((b, idx) => ({
    'বাড়ি নম্বর': b.house_no,
    'পরিবারের প্রধান': b.family_head,
    'মোবাইল নম্বর': b.phone || '-',
    'ভোগ সংখ্যা': b.coupon_count,
    'বিতরণ স্ট্যাটাস': b.status,
    'বিতরণের সময়': b.delivered_time ? new Date(b.delivered_time).toLocaleString('bn-IN') : '-',
    'মন্তব্য': b.notes || '-'
  }));
  exportToExcel(data, 'প্রগতি_সংঘ_ভোগ_বিতরণ_তালিকা', 'ভোগ কুপন');
}

// WhatsApp Receipt link generator
export function getWhatsAppReceiptUrl(phone, receipt) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

  const msg = `*প্রগতি সংঘ শ্রী শ্রী শ্যামা পূজা ২০২৬*
ডিজিটাল চাঁদার রসিদ 🪔

শ্রদ্ধেয়: *${receipt.member_name}*
রসিদ নং: *${receipt.receipt_no}*
জমা চাঁদা: *${formatTaka(receipt.amount)}*
তারিখ: *${formatBnDate(receipt.payment_date)}*
পেমেন্ট মাধ্যম: *${receipt.payment_mode || 'নগদ'}*
আদায়কারী: *${receipt.collected_by || 'কোষাধ্যক্ষ'}*

_মা শ্যামার আশীর্বাদে আপনার ও আপনার পরিবারের মঙ্গল হোক। প্রগতি সংঘের পক্ষ থেকে আপনাকে আন্তরিক ধন্যবাদ।_`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

// WhatsApp Due Reminder link generator
export function getWhatsAppDueReminderUrl(member) {
  if (!member.phone) return null;
  const cleanPhone = member.phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

  const due = Math.max(0, (member.target_amount || 0) - (member.collected_amount || 0));

  const msg = `*প্রগতি সংঘ শ্রী শ্রী শ্যামা পূজা ২০২৬* 🪔

নমস্কার *${member.name}* মহাশয়,
আসন্ন শ্রী শ্রী শ্যামা পূজা উপলক্ষে প্রগতি সংঘের পূজা কমিটির পক্ষ থেকে আন্তরিক প্রীতি ও শুভেচ্ছা।

আপনার বাড়ি নং: *${member.address || '-'}*
নির্ধারিত চাঁদা: *${formatTaka(member.target_amount)}*
জমা হয়েছে: *${formatTaka(member.collected_amount)}*
অবশিষ্ট বাকি চাঁদা: *${formatTaka(due)}*

পূজার প্রস্তুতি সুসম্পন্ন করার লক্ষ্যে যথাসময়ে চাঁদা প্রদান করে পূজা কমিটিকে সহযোগিতা করার জন্য সনির্বন্ধ অনুরোধ জানাচ্ছি।

ধন্যবাদান্তে,
_প্রগতি সংঘ পূজা কমিটি_`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}
