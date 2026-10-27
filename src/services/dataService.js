import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY = 'pragati_sangha_db_v2';
const LEGACY_STORAGE_KEY = 'ppkp_database_v1';

export const defaultMembershipTypes = [
  { id: 'm1', name: 'সক্রিয় সদস্য', amount: 0 },
  { id: 'm2', name: 'পাড়ার নাগরিক বৃন্দ', amount: 0 },
  { id: 'm3', name: 'বিশেষ সদস্য', amount: 0 },
  { id: 'm4', name: 'সহযোগী সদস্য', amount: 0 },
  { id: 'm5', name: 'ক্লাবের সদস্য', amount: 0 },
];

export const defaultMarketCategories = [
  'পুজোর ফুল', 'ফল', 'সবজি', 'মুদিখানা', 'পুজোর সামগ্রী',
  'ভোগের সামগ্রী', 'সাজসজ্জা', 'আলো', 'অন্যান্য', 'জরুরি বাজার'
];

export const defaultExpenseCategories = [
  'প্রতিমা', 'প্যান্ডেল', 'পুজো', 'ভোগ', 'সাজসজ্জা', 'আলো', 'সাউন্ড ও মাইক', 'আপ্যায়ন', 'অন্যান্য'
];

export const defaultPreviousYearMembers = [
  { id: 'prev_1', name: 'শ্রী নিমাই চন্দ্র দাস', phone: '9830012345', address: '১২/এ', member_type: 'সক্রিয় সদস্য', previous_year_amount: 400, notes: 'গত বছর সম্পূর্ণ পরিশোধিত' },
  { id: 'prev_2', name: 'শ্রীমতী রীনা মুখার্জী', phone: '9831198765', address: '৭/বি', member_type: 'পাড়ার নাগরিক বৃন্দ', previous_year_amount: 500, notes: 'গত বছর ৩৫০ জমা ছিল' },
  { id: 'prev_3', name: 'শ্রী তাপস ঘোষ', phone: '9876543210', address: '২৩', member_type: 'সক্রিয় সদস্য', previous_year_amount: 1100, notes: '' },
  { id: 'prev_4', name: 'Subham Dey', phone: '9674218151', address: '75/7/8/1', member_type: 'সক্রিয় সদস্য', previous_year_amount: 500, notes: '' },
  { id: 'prev_5', name: 'Kaushik Dey', phone: '7003238532', address: '75/7/8/1', member_type: 'ক্লাবের সদস্য', previous_year_amount: 450, notes: '' },
  { id: 'prev_6', name: 'শ্রী বরুণ পাল', phone: '9831200001', address: '১৪/১', member_type: 'পাড়ার নাগরিক বৃন্দ', previous_year_amount: 600, notes: '' },
  { id: 'prev_7', name: 'শ্রীমতী সুমিতা সেন', phone: '9831200002', address: '১৮/সি', member_type: 'পাড়ার নাগরিক বৃন্দ', previous_year_amount: 350, notes: '' },
  { id: 'prev_8', name: 'শ্রী অলোক ব্যানার্জী', phone: '9831200003', address: '৫/২', member_type: 'বিশেষ সদস্য', previous_year_amount: 1500, notes: '' },
  { id: 'prev_9', name: 'শ্রী দীপক সরকার', phone: '9831200004', address: '৯/এ', member_type: 'সহযোগী সদস্য', previous_year_amount: 300, notes: '' },
  { id: 'prev_10', name: 'শ্রী শ্যামল পাল', phone: '9831200005', address: '৩১', member_type: 'সক্রিয় সদস্য', previous_year_amount: 500, notes: '' }
];

export const initialDatabase = {
  previousYearMembers: defaultPreviousYearMembers,
  members: [
    { id: 'mem_1', sl_no: 1, name: 'শ্রী নিমাই চন্দ্র দাস', phone: '9830012345', address: '১২/এ', member_type: 'সক্রিয় সদস্য', previous_year_amount: 400, target_amount: 500, collected_amount: 500, status: 'জমা হয়েছে', last_payment_date: '2026-09-01', notes: '' },
    { id: 'mem_2', sl_no: 2, name: 'শ্রীমতী রীনা মুখার্জী', phone: '9831198765', address: '৭/বি', member_type: 'পাড়ার নাগরিক বৃন্দ', previous_year_amount: 500, target_amount: 500, collected_amount: 300, status: 'আংশিক জমা', last_payment_date: '2026-09-03', notes: 'বাকি টাকা পূজার আগে দেবেন' },
    { id: 'mem_3', sl_no: 3, name: 'শ্রী তাপস ঘোষ', phone: '9876543210', address: '২৩', member_type: 'সক্রিয় সদস্য', previous_year_amount: 1100, target_amount: 1000, collected_amount: 0, status: 'বাকি', last_payment_date: null, notes: '' },
  ],
  payments: [
    { id: 'pay_1', receipt_no: 'PS-2026-0001', member_id: 'mem_1', member_name: 'শ্রী নিমাই চন্দ্র দাস', amount: 500, payment_date: '2026-09-01', payment_mode: 'নগদ', collected_by: 'কোষাধ্যক্ষ', notes: 'সম্পূর্ণ চাঁদা জমা' },
    { id: 'pay_2', receipt_no: 'PS-2026-0002', member_id: 'mem_2', member_name: 'শ্রীমতী রীনা মুখার্জী', amount: 300, payment_date: '2026-09-03', payment_mode: 'UPI', collected_by: 'সম্পাদক', notes: '১ম কিস্তি জমা' },
  ],
  marketEntries: [
    { id: 'mk_1', category: 'পুজোর ফুল', shop_name: 'রাধে ফুল ভান্ডার', item_name: 'গাঁদা ও পদ্মফুল', quantity: '৫ কেজি', amount: 800, entry_date: '2026-09-10', notes: '' },
    { id: 'mk_2', category: 'পুজোর সামগ্রী', shop_name: 'মা তারা ভান্ডার', item_name: 'ধূপ, ঘি, প্রদীপ', quantity: '১ সেট', amount: 1200, entry_date: '2026-09-11', notes: '' },
  ],
  expenses: [
    { id: 'exp_1', title: 'প্রতিমা বায়না', category: 'প্রতিমা', amount: 5000, expense_date: '2026-09-05', paid_by: 'সম্পাদক', bill_no: 'V-101', notes: 'কুমারটুলিতে বায়না' },
    { id: 'exp_2', title: 'প্যান্ডেল অগ্রিম', category: 'প্যান্ডেল', amount: 10000, expense_date: '2026-09-08', paid_by: 'কোষাধ্যক্ষ', bill_no: 'V-102', notes: 'ডেকোরেটর্সকে অগ্রিম' },
    { id: 'exp_3', title: 'ফুল সজ্জা', category: 'পুজো', amount: 1500, expense_date: '2026-09-11', paid_by: 'কোষাধ্যক্ষ', bill_no: 'V-103', notes: '' },
  ],
  bhogCoupons: [
    { id: 'bhog_1', house_no: '১২/এ', family_head: 'শ্রী নিমাই চন্দ্র দাস', phone: '9830012345', coupon_count: 4, status: 'দেওয়া হয়েছে', delivered_time: '2026-10-26T20:30:00Z', notes: '' },
    { id: 'bhog_2', house_no: '৭/বি', family_head: 'শ্রীমতী রীনা মুখার্জী', phone: '9831198765', coupon_count: 3, status: 'বাকি', delivered_time: null, notes: '' },
    { id: 'bhog_3', house_no: '২৩', family_head: 'শ্রী তাপস ঘোষ', phone: '9876543210', coupon_count: 5, status: 'বাকি', delivered_time: null, notes: '' },
  ],
  sponsors: [
    { id: 'sp_1', sponsor_name: 'দাস ব্রাদার্স জুয়েলার্স', contact_person: 'শ্যামল দাস', phone: '9830001122', banner_type: 'গেট ব্যানার', promised_amount: 15000, paid_amount: 10000, status: 'আংশিক জমা', notes: 'মূল গেটের সামনে তোরণ' },
    { id: 'sp_2', sponsor_name: 'ঘোষ সুইটস', contact_person: 'অরুণ ঘোষ', phone: '9830003344', banner_type: 'স্টেজ ব্যানার', promised_amount: 5000, paid_amount: 5000, status: 'পরিশোধিত', notes: 'ভোগ মঞ্চের পাশে' },
  ],
  settings: {
    club_name: 'প্রগতি সংঘ',
    event_name: 'শ্রী শ্রী শ্যামা পূজা ২০২৬',
    other_income: 15000,
    admin_pin: '1234',
    membership_types: defaultMembershipTypes,
    market_categories: defaultMarketCategories,
    expense_categories: defaultExpenseCategories,
  }
};

export function loadLocalDB() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure previous_year_amount exists on members
      if (Array.isArray(parsed.members)) {
        parsed.members = parsed.members.map((m) => ({
          ...m,
          previous_year_amount: Number(m.previous_year_amount) || 0
        }));
      }
      if (!Array.isArray(parsed.previousYearMembers)) {
        parsed.previousYearMembers = defaultPreviousYearMembers;
      }
      return parsed;
    }

    // Try importing from legacy single HTML storage if present
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated = {
        ...initialDatabase,
        members: (legacy.members || []).map((m, idx) => ({
          id: m.id || 'mem_' + idx,
          sl_no: m.ক্রমিক || idx + 1,
          name: m.নাম || '',
          phone: m.মোবাইল || '',
          address: m.বাড়ি || '',
          member_type: m.ধরন || 'সক্রিয় সদস্য',
          previous_year_amount: Number(m.আগেরচাঁদা || m.previous_year_amount) || 0,
          target_amount: Number(m.নির্ধারিতচাঁদা) || 0,
          collected_amount: Number(m.জমা) || 0,
          status: m.status || (m.জমা >= m.নির্ধারিতচাঁদা && m.নির্ধারিতচাঁদা > 0 ? 'জমা হয়েছে' : (m.জমা > 0 ? 'আংশিক জমা' : 'বাকি')),
          last_payment_date: m.তারিখ || null,
          notes: m.মন্তব্য || '',
        })),
        marketEntries: (legacy.marketEntries || []).map((mk, idx) => ({
          id: mk.id || 'mk_' + idx,
          category: mk.বাজার || 'অন্যান্য',
          shop_name: mk.দোকান || '',
          item_name: mk.কী || '',
          quantity: mk.পরিমাণ || '',
          amount: Number(mk.দাম) || 0,
          entry_date: mk.তারিখ || '',
          notes: mk.মন্তব্য || '',
        })),
        expenses: (legacy.expenses || []).map((ex, idx) => ({
          id: ex.id || 'exp_' + idx,
          title: ex.নাম || '',
          category: ex.category || 'পুজো',
          amount: Number(ex.পরিমাণ) || 0,
          expense_date: ex.তারিখ || '',
          paid_by: ex.কে || 'কোষাধ্যক্ষ',
          bill_no: ex.বিল || '',
          notes: ex.মন্তব্য || '',
        })),
        settings: {
          ...initialDatabase.settings,
          other_income: Number(legacy.otherIncome) || 0,
        }
      };
      saveLocalDB(migrated);
      return migrated;
    }
  } catch (err) {
    console.error('Error loading local DB:', err);
  }

  saveLocalDB(initialDatabase);
  return initialDatabase;
}

export function saveLocalDB(db) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving local DB:', err);
  }
}

// Fetch all data from Supabase
export async function fetchSupabaseData() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [
      membersRes,
      paymentsRes,
      marketRes,
      expensesRes,
      bhogRes,
      sponsorsRes,
      settingsRes
    ] = await Promise.all([
      supabase.from('members').select('*').order('sl_no', { ascending: true }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('market_entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
      supabase.from('bhog_coupons').select('*').order('house_no', { ascending: true }),
      supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 'primary_settings').single()
    ]);

    if (membersRes.error) throw membersRes.error;

    let prevYearData = null;
    try {
      const prevRes = await supabase.from('previous_year_members').select('*');
      if (!prevRes.error && prevRes.data && prevRes.data.length > 0) {
        prevYearData = prevRes.data;
      }
    } catch (e) {
      // Table doesn't exist yet, fallback to local
    }

    const localPrev = loadLocalDB().previousYearMembers;
    const finalPrev = prevYearData || (Array.isArray(localPrev) ? localPrev : defaultPreviousYearMembers);

    return {
      members: (membersRes.data || []).map(m => ({
        ...m,
        previous_year_amount: Number(m.previous_year_amount) || 0
      })),
      payments: paymentsRes.data || [],
      marketEntries: marketRes.data || [],
      expenses: expensesRes.data || [],
      bhogCoupons: bhogRes.data || [],
      sponsors: sponsorsRes.data || [],
      settings: settingsRes.data || initialDatabase.settings,
      previousYearMembers: finalPrev,
    };
  } catch (err) {
    console.error('Supabase fetch failed:', err);
    throw err;
  }
}

// Safe helper to upsert members with fallback if column doesn't exist yet
export async function safeUpsertMembers(supabase, members) {
  if (!supabase || !members?.length) return;
  const cleaned = members.map(m => ({
    ...m,
    previous_year_amount: Number(m.previous_year_amount) || 0,
    last_payment_date: m.last_payment_date ? m.last_payment_date : null
  }));

  const { error } = await supabase.from('members').upsert(cleaned);
  if (error && (error.code === '42703' || error.message?.includes('previous_year_amount'))) {
    // If column doesn't exist yet on Supabase, strip previous_year_amount and retry
    const fallback = cleaned.map(({ previous_year_amount, ...rest }) => rest);
    await supabase.from('members').upsert(fallback);
  }
}

// Safely delete a member from Supabase cloud database
export async function deleteMemberFromSupabase(memberId) {
  const supabase = getSupabaseClient();
  if (!supabase || !memberId) return;
  try {
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    if (error) {
      console.error('Failed to delete member from Supabase:', error);
    } else {
      console.log('Member successfully deleted from Supabase:', memberId);
    }
  } catch (err) {
    console.error('Error during Supabase member delete:', err);
  }
}

// Safely delete a previous year member from Supabase
export async function deletePreviousYearMemberFromSupabase(prevId) {
  const supabase = getSupabaseClient();
  if (!supabase || !prevId) return;
  try {
    const { error } = await supabase.from('previous_year_members').delete().eq('id', prevId);
    if (!error) {
      console.log('Previous year member deleted from Supabase:', prevId);
    }
  } catch (err) {
    // Safely ignore if table does not exist
  }
}

// Safely upsert previous year members to Supabase if table exists
export async function safeUpsertPreviousYearMembers(supabase, prevMembers) {
  if (!supabase || !prevMembers?.length) return;
  try {
    await supabase.from('previous_year_members').upsert(prevMembers);
  } catch (err) {
    // Safely ignore if table does not exist
  }
}

// Push local database to Supabase (Initial seed or upload)
export async function pushLocalToSupabase(localDb) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase ক্লায়েন্ট সংযুক্ত নয়');

  // Upsert settings
  await supabase.from('settings').upsert({
    id: 'primary_settings',
    club_name: localDb.settings?.club_name || 'প্রগতি সংঘ',
    event_name: localDb.settings?.event_name || 'শ্রী শ্রী শ্যামা পূজা ২০২৬',
    other_income: localDb.settings?.other_income || 0,
    admin_pin: localDb.settings?.admin_pin || '1234',
    membership_types: localDb.settings?.membership_types || defaultMembershipTypes,
    market_categories: localDb.settings?.market_categories || defaultMarketCategories,
    expense_categories: localDb.settings?.expense_categories || defaultExpenseCategories,
  });

  // Upsert members
  if (localDb.members?.length) {
    await safeUpsertMembers(supabase, localDb.members);
  }

  // Upsert payments
  if (localDb.payments?.length) {
    await supabase.from('payments').upsert(localDb.payments);
  }

  // Upsert market entries
  if (localDb.marketEntries?.length) {
    await supabase.from('market_entries').upsert(localDb.marketEntries);
  }

  // Upsert expenses
  if (localDb.expenses?.length) {
    await supabase.from('expenses').upsert(localDb.expenses);
  }

  // Upsert bhog coupons
  if (localDb.bhogCoupons?.length) {
    await supabase.from('bhog_coupons').upsert(localDb.bhogCoupons);
  }

  // Upsert sponsors
  if (localDb.sponsors?.length) {
    await supabase.from('sponsors').upsert(localDb.sponsors);
  }

  return true;
}
