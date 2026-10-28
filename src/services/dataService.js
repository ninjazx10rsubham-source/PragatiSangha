import { getSupabaseClient } from './supabase';
import previousYearData from '../data/previousYearData.json';

const LOCAL_STORAGE_KEY = 'pragati_sangha_db_v4';
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

export const defaultPreviousYearMembers = previousYearData.previousYearMembers || [];

export const initialDatabase = {
  previousYearMembers: defaultPreviousYearMembers,
  members: previousYearData.currentMembers || [],
  payments: [],
  marketEntries: [],
  expenses: [],
  bhogCoupons: [],
  sponsors: [],
  settings: {
    club_name: 'প্রগতি সংঘ',
    event_name: 'শ্রী শ্রী শ্যামা পূজা ২০২৬',
    heading_mantra: 'শ্রী শ্রী শ্যামা পূজায় নমঃ',
    other_income: 0,
    admin_pin: '1234',
    membership_types: defaultMembershipTypes,
    market_categories: defaultMarketCategories,
    expense_categories: defaultExpenseCategories,
    puja_schedule: [
      {
        id: 'sch_default_1',
        title: 'ষষ্ঠ্যাদি কল্পারম্ভ ও মায়ের আবাহন',
        tithi_or_date: 'কালী পূজার পূর্বরাত্রি',
        time: 'সন্ধ্যা ৬:০০',
        category: 'পুজো ও আরতি',
        notes: 'পূজামণ্ডপে সকলকে উপস্থিত থাকার অনুরোধ করা হচ্ছে'
      },
      {
        id: 'sch_default_2',
        title: 'মহাকালী পূজা আরম্ভ ও নিশিপূজা',
        tithi_or_date: 'অমাবস্যা তিথি',
        time: 'রাত্রি ১১:৩০',
        category: 'পুজো ও আরতি',
        notes: 'নিশিপূজায় পুরোহিত মশাই বিশেষ হোম ও যজ্ঞ পরিচালনা করবেন'
      },
      {
        id: 'sch_default_3',
        title: 'সম্মিলিত পুষ্পাঞ্জলি প্রদান',
        tithi_or_date: 'কালী পূজার দিন',
        time: 'ভোর ৫:৩০',
        category: 'পুষ্পাঞ্জলি',
        notes: 'পুষ্পাঞ্জলির ফুল, বেলপাতা ও ধূপ ক্লাব প্রাঙ্গণ থেকে দেওয়া হবে'
      },
      {
        id: 'sch_default_4',
        title: 'মহাভোগ ও মহাপ্রসাদ বিতরণ',
        tithi_or_date: 'কালী পূজার পরদিন',
        time: 'দুপুর ১২:০০',
        category: 'মহাপ্রসাদ ও ভোগ',
        notes: 'সকল ভক্ত ও পাড়াবাসী মহাপ্রসাদ পাবেন'
      },
      {
        id: 'sch_default_5',
        title: 'মায়ের বিসর্জন ও শোভাযাত্রা',
        tithi_or_date: 'কালী পূজার পরদিন',
        time: 'বিকেল ৫:০০',
        category: 'শোভাযাত্রা ও বিসর্জন',
        notes: 'ব্যান্ড পার্টি সহ সকল সদস্যরা শোভাযাত্রায় অংশগ্রহণ করবেন'
      },
      {
        id: 'sch_default_6',
        title: 'সাংস্কৃতিক সন্ধ্যা ও আলোক সজ্জা উদ্বোধন',
        tithi_or_date: 'কালী পূজার আগের রাত',
        time: 'সন্ধ্যা ৭:০০',
        category: 'সাংস্কৃতিক অনুষ্ঠান',
        notes: 'সকল বয়সের সদস্যদের সাংস্কৃতিক পরিবেশনা ও আলোচনাসভা'
      }
    ],
  }
};

export function loadLocalDB() {
  try {
    // Clean up older cached versions with demo data
    localStorage.removeItem('pragati_sangha_db_v2');
    localStorage.removeItem('pragati_sangha_db_v3');
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.members)) parsed.members = [];
      if (!Array.isArray(parsed.payments)) parsed.payments = [];
      if (!Array.isArray(parsed.marketEntries)) parsed.marketEntries = [];
      if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
      if (!Array.isArray(parsed.bhogCoupons)) parsed.bhogCoupons = [];
      if (!Array.isArray(parsed.sponsors)) parsed.sponsors = [];
      if (!Array.isArray(parsed.previousYearMembers) || parsed.previousYearMembers.length === 0) {
        parsed.previousYearMembers = defaultPreviousYearMembers;
      }
      if (!Array.isArray(parsed.settings) && !parsed.settings) parsed.settings = { ...initialDatabase.settings };
      if (!parsed.settings) parsed.settings = { ...initialDatabase.settings };
      // If puja_schedule is missing or empty array, inject default schedule
      if (!Array.isArray(parsed.settings.puja_schedule) || parsed.settings.puja_schedule.length === 0) {
        parsed.settings.puja_schedule = initialDatabase.settings.puja_schedule;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading local DB:', err);
  }

  saveLocalDB(initialDatabase);
  return initialDatabase;
}

export async function resetAllDataToEmpty() {
  const emptyDb = {
    ...initialDatabase,
    members: [],
    payments: [],
    marketEntries: [],
    expenses: [],
    bhogCoupons: [],
    sponsors: [],
    previousYearMembers: [],
    settings: {
      ...initialDatabase.settings,
      other_income: 0
    }
  };
  saveLocalDB(emptyDb);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await Promise.allSettled([
        supabase.from('payments').delete().neq('id', '___none___'),
        supabase.from('members').delete().neq('id', '___none___'),
        supabase.from('market_entries').delete().neq('id', '___none___'),
        supabase.from('expenses').delete().neq('id', '___none___'),
        supabase.from('bhog_coupons').delete().neq('id', '___none___'),
        supabase.from('sponsors').delete().neq('id', '___none___'),
        supabase.from('previous_year_members').delete().neq('id', '___none___'),
        supabase.from('settings').upsert({
          id: 'primary_settings',
          club_name: 'প্রগতি সংঘ',
          event_name: 'শ্রী শ্রী শ্যামা পূজা ২০২৬',
          other_income: 0
        })
      ]);
    } catch (err) {}
  }
  return emptyDb;
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

    const localForMerge = (() => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })();

    const finalPrev = prevYearData || (Array.isArray(localForMerge?.previousYearMembers) ? localForMerge.previousYearMembers : defaultPreviousYearMembers);
    // Merge: Supabase settings + local puja_schedule (in case column missing in cloud)
    const cloudSettings = settingsRes.data || {};
    const mergedSettings = {
      ...initialDatabase.settings,
      ...cloudSettings,
      puja_schedule: (() => {
        // Priority: cloud schedule > local schedule > built-in default schedule
        if (Array.isArray(cloudSettings.puja_schedule) && cloudSettings.puja_schedule.length > 0) {
          return cloudSettings.puja_schedule;
        }
        const localSchedule = localForMerge?.settings?.puja_schedule;
        if (Array.isArray(localSchedule) && localSchedule.length > 0) {
          return localSchedule;
        }
        return initialDatabase.settings.puja_schedule; // built-in default
      })()
    };

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
      settings: mergedSettings,
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
