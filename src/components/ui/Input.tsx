/**
 * ============================================================================
 * INPUT COMPONENT - Text Input Field
 * ============================================================================
 * 
 * A styled input component for text, email, password, etc.
 * 
 * FEATURES:
 * ---------
 * - Consistent styling across all inputs
 * - Focus states (ring on focus)
 * - Disabled states (grayed out)
 * - Placeholder text styling
 * - File input styling
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Props Interface
 * 
 * Extends all standard HTML input attributes.
 * This means you can use any input prop (type, placeholder, onChange, etc.)
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input Component
 * ===============
 * 
 * A forwardRef component for text inputs.
 * 
 * USAGE:
 * ------
 * <Input type="email" placeholder="Enter email" />
 * <Input type="password" disabled />
 * <Input type="file" accept="image/*" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Layout
          'flex h-10 w-full',  // Full width, 40px height
          
          // Border & Background
          'rounded-lg border border-border bg-muted',
          
          // Spacing
          'px-3 py-2',  // Horizontal padding 12px, vertical 8px
          
          // Text
          'text-sm text-foreground',  // Small text, foreground color
          
          // Focus states (ring effect)
          'ring-offset-background',  // Offset for the ring
          
          // File input styling
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          
          // Placeholder text
          'placeholder:text-muted-foreground',
          
          // Focus ring (appears on keyboard focus)
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          
          // Transitions
          'transition-all duration-200',
          
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
