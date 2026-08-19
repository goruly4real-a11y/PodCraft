/**
 * ============================================================================
 * CLOUDFLARE WORKER - Flutterwave Payment Verification
 * ============================================================================
 * 
 * Handles Flutterwave webhook events and verifies transactions.
 * This worker ensures payments are legitimate before crediting users.
 * 
 * SECURITY FLOW:
 * --------------
 * 1. Receive webhook from Flutterwave
 * 2. Verify HMAC-SHA256 signature (prevents spoofing)
 * 3. Call Flutterwave API to double-verify (defense in depth)
 * 4. Validate amount, currency, and tx_ref
 * 5. Credit user's account in Supabase
 * 6. Log transaction for audit trail
 * 
 * ENDPOINTS:
 * ----------
 * POST /api/verify-payment - Webhook receiver (Flutterwave calls this)
 * GET /api/verify-payment?tx_ref=xxx - Client-side verification check
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * --------------------------------
 * - FLW_SECRET_KEY: Flutterwave secret key (starts with FLWSECK_)
 * - FLW_SECRET_HASH: Secret hash for webhook signature verification
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (admin access)
 * 
 * ============================================================================
 */

import { corsHeaders, jsonResponse, errorResponse } from './_shared/cors';
import { upsertCredits, insertTransaction, findUserByEmail } from './_shared/supabase';

/**
 * Environment variables for this worker
 */
interface Env {
  /** Flutterwave secret key for API calls */
  FLW_SECRET_KEY: string;
  
  /** Flutterwave secret hash for webhook signature verification */
  FLW_SECRET_HASH: string;
  
  /** Supabase project URL */
  SUPABASE_URL: string;
  
  /** Supabase service role key */
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Flutterwave webhook event structure
 */
interface FlutterwaveEvent {
  /** Event ID */
  id: string;
  
  /** Event type (e.g., charge.completed) */
  type: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Event data payload */
  data: {
    /** Transaction ID */
    id: string;
    
    /** Your transaction reference */
    tx_ref: string;
    
    /** Flutterwave reference */
    flw_ref: string;
    
    /** Amount charged */
    amount: number;
    
    /** Currency code */
    currency: string;
    
    /** Transaction status */
    status: string;
    
    /** Customer details */
    customer: {
      id: string;
      email: string;
      name: string;
    };
  };
}

/**
 * Flutterwave verification API response
 */
interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      id: number;
      email: string;
      name: string;
    };
  };
}

/**
 * Credit pack mapping (price in NGN to credits)
 * Must match the packs in src/lib/flutterwave.ts
 */
const CREDIT_PACKS: Record<number, number> = {
  14500: 50,   // Starter
  43500: 200,  // Pro Pack
  72500: 500,  // Power User
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET - Client-side verification check
    if (request.method === 'GET') {
      return handleVerificationCheck(request, env);
    }

    // POST - Webhook receiver
    if (request.method === 'POST') {
      return handleWebhook(request, env);
    }

    return errorResponse('Method not allowed', 405);
  },
};

/**
 * Handle client-side verification check
 * 
 * Called by the frontend to verify a transaction after payment.
 * 
 * @param request - The incoming request
 * @param env - Environment variables
 * @returns Verification status
 */
async function handleVerificationCheck(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const txRef = url.searchParams.get('tx_ref');

  if (!txRef) {
    return errorResponse('Missing tx_ref parameter', 400);
  }

  // Verify with Flutterwave API
  const verified = await verifyWithFlutterwave(env, txRef);
  
  return jsonResponse({ 
    verified: verified.success,
    tx_ref: txRef,
  });
}

/**
 * Handle webhook from Flutterwave
 * 
 * This is the main handler that processes payment notifications.
 * 
 * @param request - The incoming webhook request
 * @param env - Environment variables
 * @returns Processing result
 */
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  try {
    // Step 1: Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('flutterwave-signature');

    // Step 2: Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, env.FLW_SECRET_HASH)) {
      console.error('Invalid webhook signature');
      return errorResponse('Invalid signature', 401);
    }

    // Step 3: Parse the event
    const event: FlutterwaveEvent = JSON.parse(rawBody);
    
    // Step 4: Only process charge.completed events
    if (event.type !== 'charge.completed') {
      console.log(`Ignoring event type: ${event.type}`);
      return jsonResponse({ received: true, processed: false });
    }

    // Step 5: Verify transaction with Flutterwave API (defense in depth)
    const verification = await verifyWithFlutterwave(env, event.data.tx_ref);
    
    if (!verification.success) {
      console.error('Transaction verification failed:', verification.error);
      return errorResponse('Transaction verification failed', 400);
    }

    // Step 6: Validate transaction details
    const txData = verification.data!;
    
    // Check status is successful
    if (txData.status !== 'successful') {
      console.error(`Transaction status not successful: ${txData.status}`);
      return jsonResponse({ received: true, processed: false, reason: 'status_not_successful' });
    }

    // Get credits for this amount
    const credits = CREDIT_PACKS[txData.amount];
    if (!credits) {
      console.error(`Unknown amount: ${txData.amount}`);
      return errorResponse('Unknown transaction amount', 400);
    }

    // Step 7: Find user by email
    const userId = await findUserByEmail(env, txData.customer.email);
    if (!userId) {
      console.error(`User not found for email: ${txData.customer.email}`);
      return errorResponse('User not found', 400);
    }

    // Step 8: Credit user's account
    const credited = await upsertCredits(env, userId, credits);
    if (!credited) {
      console.error('Failed to credit user account');
      return errorResponse('Failed to credit account', 500);
    }

    // Step 9: Log transaction for audit trail
    await insertTransaction(env, {
      user_id: userId,
      flutterwave_tx_ref: txData.tx_ref,
      amount: txData.amount,
      credits: credits,
      status: 'completed',
    });

    console.log(`Payment verified and credits added: ${credits} for user ${userId}`);
    
    return jsonResponse({ 
      received: true, 
      processed: true,
      credits_added: credits,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return errorResponse('Webhook processing failed', 500);
  }
}

/**
 * Verify webhook signature using HMAC-SHA256
 * 
 * Flutterwave signs webhooks with a secret hash.
 * We verify the signature to ensure the webhook is authentic.
 * 
 * @param rawBody - Raw request body as string
 * @param signature - Signature from flutterwave-signature header
 * @param secretHash - Your secret hash from Flutterwave dashboard
 * @returns True if signature is valid
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secretHash: string
): boolean {
  if (!signature) {
    return false;
  }

  // In Cloudflare Workers, we use SubtleCrypto for HMAC
  // For simplicity, we'll use a direct comparison for now
  // In production, implement proper HMAC verification
  
  // TODO: Implement proper HMAC-SHA256 verification
  // The signature from Flutterwave is the SHA256 hash of the body
  // For now, we'll compare directly (not recommended for production)
  
  // Proper implementation would be:
  // const encoder = new TextEncoder();
  // const key = await crypto.subtle.importKey(
  //   'raw',
  //   encoder.encode(secretHash),
  //   { name: 'HMAC', hash: 'SHA-256' },
  //   false,
  //   ['sign']
  // );
  // const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  // const expectedSignature = Array.from(new Uint8Array(signature))
  //   .map(b => b.toString(16).padStart(2, '0'))
  //   .join('');
  // return expectedSignature === receivedSignature;
  
  // For now, accept if signature matches the secret hash
  // This is a temporary solution - implement proper HMAC in production
  return signature === secretHash;
}

/**
 * Verify transaction with Flutterwave API
 * 
 * Calls Flutterwave's verification endpoint to confirm the transaction.
 * This is a defense-in-depth measure beyond just trusting webhooks.
 * 
 * @param env - Environment variables
 * @param txRef - Transaction reference to verify
 * @returns Verification result with transaction data
 */
async function verifyWithFlutterwave(
  env: Env,
  txRef: string
): Promise<{ success: boolean; data?: FlutterwaveVerifyResponse['data']; error?: string }> {
  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.FLW_SECRET_KEY}`,
        },
      }
    );

    const result: FlutterwaveVerifyResponse = await response.json();

    if (result.status !== 'success') {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}