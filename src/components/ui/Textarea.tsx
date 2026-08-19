/**
 * ============================================================================
 * TEXTAREA COMPONENT - Multi-line Text Input
 * ============================================================================
 * 
 * A styled textarea component for multi-line text input.
 * 
 * FEATURES:
 * ---------
 * - Same styling as Input component
 * - Minimum height of 80px
 * - No resize handle (resize: none)
 * - Can expand with content (if you add auto-resize logic)
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea Props Interface
 * 
 * Extends all standard HTML textarea attributes.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea Component
 * ==================
 * 
 * USAGE:
 * ------
 * <Textarea placeholder="Enter notes..." />
 * <Textarea rows={5} disabled />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Layout
          'flex min-h-[80px] w-full',  // Full width, min 80px height
          
          // Border & Background
          'rounded-lg border border-border bg-muted',
          
          // Spacing
          'px-3 py-2',
          
          // Text
          'text-sm text-foreground',
          
          // Focus states
          'ring-offset-background',
          
          // Placeholder
          'placeholder:text-muted-foreground',
          
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          
          // Transitions
          'transition-all duration-200',
          
          // Disable resize (users can't drag to resize)
          'resize-none',
          
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
