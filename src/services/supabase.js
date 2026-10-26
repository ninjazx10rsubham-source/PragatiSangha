import { createClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'pragati_supabase_url';
const STORAGE_KEY_KEY = 'pragati_supabase_key';

export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

export function getSupabaseCredentials() {
  const customUrl = localStorage.getItem(STORAGE_URL_KEY);
  const customKey = localStorage.getItem(STORAGE_KEY_KEY);
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = normalizeSupabaseUrl(customUrl || envUrl || '');
  const key = (customKey || envKey || '').trim();

  return { url, key, isCustom: !!customUrl };
}

export function saveSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem(STORAGE_URL_KEY, normalizeSupabaseUrl(url));
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient() {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !url.startsWith('http')) {
    supabaseInstance = null;
    return null;
  }

  if (supabaseInstance && currentUrl === url && currentKey === key) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false }
    });
    currentUrl = url;
    currentKey = key;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(rawUrl, rawKey) {
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (rawKey || '').trim();

  if (!url || !key) {
    return { success: false, message: 'URL এবং Anon Key উভয়ই প্রদান করুন' };
  }

  try {
    const client = createClient(url, key);
    const { data, error } = await client.from('settings').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Supabase সংযোগ সফল হয়েছে!' };
  } catch (err) {
    return { success: false, message: err.message || 'সংযোগ ব্যর্থ হয়েছে' };
  }
}
