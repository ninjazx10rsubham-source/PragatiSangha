// Utility to parse and format bill_no for a member
// Encoded cleanly inside member.notes as [BILL:xxx] while remaining completely backward and Supabase compatible

export function normalizeSearchDigits(str) {
  if (!str) return '';
  const bnToEnMap = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
  return String(str).replace(/[০-৯]/g, d => bnToEnMap[d] || d);
}

export function getMemberBillNo(member) {
  if (!member) return '';
  if (member.bill_no) return String(member.bill_no).trim();
  const notes = member.notes || '';
  // Check for explicit [BILL:xxx] tag
  const tagMatch = notes.match(/\[BILL:([^\]]+)\]/i);
  if (tagMatch) return tagMatch[1].trim();
  // Check for legacy "বিল নং: xxx" or "বিল: xxx"
  const legacyMatch = notes.match(/বিল(?:\s*নং)?\s*[:=]\s*([A-Za-z0-9\-_/]+)/i);
  if (legacyMatch) return legacyMatch[1].trim();
  return '';
}

export function encodeMemberBillNo(existingNotes, billNo) {
  let cleanNotes = (existingNotes || '').replace(/\[BILL:[^\]]*\]/gi, '').trim();
  const b = (billNo || '').trim();
  if (!b) return cleanNotes;
  return `[BILL:${b}] ${cleanNotes}`.trim();
}

export function matchMemberBillNo(member, query) {
  if (!member || !query) return false;
  const bill = getMemberBillNo(member);
  if (!bill) return false;

  const rawQuery = String(query).trim().toLowerCase();
  const normalizedQuery = normalizeSearchDigits(rawQuery);
  const cleanQuery = normalizedQuery.replace(/^#/, '').trim();
  
  const rawBill = String(bill).trim().toLowerCase();
  const normalizedBill = normalizeSearchDigits(rawBill);
  const cleanBill = normalizedBill.replace(/^#/, '').trim();

  return (
    rawBill === rawQuery ||
    normalizedBill === normalizedQuery ||
    cleanBill === cleanQuery ||
    cleanBill.includes(cleanQuery) ||
    normalizedBill.includes(normalizedQuery) ||
    rawBill.includes(rawQuery)
  );
}
