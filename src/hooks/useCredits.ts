/**
 * ============================================================================
 * useCredits HOOK - Credit Management
 * ============================================================================
 * 
 * This hook handles all credit-related operations:
 * - Fetching credits from the database
 * - Checking if user has enough credits
 * - Deducting credits for podcast generation
 * - Refunding credits on generation failure
 * 
 * HOW CREDITS WORK:
 * -----------------
 * - Users purchase credits via Flutterwave
 * - Credits are stored in the user_credits table
 * - Each podcast generation costs credits based on duration × speakers
 * - Credits are deducted before generation starts
 * - If generation fails, credits are refunded
 * 
 * CREDIT FORMULA:
 * ---------------
 * credits = ceil((duration_minutes × speaker_count) / 5)
 * 
 * ============================================================================
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCreditStore } from '@/store';
import { calculateCredits } from '@/lib/credits';

/**
 * useCredits Hook
 * ===============
 * 
 * USAGE:
 * ------
 * function PodcastCreation() {
 *   const { credits, hasEnoughCredits, deductCredits } = useCredits();
 *   
 *   const handleCreate = async () => {
 *     if (!hasEnoughCredits(requiredCredits)) {
 *       alert('Not enough credits!');
 *       return;
 *     }
 *     await deductCredits(userId, requiredCredits);
 *   };
 * }
 */
export function useCredits() {
  /**
   * Extract state and actions from the credit store
   */
  const {
    credits,
    loading,
    setCredits,
    addCredits,
    deductCredits: storeDeductCredits,
    setLoading,
  } = useCreditStore();

  /**
   * fetchCredits Function
   * ====================
   * 
   * Fetches the user's credit balance from Supabase.
   * Called after login and on page refresh.
   * 
   * @param userId - The ID of the user whose credits to fetch
   */
  const fetchCredits = useCallback(async (userId: string) => {
    setLoading(true);

    /**
     * Query the user_credits table
     * 
     * If no record exists, the user has 0 credits.
     * We use .maybeSingle() instead of .single() to avoid errors
     * when no record exists (returns null instead of throwing).
     */
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } else {
      setCredits(data?.credits ?? 0);
    }

    setLoading(false);
  }, [setCredits, setLoading]);

  /**
   * hasEnoughCredits Function
   * ========================
   * 
   * Checks if the user has enough credits for an operation.
   * 
   * @param requiredCredits - Number of credits needed
   * @returns True if user has enough credits
   */
  const hasEnoughCredits = useCallback((requiredCredits: number): boolean => {
    return credits >= requiredCredits;
  }, [credits]);

  /**
   * deductCredits Function
   * =====================
   * 
   * Deducts credits from the user's balance.
   * Updates both local store and database.
   * 
   * @param userId - The ID of the user
   * @param amount - Number of credits to deduct
   * @returns True if successful
   */
  const deductCredits = useCallback(async (userId: string, amount: number): Promise<boolean> => {
    if (amount <= 0) return true;
    
    const newBalance = credits - amount;
    
    if (newBalance < 0) {
      console.error('Insufficient credits');
      return false;
    }

    // Update local store immediately (optimistic update)
    storeDeductCredits(amount);

    // Update database
    const { error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error deducting credits:', error);
      // Revert local store on error
      setCredits(credits);
      return false;
    }

    return true;
  }, [credits, storeDeductCredits, setCredits]);

  /**
   * refundCredits Function
   * =====================
   * 
   * Refunds credits to the user's balance.
   * Used when podcast generation fails.
   * 
   * @param userId - The ID of the user
   * @param amount - Number of credits to refund
   * @returns True if successful
   */
  const refundCredits = useCallback(async (userId: string, amount: number): Promise<boolean> => {
    if (amount <= 0) return true;

    const newBalance = credits + amount;

    // Update local store immediately
    addCredits(amount);

    // Update database
    const { error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error refunding credits:', error);
      // Revert local store on error
      setCredits(credits);
      return false;
    }

    return true;
  }, [credits, addCredits, setCredits]);

  /**
   * getCreditCost Function
   * =====================
   * 
   * Calculates the credit cost for a podcast generation.
   * Convenience wrapper around calculateCredits.
   * 
   * @param durationMinutes - Duration in minutes
   * @param speakerCount - Number of speakers
   * @returns Number of credits required
   */
  const getCreditCost = useCallback((durationMinutes: number, speakerCount: number): number => {
    return calculateCredits(durationMinutes, speakerCount);
  }, []);

  /**
   * Return values
   * =============
   * 
   * Everything the component needs to work with credits.
   */
  return {
    credits,
    loading,
    fetchCredits,
    hasEnoughCredits,
    addCredits,
    deductCredits,
    refundCredits,
    getCreditCost,
  };
}