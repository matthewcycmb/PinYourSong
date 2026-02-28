import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

// Browser client (respects RLS)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
      );
    }
    return Reflect.get(_supabase, prop);
  },
});

// Server client (bypasses RLS for writes)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(
        getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY")
      );
    }
    return Reflect.get(_supabaseAdmin, prop);
  },
});
