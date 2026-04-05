import { createClient } from '@supabase/supabase-js';

// Server-side client with full access (service role)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
