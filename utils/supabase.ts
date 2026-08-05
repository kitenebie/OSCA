import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xbrvrugudancmchrerqu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Tms7B46tCRbw3iMl-x5WUA_9cUjpvrR';

export const supabase = createClient(supabaseUrl, supabaseKey);
