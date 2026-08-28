import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder_key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder_key') {
  console.warn("Supabase URL or Key is missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
