/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 * 
 * This file contains utility functions used throughout the app.
 * 
 * ============================================================================
 */

/**
 * clsx Library
 * 
 * A tiny utility for constructing className strings conditionally.
 * 
 * HOW CLSX WORKS:
 * --------------
 * - Strings are passed through: clsx('foo', 'bar') → 'foo bar'
 * - Objects with boolean values: clsx({ foo: true, bar: false }) → 'foo'
 * - Arrays: clsx(['foo', 'bar']) → 'foo bar'
 * - Mixed: clsx('foo', { bar: true }) → 'foo bar'
 * 
 * Example:
 * clsx('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
 */
import { clsx, type ClassValue } from 'clsx';

/**
 * twMerge (tailwind-merge)
 * 
 * A utility that intelligently merges Tailwind CSS classes.
 * 
 * HOW TWMERGE WORKS:
 * -----------------
 * It resolves conflicts between similar Tailwind classes:
 * - 'p-4 p-8' → 'p-8' (last padding wins)
 * - 'bg-red-500 bg-blue-500' → 'bg-blue-500' (last background wins)
 * - 'text-sm text-lg' → 'text-lg' (last text size wins)
 * 
 * This is important because Tailwind uses "utility classes" and
 * you can't have conflicting values (e.g., two different paddings).
 */
import { twMerge } from 'tailwind-merge';

/**
 * cn() Function - Class Name Merger
 * 
 * This is the main utility function we use everywhere.
 * It combines clsx and tailwind-merge to:
 * 1. Conditionally include classes (clsx)
 * 2. Merge conflicting Tailwind classes (twMerge)
 * 
 * USAGE EXAMPLES:
 * ---------------
 * cn('p-4', 'p-8')  → 'p-8' (merged)
 * cn('bg-red-500', condition && 'bg-blue-500')  → conditionally merges
 * cn('text-sm', 'text-lg', 'font-bold')  → 'text-lg font-bold'
 * 
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
