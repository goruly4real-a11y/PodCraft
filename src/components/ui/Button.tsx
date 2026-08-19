/**
 * ============================================================================
 * BUTTON COMPONENT - Reusable Button
 * ============================================================================
 * 
 * A customizable button component with multiple variants and sizes.
 * 
 * HOW THIS COMPONENT WORKS:
 * ------------------------
 * 1. Uses class-variance-authority (CVA) to define style variants
 * 2. Each variant has different colors and styles
 * 3. You can combine variant + size for different looks
 * 4. The cn() utility merges Tailwind classes
 * 
 * WHY USE A BUTTON COMPONENT?
 * ---------------------------
 * - Consistent styling across the app
 * - Easy to change all buttons at once
 * - Built-in accessibility (focus states, disabled states)
 * - TypeScript support for props
 * 
 * ============================================================================
 */

// Import React for component creation
import * as React from 'react';

/**
 * class-variance-authority (CVA)
 * 
 * CVA is a library for creating variant-based component styles.
 * It's like a "style factory" that generates class names based on props.
 * 
 * HOW CVA WORKS:
 * -------------
 * 1. Define base classes (applied to all variants)
 * 2. Define variants (different style options)
 * 3. Define default variants (fallback values)
 * 
 * Example: cva('base classes', { variants: { color: { red: 'bg-red-500' } } })
 */
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * cn() Utility Function
 * 
 * This function merges Tailwind CSS class names.
 * It handles:
 * - Merging classes: "p-4 p-8" → "p-8" (last one wins)
 * - Conditional classes: condition && "class"
 * - Undefined/null values: ignored
 * 
 * We use clsx + tailwind-merge under the hood.
 */
import { cn } from '@/lib/utils';

/**
 * Button Variants Configuration
 * 
 * This defines all the different button styles available.
 * 
 * BASE CLASSES (applied to ALL buttons):
 * - inline-flex: Display as inline flex container
 * - items-center: Vertically center content
 * - justify-center: Horizontally center content
 * - gap-2: Space between icon and text
 * - whitespace-nowrap: Prevent text wrapping
 * - rounded-lg: Rounded corners
 * - text-sm: Small text size
 * - font-medium: Medium font weight
 * - transition-all: Smooth transitions on hover/active
 * - focus-visible:ring-2: Show ring on keyboard focus
 * - disabled:pointer-events-none: Prevent clicks when disabled
 * - disabled:opacity-50: Fade when disabled
 * - active:scale-[0.98]: Slight scale down on click (press effect)
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    /**
     * Variant Definitions
     * 
     * Each variant is a set of Tailwind classes that define
     * how that button variant looks.
     */
    variants: {
      /**
       * Button Style Variants
       * 
       * - default: Primary button (amber background)
       * - destructive: Danger button (red background)
       * - outline: Border only, no background
       * - secondary: Secondary color (green)
       * - ghost: No background, appears on hover
       * - link: Looks like a link (underlined on hover)
       */
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-transparent hover:bg-muted hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      
      /**
       * Button Size Variants
       * 
       * - default: Medium (h-10 = 40px height)
       * - sm: Small (h-9 = 36px)
       * - lg: Large (h-11 = 44px)
       * - xl: Extra large (h-12 = 48px)
       * - icon: Square button for icons only (10x10 = 40x40px)
       */
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    
    // Default values if no variant/size is specified
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Button Props Interface
 * 
 * Extends HTML button attributes (onClick, disabled, etc.)
 * Plus CVA variant props (variant, size)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Button Component
 * ================
 * 
 * A forwardRef component that forwards the ref to the underlying button.
 * This allows parent components to access the button element directly.
 * 
 * USAGE:
 * ------
 * <Button>Default Button</Button>
 * <Button variant="destructive" size="lg">Delete</Button>
 * <Button variant="ghost" size="icon"><Icon /></Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        // Combine variant classes with any custom classes
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // Spread remaining props (onClick, disabled, children, etc.)
        {...props}
      />
    );
  }
);

// Set display name for React DevTools
Button.displayName = 'Button';

// Export the component and the variants (for external use)
export { Button, buttonVariants };
