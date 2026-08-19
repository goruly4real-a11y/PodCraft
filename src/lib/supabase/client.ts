/**
 * ============================================================================
 * SUPABASE CLIENT - Database Connection
 * ============================================================================
 * 
 * This file creates and exports the Supabase client.
 * The client is used to interact with the Supabase database and storage.
 * 
 * WHAT IS SUPABASE?
 * ----------------
 * Supabase is a backend-as-a-service that provides:
 * - A PostgreSQL database (stores your data)
 * - Authentication (handles user login)
 * - Storage (stores files like images and audio)
 * - Real-time subscriptions (live updates)
 * - Row Level Security (RLS) (users can only see their own data)
 * 
 * HOW THE CLIENT WORKS:
 * --------------------
 * The Supabase client is like a "remote control" for your backend.
 * You use it to:
 * - Fetch data: supabase.from('speakers').select('*')
 * - Insert data: supabase.from('speakers').insert({...})
 * - Update data: supabase.from('speakers').update({...})
 * - Delete data: supabase.from('speakers').delete()
 * 
 * ============================================================================
 */

// Import the createClient function from the Supabase library
// This function creates a new Supabase client instance
import { createClient } from '@supabase/supabase-js';

/**
 * Get environment variables
 * 
 * import.meta.env is Vite's way of accessing environment variables.
 * Vite only exposes variables that start with VITE_ (for security).
 * 
 * VITE_SUPABASE_URL: Your Supabase project URL
 * Example: "https://abc123.supabase.co"
 * 
 * VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * This is safe to use in the browser (it's not a secret).
 * Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Create and export the Supabase client
 * 
 * createClient() takes two required arguments:
 * 1. The project URL
 * 2. The anonymous key
 * 
 * This client is a singleton - there's only one instance.
 * All files that need Supabase import this same client.
 * 
 * USAGE EXAMPLE:
 * --------------
 * import { supabase } from '@/lib/supabase/client';
 * 
 * const { data, error } = await supabase
 *   .from('speakers')
 *   .select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
