/**
 * ============================================================================
 * ANIMATION HOOKS - React Hooks for Animations
 * ============================================================================
 * 
 * These are custom React hooks that make it easy to add animations to any
 * component. Hooks are functions that let you "hook into" React features.
 * 
 * WHAT ARE REACT HOOKS?
 * ---------------------
 * Hooks are special functions that:
 * - Start with "use" (useEffect, useRef, useCallback)
 * - Can only be called inside React components
 * - Let you use React features without writing classes
 * 
 * THE HOOKS IN THIS FILE:
 * -----------------------
 * 1. useStaggerAnimation - Animates a list of items appearing one by one
 * 2. useHoverAnimation - Adds hover effects to any element
 * 3. useClickAnimation - Adds click bounce effects to buttons
 * 
 * ============================================================================
 */

// Import React hooks we'll need
// - useEffect: Runs code when the component mounts/unmounts or dependencies change
// - useRef: Creates a reference to a DOM element that persists across renders
// - useCallback: Memoizes functions so they don't get recreated every render
import { useEffect, useRef, useCallback } from 'react';

// Import the animate function from anime.js
import { animate } from 'animejs';

/**
 * useStaggerAnimation Hook
 * ========================
 * 
 * PURPOSE:
 * Animates a container's children to appear one by one when the container
 * scrolls into view (like a list of cards appearing as you scroll down).
 * 
 * HOW IT WORKS:
 * 1. You pass this hook to a component
 * 2. It returns a "ref" that you attach to the container element
 * 3. When the container enters the viewport (visible on screen):
 *    - It finds all child elements
 *    - Animates them one by one with a stagger effect
 * 4. Only animates once (not every time it scrolls in/out)
 * 
 * USAGE EXAMPLE:
 * --------------
 * function MyList() {
 *   const containerRef = useStaggerAnimation([items]);
 *   
 *   return (
 *     <div ref={containerRef}>
 *       {items.map(item => <Card key={item.id} />)}
 *     </div>
 *   );
 * }
 * 
 * @param deps - Array of dependencies. Animation runs when these change.
 *               Similar to useEffect deps - usually [yourData].
 * @returns A ref object to attach to the container element
 */
export function useStaggerAnimation(deps: unknown[] = []) {
  // ref.current will point to the actual DOM element we attach it to
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track if we've already animated (so we don't repeat)
  const hasAnimated = useRef(false);

  // useEffect runs when deps change or component mounts
  useEffect(() => {
    // Safety check: bail out if ref isn't attached yet
    if (!containerRef.current || hasAnimated.current) return;

    /**
     * IntersectionObserver - A browser API that detects when elements
     * enter or leave the viewport (visible area of the page).
     * 
     * Like a "watcher" that says "hey, this element is now visible!"
     */
    const observer = new IntersectionObserver(
      (entries) => {
        // Check each observed element
        entries.forEach((entry) => {
          // entry.isIntersecting = true when element is visible
          if (entry.isIntersecting && !hasAnimated.current) {
            // Mark as animated so we don't repeat
            hasAnimated.current = true;
            
            // Get all children of the container
            const children = containerRef.current?.children;
            
            // If there are children, animate them
            if (children && children.length > 0) {
              // Convert HTMLCollection to Array (HTMLCollection isn't iterable)
              animate(Array.from(children), {
                opacity: [0, 1],        // Fade in each child
                translateY: [20, 0],    // Slide up each child
                duration: 500,          // 500ms per animation
                ease: 'outQuad',
              });
            }
          }
        });
      },
      // Options:
      // threshold: 0.1 means trigger when 10% of element is visible
      { threshold: 0.1 }
    );

    // Start observing the container
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Cleanup: stop observing when component unmounts
    return () => observer.disconnect();
  }, deps);  // Re-run effect if deps change

  // Return the ref so you can attach it to a JSX element
  return containerRef;
}

/**
 * useHoverAnimation Hook
 * ======================
 * 
 * PURPOSE:
 * Adds a hover effect to any element - makes it grow and glow when
 * the mouse enters, and returns to normal when the mouse leaves.
 * 
 * HOW IT WORKS:
 * 1. Returns a ref to attach to any element
 * 2. Automatically adds mouseenter/mouseleave event listeners
 * 3. Animates the element on hover
 * 
 * USAGE EXAMPLE:
 * --------------
 * function MyCard() {
 *   const hoverRef = useHoverAnimation();
 *   
 *   return (
 *     <div ref={hoverRef} className="card">
 *       Hover over me!
 *     </div>
 *   );
 * }
 * 
 * @returns A ref object to attach to the element
 */
export function useHoverAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * useCallback memoizes the function so it doesn't get recreated
   * every time the component renders. This is important because:
   * 1. Creating new functions wastes memory
   * 2. Event listeners would need to be re-attached every render
   */
  
  // Called when mouse enters the element
  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;  // Safety check
    
    animate(ref.current, {
      scale: 1.02,                                           // 2% larger
      boxShadow: '0 10px 40px rgba(245, 158, 11, 0.15)',   // Amber glow
      duration: 200,
      ease: 'outQuad',
    });
  }, []);  // Empty deps = function never changes

  // Called when mouse leaves the element
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;  // Safety check
    
    animate(ref.current, {
      scale: 1,                                             // Normal size
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',     // Subtle shadow
      duration: 200,
      ease: 'outQuad',
    });
  }, []);  // Empty deps = function never changes

  // Attach event listeners when component mounts
  useEffect(() => {
    const element = ref.current;
    if (!element) return;  // Safety check

    // Add event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup: remove listeners when component unmounts
    // (prevents memory leaks)
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);  // Re-run if functions change

  return ref;
}

/**
 * useClickAnimation Hook
 * =====================
 * 
 * PURPOSE:
 * Adds a "bounce" effect when a button is clicked.
 * 
 * HOW IT WORKS:
 * 1. Returns a ref to attach to a button
 * 2. Adds a click event listener
 * 3. On click, animates: normal → small → big → normal (bounce)
 * 
 * USAGE EXAMPLE:
 * --------------
 * function MyButton() {
 *   const clickRef = useClickAnimation();
 *   
 *   return (
 *     <button ref={clickRef}>
 *       Click me!
 *     </button>
 *   );
 * }
 * 
 * @returns A ref object to attach to a button
 */
export function useClickAnimation() {
  const ref = useRef<HTMLButtonElement>(null);

  // The bounce animation function
  const handleClick = useCallback(() => {
    if (!ref.current) return;  // Safety check
    
    animate(ref.current, {
      // Scale sequence: 1 → 0.95 → 1.05 → 1
      // - 1 to 0.95: Press down (95% size)
      // - 0.95 to 1.05: Bounce up (105% size)
      // - 1.05 to 1: Settle back (100% size)
      scale: [1, 0.95, 1.05, 1],
      duration: 300,
      ease: 'outQuad',
    });
  }, []);

  // Attach click listener
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [handleClick]);

  return ref;
}
