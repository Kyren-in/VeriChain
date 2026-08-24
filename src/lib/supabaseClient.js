import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dgsljqltsotzaeeqvidw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2xqcWx0c290emFlZXF2aWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQwNjYsImV4cCI6MjEwMzE3MDA2Nn0.iZzfoEsUOzFYhvu14Ljd6yvGGAgHkJdIBQe06O3VslY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
