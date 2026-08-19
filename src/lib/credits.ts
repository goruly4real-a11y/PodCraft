/**
 * ============================================================================
 * CREDIT COST CALCULATION
 * ============================================================================
 * 
 * Handles credit costs for podcast generation based on duration and speakers.
 * 
 * CREDIT FORMULA:
 * ---------------
 * credits = ceil((duration_minutes × speaker_count) / 5)
 * 
 * This means:
 * - Longer podcasts cost more credits
 * - More speakers cost more credits
 * - The cost scales linearly with both factors
 * 
 * ============================================================================
 */

/**
 * Available duration options for podcast generation
 * Each option shows the duration and base credit cost (for 1 speaker)
 */
export interface DurationOption {
  /** Duration in minutes */
  value: number;
  
  /** Display label */
  label: string;
  
  /** Base credit cost (for 1 speaker) */
  credits: number;
}

/**
 * Duration options available for podcast generation
 * Credits shown are for 1 speaker - multiply by speaker count for actual cost
 */
export const DURATION_OPTIONS: DurationOption[] = [
  { value: 5, label: '5 min', credits: 1 },
  { value: 10, label: '10 min', credits: 2 },
  { value: 15, label: '15 min', credits: 3 },
  { value: 20, label: '20 min', credits: 4 },
  { value: 25, label: '25 min', credits: 5 },
  { value: 30, label: '30 min', credits: 6 },
  { value: 32, label: '32 min', credits: 7 },
  { value: 45, label: '45 min', credits: 9 },
  { value: 60, label: '60 min', credits: 12 },
];

/**
 * Calculate the credit cost for a podcast generation
 * 
 * Uses the formula: ceil((duration × speakers) / 5)
 * 
 * @param durationMinutes - Duration of the podcast in minutes
 * @param speakerCount - Number of speakers (1-4)
 * @returns Number of credits required
 * 
 * @example
 * ```typescript
 * calculateCredits(20, 2);  // Returns 8
 * calculateCredits(30, 3);  // Returns 18
 * calculateCredits(60, 4);  // Returns 48
 * ```
 */
export function calculateCredits(durationMinutes: number, speakerCount: number): number {
  // Ensure minimum values
  const duration = Math.max(1, durationMinutes);
  const speakers = Math.max(1, Math.min(4, speakerCount));
  
  // Formula: ceil((duration × speakers) / 5)
  return Math.ceil((duration * speakers) / 5);
}

/**
 * Get the base credit cost for a duration (1 speaker)
 * 
 * @param durationMinutes - Duration in minutes
 * @returns Base credit cost for 1 speaker
 */
export function getBaseCredits(durationMinutes: number): number {
  const option = DURATION_OPTIONS.find(opt => opt.value === durationMinutes);
  return option?.credits ?? calculateCredits(durationMinutes, 1);
}

/**
 * Format credit cost for display
 * 
 * @param credits - Number of credits
 * @returns Formatted string (e.g., "1 credit" or "5 credits")
 */
export function formatCreditCost(credits: number): string {
  return credits === 1 ? '1 credit' : `${credits} credits`;
}

/**
 * Check if a duration option is valid
 * 
 * @param duration - Duration value to validate
 * @returns True if duration is a valid option
 */
export function isValidDuration(duration: number): boolean {
  return DURATION_OPTIONS.some(opt => opt.value === duration);
}

/**
 * Get duration option by value
 * 
 * @param duration - Duration value to find
 * @returns Duration option or undefined
 */
export function getDurationOption(duration: number): DurationOption | undefined {
  return DURATION_OPTIONS.find(opt => opt.value === duration);
}