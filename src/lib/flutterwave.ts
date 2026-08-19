/**
 * ============================================================================
 * FLUTTERWAVE PAYMENT UTILITIES
 * ============================================================================
 * 
 * Payment configuration and utilities for Flutterwave integration.
 * The actual payment hook should be used directly in components.
 * 
 * SETUP INSTRUCTIONS:
 * ------------------
 * 1. Create account at https://flutterwave.com
 * 2. Get your Public Key from Dashboard > Settings > API Keys
 * 3. Add VITE_FLUTTERWAVE_PUBLIC_KEY to .env file
 * 4. For webhooks, set up your backend to verify transactions
 * 
 * ============================================================================
 */

import type { FlutterWaveResponse } from 'flutterwave-react-v3';

/**
 * Credit pack pricing configuration
 * Price in NGN (Nigerian Naira) - adjust for your currency
 */
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number; // Price in NGN
  currency: string;
  color: string;
  popular?: boolean;
}

/**
 * Available credit packs for purchase
 * Adjust prices based on your pricing strategy
 */
export const creditPacks: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 14500, // ~$9.99 USD
    currency: 'NGN',
    color: '#F59E0B',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 200,
    price: 43500, // ~$29.99 USD
    currency: 'NGN',
    popular: true,
    color: '#10B981',
  },
  {
    id: 'power',
    name: 'Power User',
    credits: 500,
    price: 72500, // ~$49.99 USD
    currency: 'NGN',
    color: '#8B5CF6',
  },
];

/**
 * Generate a unique transaction reference
 * @returns Unique transaction reference string
 */
export function generateTransactionRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PODCRAFT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get Flutterwave public key from environment
 * @returns Public key string or null if not configured
 */
export function getFlutterwavePublicKey(): string | null {
  return import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || null;
}

/**
 * Format price for display
 * @param amount - Amount in NGN
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Verify transaction with backend
 * 
 * Calls the verify-payment worker to confirm a transaction is legitimate.
 * Use this after Flutterwave callback to verify payment before showing success.
 * 
 * @param txRef - Transaction reference (tx_ref) from Flutterwave
 * @returns Promise resolving to verification result
 * 
 * @example
 * ```typescript
 * const verified = await verifyTransaction('PODCRAFT-M1ABC123-XYZ789');
 * if (verified) {
 *   // Show success, credits will be added by webhook
 * } else {
 *   // Show error, payment not verified
 * }
 * ```
 */
export async function verifyTransaction(txRef: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/verify-payment?tx_ref=${encodeURIComponent(txRef)}`);
    
    if (!response.ok) {
      console.error('Verification request failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return false;
  }
}

/**
 * Check if a transaction reference belongs to PodCraft
 * 
 * Validates that a tx_ref starts with PODCRAFT- prefix.
 * 
 * @param txRef - Transaction reference to validate
 * @returns True if the reference is a valid PodCraft reference
 */
export function isValidPodcraftTxRef(txRef: string): boolean {
  return txRef.startsWith('PODCRAFT-');
}

export type { FlutterWaveResponse };