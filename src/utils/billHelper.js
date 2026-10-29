// Utility to parse and format bill_no for a member
// Encoded cleanly inside member.notes as [BILL:xxx] while remaining completely backward and Supabase compatible

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
