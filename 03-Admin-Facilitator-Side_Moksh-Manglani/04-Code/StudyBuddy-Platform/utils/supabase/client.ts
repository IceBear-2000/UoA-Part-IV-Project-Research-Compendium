import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For use in Client Components.
export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
