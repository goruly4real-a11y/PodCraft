/**
 * ============================================================================
 * SELECT COMPONENT - Dropdown Select
 * ============================================================================
 * 
 * A styled select dropdown component.
 * 
 * FEATURES:
 * ---------
 * - Custom dropdown arrow (SVG icon)
 * - Placeholder option (disabled, shows as default)
 * - Options from array of {value, label} objects
 * - Same styling as Input component
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Select Props Interface
 * 
 * Extends standard HTML select attributes plus:
 * - options: Array of {value, label} objects for the dropdown
 * - placeholder: Optional placeholder text
 */
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Select Component
 * ================
 * 
 * USAGE:
 * ------
 * <Select 
 *   options={[
 *     { value: 'warm', label: 'Warm' },
 *     { value: 'calm', label: 'Calm' },
 *   ]}
 *   placeholder="Select a tone"
 * />
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={cn(
          // Layout
          'flex h-10 w-full',
          
          // Border & Background
          'rounded-lg border border-border bg-muted',
          
          // Spacing
          'px-3 py-2',
          
          // Text
          'text-sm text-foreground',
          
          // Focus states
          'ring-offset-background',
          
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          
          // Transitions
          'transition-all duration-200',
          
          /**
           * Custom Dropdown Arrow
           * 
           * appearance-none: Remove default browser arrow
           * bg-[url(...)]: Add custom SVG arrow
           * bg-[length:1.25rem]: Arrow size (20px)
           * bg-[right_0.5rem_center]: Position arrow on right
           * pr-10: Extra right padding for arrow space
           */
          'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10',
          
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Placeholder option (disabled, can't be selected) */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {/* Map options to <option> elements */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
