/**
 * ============================================================================
 * SUPABASE REST API HELPERS
 * ============================================================================
 * 
 * Helper functions for calling Supabase REST API directly.
 * Used by Cloudflare Workers to interact with the database.
 * 
 * WHY REST API INSTEAD OF SDK?
 * ----------------------------
 * Cloudflare Workers run on V8 isolates, not Node.js.
 * The Supabase JS SDK depends on Node.js APIs that aren't available.
 * Using raw fetch() with REST API is more reliable and lightweight.
 * 
 * ============================================================================
 */

/**
 * Environment variables required for Supabase access
 */
export interface SupabaseEnv {
  /** Supabase project URL (e.g., https://xxxxx.supabase.co) */
  SUPABASE_URL: string;
  
  /** Supabase service role key (admin access, bypasses RLS) */
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Transaction record to insert
 */
export interface TransactionRecord {
  /** User ID from Supabase auth */
  user_id: string;
  
  /** Flutterwave transaction reference */
  flutterwave_tx_ref: string;
  
  /** Amount in NGN kobo */
  amount: number;
  
  /** Number of credits purchased */
  credits: number;
  
  /** Transaction status */
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Upsert user credits in the database
 * 
 * If the user has no credits record, creates one.
 * If they do, adds the new credits to their balance.
 * 
 * @param env - Supabase environment variables
 * @param userId - The user's auth ID
 * @param creditsToAdd - Number of credits to add
 * @returns True if successful
 */
export async function upsertCredits(
  env: SupabaseEnv,
  userId: string,
  creditsToAdd: number
): Promise<boolean> {
  try {
    // First, try to get existing credits
    const existing = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_credits?user_id=eq.${userId}&select=credits`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const data = await existing.json();
    const currentCredits = data[0]?.credits || 0;
    const newTotal = currentCredits + creditsToAdd;

    if (data.length > 0) {
      // Update existing record
      const update = await fetch(
        `${env.SUPABASE_URL}/rest/v1/user_credits?user_id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            credits: newTotal,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      return update.ok;
    } else {
      // Insert new record
      const insert = await fetch(
        `${env.SUPABASE_URL}/rest/v1/user_credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            credits: creditsToAdd,
          }),
        }
      );

      return insert.ok;
    }
  } catch (error) {
    console.error('Upsert credits error:', error);
    return false;
  }
}

/**
 * Insert a transaction record
 * 
 * Logs the payment details for audit trail and history display.
 * 
 * @param env - Supabase environment variables
 * @param transaction - Transaction details to record
 * @returns True if successful
 */
export async function insertTransaction(
  env: SupabaseEnv,
  transaction: TransactionRecord
): Promise<boolean> {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          user_id: transaction.user_id,
          flutterwave_tx_ref: transaction.flutterwave_tx_ref,
          amount: transaction.amount,
          credits: transaction.credits,
          status: transaction.status,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Insert transaction error:', error);
    return false;
  }
}

/**
 * Find user ID by email
 * 
 * Used to map Flutterwave customer email to Supabase user.
 * 
 * @param env - Supabase environment variables
 * @param email - Customer email from Flutterwave
 * @returns User ID or null if not found
 */
export async function findUserByEmail(
  env: SupabaseEnv,
  email: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const data = await response.json();
    return data.users?.[0]?.id || null;
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
}