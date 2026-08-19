/**
 * ============================================================================
 * SHARED CORS HEADERS
 * ============================================================================
 * 
 * Reusable CORS headers for all Cloudflare Workers.
 * Import this in any worker that needs to handle cross-origin requests.
 * 
 * WHY CORS?
 * ---------
 * CORS (Cross-Origin Resource Sharing) controls which domains can access
 * your API. Without proper headers, browsers block requests from different
 * origins (e.g., your React app calling your API).
 * 
 * USAGE:
 * ------
 * import { corsHeaders } from '../_shared/cors';
 * 
 * return new Response(data, { headers: corsHeaders });
 * 
 * ============================================================================
 */

/** Standard CORS headers for all workers */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, flutterwave-signature',
};

/**
 * Create a JSON response with CORS headers
 * @param data - Data to send (will be JSON.stringify'd)
 * @param status - HTTP status code (default: 200)
 * @returns Response with CORS and JSON headers
 */
export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @returns Response with error JSON and CORS headers
 */
export function errorResponse(message: string, status: number = 500): Response {
  return jsonResponse({ error: message }, status);
}