export const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Convert digits to Bengali only when forceBn is true (used in Public Portal View)
export function toBnDigits(num, forceBn = false) {
  if (num === null || num === undefined) return '';
  if (!forceBn) return String(num); // Keep clean English numbers everywhere across admin/dashboard/tables
  return String(num).replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d, 10)]);
}

export function formatTaka(amount, forceBn = false) {
  const n = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(n));
  if (forceBn) {
    return '₹' + String(formatted).replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d, 10)]);
  }
  return '₹' + formatted; // English numbers format, e.g. ₹201, ₹1,200
}

export function formatBnDate(dateStr, forceBn = false) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    if (forceBn) {
      return `${toBnDigits(day, true)} ${month}, ${toBnDigits(year, true)}`;
    }
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

// Bengali words converter for Chanda Receipt
const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
const tens = ['', '', 'কুড়ি', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

export function numberToBengaliWords(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'শূন্য টাকা মাত্র';

  function convertChunk(val) {
    if (val === 0) return '';
    let str = '';
    if (Math.floor(val / 100) > 0) {
      const h = Math.floor(val / 100);
      str += (h === 1 ? 'একশত ' : h === 2 ? 'দুইশত ' : ones[h] + 'শত ');
      val %= 100;
    }
    if (val > 0) {
      if (val < 20) {
        str += ones[val] + ' ';
      } else {
        const t = Math.floor(val / 10);
        const o = val % 10;
        str += tens[t] + (o > 0 ? ' ' + ones[o] : '') + ' ';
      }
    }
    return str;
  }

  let crore = Math.floor(n / 10000000);
  let lakh = Math.floor((n % 10000000) / 100000);
  let thousand = Math.floor((n % 100000) / 1000);
  let remainder = n % 1000;

  let words = '';
  if (crore > 0) words += convertChunk(crore) + 'কোটি ';
  if (lakh > 0) words += convertChunk(lakh) + 'লক্ষ ';
  if (thousand > 0) words += convertChunk(thousand) + 'হাজার ';
  if (remainder > 0) words += convertChunk(remainder);

  return words.trim() + ' টাকা মাত্র';
}
