/**
 * ============================================================================
 * ANIMATION UTILITIES - PodCraft Animation Library
 * ============================================================================
 * 
 * This file contains all the animation functions used throughout the app.
 * We use Anime.js, a lightweight JavaScript animation library that makes it
 * easy to create smooth, performant animations.
 * 
 * HOW ANIME.JS WORKS:
 * -------------------
 * The `animate()` function takes two arguments:
 * 1. A target: The HTML element(s) to animate
 * 2. A config object: Defines what properties to animate and how
 * 
 * The config object has these key properties:
 * - opacity: [start, end] - Fade in/out (0 = invisible, 1 = fully visible)
 * - translateY: [start, end] - Move up/down (positive = down, negative = up)
 * - scale: [start, end] - Size (1 = normal, <1 = smaller, >1 = bigger)
 * - duration: milliseconds - How long the animation takes
 * - delay: milliseconds - Wait before starting
 * - ease: string - Speed curve (makes animation feel natural)
 * - loop: boolean - Repeat forever
 * 
 * EASING EXPLAINED:
 * -----------------
 * Easing controls the acceleration/deceleration of animations:
 * - 'outQuad': Starts fast, slows down at end (most common)
 * - 'inQuad': Starts slow, speeds up at end
 * - 'inOutQuad': Starts slow, speeds up middle, slows at end
 * - 'outBack': Overshoots slightly, then settles (bouncy feel)
 * 
 * ============================================================================
 */

// Import the animation functions from anime.js
// `animate` creates the actual animation
// `stagger` creates a delay between multiple elements (like a wave effect)
import { animate, stagger } from 'animejs';

/**
 * PAGE ENTER ANIMATION
 * ====================
 * Used when a new page appears on screen.
 * 
 * WHAT IT DOES:
 * - Starts with the page invisible (opacity: 0)
 * - Fades it in to fully visible (opacity: 1)
 * - Slides it up from 20px below to its final position
 * 
 * WHY: This makes page transitions feel smooth instead of abrupt.
 * 
 * @param element - The HTML element to animate (usually the page container)
 * @returns The anime.js animation instance (can be used to control/pause)
 */
export const pageEnter = (element: HTMLElement) => {
  return animate(element, {
    opacity: [0, 1],        // Fade in: invisible → visible
    translateY: [20, 0],    // Slide up: 20px below → normal position
    duration: 400,           // Animation takes 400ms (0.4 seconds)
    ease: 'outQuad',         // Starts fast, slows down at end
  });
};

/**
 * PAGE EXIT ANIMATION
 * ===================
 * Used when a page disappears from screen.
 * 
 * WHAT IT DOES:
 * - Starts with the page visible (opacity: 1)
 * - Fades it out to invisible (opacity: 0)
 * - Slides it up 20px as it fades
 * 
 * WHY: Creates a "lifting away" effect as the page disappears.
 * 
 * @param element - The HTML element to animate
 */
export const pageExit = (element: HTMLElement) => {
  return animate(element, {
    opacity: [1, 0],        // Fade out: visible → invisible
    translateY: [0, -20],    // Slide up: normal → 20px above
    duration: 300,           // Faster than enter (300ms)
    ease: 'inQuad',          // Starts slow, speeds up at end
  });
};

/**
 * STAGGER CHILDREN ANIMATION
 * ==========================
 * Animates multiple child elements one after another (like a cascade).
 * 
 * WHAT IT DOES:
 * - Takes an array of elements (like a list of cards)
 * - Animates each one, but with a slight delay between each
 * - Creates a "wave" or "domino" effect
 * 
 * EXAMPLE:
 * If you have 3 cards and stagger is 50ms:
 * - Card 1 starts at 0ms
 * - Card 2 starts at 50ms
 * - Card 3 starts at 100ms
 * 
 * @param elements - Array of HTML elements to animate
 */
export const staggerChildren = (elements: Element[]) => {
  return animate(elements, {
    opacity: [0, 1],        // Each element fades in
    translateY: [20, 0],    // Each element slides up
    duration: 500,           // Each animation takes 500ms
    delay: stagger(50),      // 50ms delay between each element
    ease: 'outQuad',
  });
};

/**
 * CARD HOVER ANIMATION
 * ====================
 * Makes cards grow slightly and show a glow when hovered.
 * 
 * WHAT IT DOES:
 * - When mouse enters: scales up to 102% and adds amber glow
 * - When mouse leaves: returns to normal size and removes glow
 * 
 * WHY: Provides visual feedback that the card is interactive.
 * 
 * @param element - The card element to animate
 * @param isEntering - true when mouse enters, false when it leaves
 */
export const cardHover = (element: HTMLElement, isEntering: boolean) => {
  return animate(element, {
    // Scale: 1.02 = 2% larger, 1 = normal size
    scale: isEntering ? 1.02 : 1,
    // Box shadow: amber glow when hovering, subtle shadow when not
    boxShadow: isEntering 
      ? '0 10px 40px rgba(245, 158, 11, 0.15)'  // Amber glow
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',     // Subtle shadow
    duration: 200,  // Quick 200ms transition
    ease: 'outQuad',
  });
};

/**
 * BUTTON CLICK ANIMATION
 * ======================
 * Makes buttons "bounce" when clicked.
 * 
 * WHAT IT DOES:
 * - Scales down to 95% (press feel)
 * - Then up to 105% (release bounce)
 * - Then back to 100% (settles)
 * 
 * WHY: Gives tactile feedback that the button was pressed.
 * 
 * @param element - The button element to animate
 */
export const buttonClick = (element: HTMLElement) => {
  return animate(element, {
    // Scale sequence: normal → small → big → normal
    scale: [1, 0.95, 1.05, 1],
    duration: 300,
    ease: 'outQuad',
  });
};

/**
 * ICON APPEAR ANIMATION
 * =====================
 * Makes icons "pop" into view with a bounce.
 * 
 * WHAT IT DOES:
 * - Starts invisible and half-size (opacity: 0, scale: 0.5)
 * - Bounces in with overshoot (scale goes past 1.0 then settles)
 * 
 * @param element - The icon element to animate
 * @param delay - Optional delay before starting (in ms)
 */
export const iconAppear = (element: HTMLElement, delay?: number) => {
  return animate(element, {
    opacity: [0, 1],          // Fade in
    scale: [0.5, 1],          // Grow from half-size to full
    duration: 400,
    delay: delay || 0,         // Wait this many ms before starting
    ease: 'outBack(1.7)',      // Bouncy overshoot effect (1.7 = bounce amount)
  });
};

/**
 * TOAST SLIDE IN ANIMATION
 * ========================
 * Makes toast notifications slide in from the right.
 * 
 * WHAT IT DOES:
 * - Starts invisible and 100px to the right
 * - Slides in to its final position and fades in
 * 
 * @param element - The toast element to animate
 */
export const toastSlideIn = (element: HTMLElement) => {
  return animate(element, {
    opacity: [0, 1],            // Fade in
    translateX: [100, 0],       // Slide from right (100px) to position (0)
    duration: 400,
    ease: 'outQuad',
  });
};

/**
 * TOAST SLIDE OUT ANIMATION
 * =========================
 * Makes toast notifications slide out to the right.
 * 
 * WHAT IT DOES:
 * - Starts visible at its position
 * - Slides out to the right and fades out
 * 
 * @param element - The toast element to animate
 */
export const toastSlideOut = (element: HTMLElement) => {
  return animate(element, {
    opacity: [1, 0],            // Fade out
    translateX: [0, 100],       // Slide to the right
    duration: 300,
    ease: 'inQuad',
  });
};

/**
 * SUCCESS CHECK ANIMATION
 * =======================
 * Makes a checkmark icon spin and pop when something succeeds.
 * 
 * WHAT IT DOES:
 * - Starts at 0% size and rotated -180 degrees
 * - Pops to 120% size and rotates to 0 degrees
 * - Settles back to 100% size
 * 
 * WHY: Celebrates success with a satisfying visual.
 * 
 * @param element - The checkmark icon to animate
 */
export const successCheck = (element: HTMLElement) => {
  return animate(element, {
    scale: [0, 1.2, 1],           // Pop: tiny → big → normal
    rotate: [-180, 0],             // Spin: -180° → 0° (half turn)
    duration: 600,
    ease: 'outQuad',
  });
};

/**
 * WAVEFORM PULSE ANIMATION
 * ========================
 * Makes a waveform element pulse based on audio level.
 * 
 * WHAT IT DOES:
 * - Stretches the element vertically based on `level`
 * - Higher level = more stretch
 * 
 * EXAMPLE:
 * If level is 0.5 (50% volume):
 * - scaleY goes from 1 to 1.25 (25% taller) then back
 * 
 * @param element - The waveform bar to animate
 * @param level - Audio level from 0 to 1 (0 = silent, 1 = max)
 */
export const waveformPulse = (element: HTMLElement, level: number) => {
  return animate(element, {
    scaleY: [1, 1 + level * 0.5, 1],  // Stretch vertically
    duration: 100,                       // Very fast (matches audio frames)
    ease: 'outQuad',
  });
};

/**
 * SPEAKER PULSE ANIMATION
 * =======================
 * Makes a speaker icon pulse slowly (like breathing).
 * 
 * WHAT IT DOES:
 * - Grows to 105% size then back to 100%
 * - Loops forever until stopped
 * 
 * WHY: Shows that audio is currently playing.
 * 
 * @param element - The speaker icon to animate
 */
export const speakerPulse = (element: HTMLElement) => {
  return animate(element, {
    scale: [1, 1.05, 1],    // Gentle pulse
    duration: 500,           // 500ms per pulse
    ease: 'inOutQuad',       // Smooth acceleration
    loop: true,              // Keep pulsing forever
  });
};

/**
 * DRAG LIFT ANIMATION
 * ===================
 * Makes an element "lift up" when you start dragging it.
 * 
 * WHAT IT DOES:
 * - Scales up to 105%
 * - Adds a large shadow underneath (like it's floating)
 * 
 * WHY: Gives visual feedback that you're holding the element.
 * 
 * @param element - The element being dragged
 */
export const dragLift = (element: HTMLElement) => {
  return animate(element, {
    scale: 1.05,                                            // 5% larger
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',          // Large shadow
    duration: 200,
    ease: 'outQuad',
  });
};

/**
 * DRAG DROP ANIMATION
 * ===================
 * Makes an element "settle down" when you release it after dragging.
 * 
 * WHAT IT DOES:
 * - Returns to normal size (100%)
 * - Removes the large shadow, returns to subtle shadow
 * - Bounces slightly when settling
 * 
 * @param element - The element being dropped
 */
export const dragDrop = (element: HTMLElement) => {
  return animate(element, {
    scale: 1,                                              // Normal size
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',      // Subtle shadow
    duration: 300,
    ease: 'outBack(1.7)',                                  // Bouncy settle
  });
};
