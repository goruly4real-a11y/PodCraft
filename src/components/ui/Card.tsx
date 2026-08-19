/**
 * ============================================================================
 * CARD COMPONENT - Content Container
 * ============================================================================
 * 
 * A set of components for creating card-based layouts.
 * Cards are used to group related content together.
 * 
 * CARD STRUCTURE:
 * --------------
 * ┌─────────────────────────┐
 * │ CardHeader              │
 * │   CardTitle             │
 * │   CardDescription       │
 * ├─────────────────────────┤
 * │ CardContent             │
 * │   (Your content here)   │
 * ├─────────────────────────┤
 * │ CardFooter              │
 * │   (Actions, buttons)    │
 * └─────────────────────────┘
 * 
 * WHY USE CARDS?
 * -------------
 * - Visually group related content
 * - Create consistent layouts
 * - Make content scannable
 * - Provide visual hierarchy
 * 
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Component - Main Container
 * 
 * The outer wrapper that contains all card parts.
 * Provides the border, background, and shadow.
 * 
 * CSS Classes Explained:
 * - rounded-xl: Extra large border radius (12px)
 * - border: Adds a border
 * - border-border: Border color from theme
 * - bg-card: Background color from theme
 * - text-card-foreground: Text color from theme
 * - shadow-lg: Large shadow (depth effect)
 * - transition-all: Smooth transitions on hover
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-border bg-card text-card-foreground shadow-lg transition-all duration-200',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

/**
 * CardHeader - Title Section
 * 
 * Contains the card title and description.
 * CSS Classes:
 * - flex flex-col: Stack children vertically
 * - space-y-1.5: Add vertical spacing between children
 * - p-6: Padding on all sides (24px)
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle - Main Heading
 * 
 * The primary heading of the card.
 * CSS Classes:
 * - text-2xl: Large text size (24px)
 * - font-semibold: Semi-bold font weight (600)
 * - leading-none: No line height (compact)
 * - tracking-tight: Tight letter spacing
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription - Subtitle Text
 * 
 * Secondary text below the title.
 * CSS Classes:
 * - text-sm: Small text size (14px)
 * - text-muted-foreground: Muted text color (gray)
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * CardContent - Main Content Area
 * 
 * Where your main content goes.
 * CSS Classes:
 * - p-6: Padding on all sides
 * - pt-0: No top padding (connects to header)
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * CardFooter - Action Area
 * 
 * For buttons, links, or other actions.
 * CSS Classes:
 * - flex items-center: Horizontally align items
 * - p-6: Padding on all sides
 * - pt-0: No top padding
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Export all card components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
