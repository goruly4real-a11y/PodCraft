/**
 * ============================================================================
 * TOAST COMPONENT - Notifications
 * ============================================================================
 * 
 * A toast notification component that shows temporary messages.
 * 
 * TOAST EXPLAINED:
 * ----------------
 * A toast is a small popup that appears to show:
 * - Success messages (green)
 * - Error messages (red)
 * - Info messages (blue)
 * 
 * They automatically disappear after 5 seconds.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Component reads toast state from useUIStore
 * 2. If toast exists, render the notification
 * 3. Set a timer to hide after 5 seconds
 * 4. User can also click X to dismiss early
 * 
 * ============================================================================
 */

// Import useEffect for the auto-dismiss timer
import { useEffect } from 'react';

// Import the UI store to read toast state
import { useUIStore } from '@/store';

// Import icons for different toast types
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Import utility for combining class names
import { cn } from '@/lib/utils';

/**
 * Toast Component
 * ===============
 * 
 * Renders a toast notification in the bottom-right corner.
 * 
 * USAGE (in any component):
 * -------------------------
 * const { showToast } = useUIStore();
 * showToast('Success!', 'success');
 * showToast('Error occurred', 'error');
 * showToast('Here is some info', 'info');
 */
export function Toast() {
  // Get toast state and hide function from the store
  const { toast, hideToast } = useUIStore();

  /**
   * EFFECT: Auto-dismiss toast after 5 seconds
   * 
   * When toast changes:
   * - If toast exists, start a 5-second timer
   * - When timer fires, hide the toast
   * - If toast changes before timer fires, cancel the old timer
   */
  useEffect(() => {
    if (toast) {
      // Create timer to hide toast after 5 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);  // 5000ms = 5 seconds
      
      // Cleanup: cancel timer if toast changes or component unmounts
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);  // Re-run when toast changes

  // Don't render anything if there's no toast
  if (!toast) return null;

  /**
   * Icon mapping
   * 
   * Each toast type has a different icon:
   * - success: Green checkmark
   * - error: Red exclamation circle
   * - info: Blue info circle
   */
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-secondary" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
  };

  /**
   * Background color mapping
   * 
   * Each toast type has different colors:
   * - success: Green tint with green border
   * - error: Red tint with red border
   * - info: Amber tint with amber border
   * 
   * The /10 and /30 are opacity values (10% and 30%)
   */
  const bgColors = {
    success: 'bg-secondary/10 border-secondary/30',
    error: 'bg-destructive/10 border-destructive/30',
    info: 'bg-primary/10 border-primary/30',
  };

  return (
    /**
     * Toast container
     * 
     * CSS Classes:
     * - fixed: Stay in place when scrolling
     * - bottom-4 right-4: Position (16px from bottom-right)
     * - z-50: High z-index (appears above other content)
     * - animate-in slide-in-from-bottom-5: Slide up animation
     */
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div
        className={cn(
          // Layout
          'flex items-center gap-3',  // Horizontal layout with gaps
          
          // Spacing
          'px-4 py-3',  // Horizontal 16px, vertical 12px
          
          // Border & Background
          'rounded-lg border backdrop-blur-xl shadow-lg',
          
          // Type-specific colors
          bgColors[toast.type]
        )}
      >
        {/* Icon */}
        {icons[toast.type]}
        
        {/* Message */}
        <p className="text-sm font-medium">{toast.message}</p>
        
        {/* Close button */}
        <button
          onClick={hideToast}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
