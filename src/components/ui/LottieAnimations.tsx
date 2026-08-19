/**
 * ============================================================================
 * LOTTIE ANIMATION COMPONENTS
 * ============================================================================
 * 
 * WHAT IS LOTTIE?
 * ---------------
 * Lottie is a library that renders Adobe After Effects animations in real-time.
 * Instead of heavy video files, you get tiny JSON files that describe how to
 * draw each frame. This means:
 * - Tiny file sizes (KB instead of MB)
 * - Scalable to any size without losing quality
 * - Smooth animations at 60fps
 * 
 * HOW LOTTIE WORKS:
 * -----------------
 * 1. Designer creates animation in After Effects
 * 2. Exports as JSON file (describes paths, colors, movements)
 * 3. Lottie library reads the JSON and draws each frame
 * 4. Result: smooth animation in the browser
 * 
 * THE DOTLOTTIE FORMAT:
 * ---------------------
 * .dotLottie is a compressed version of Lottie files.
 * It's like a ZIP file for animations - smaller download size.
 * 
 * ============================================================================
 */

// Import the DotLottie React component
// This is a pre-built component that handles all the Lottie rendering
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * Props for all Lottie animation components
 * 
 * width: How wide the animation should be (CSS value)
 * height: How tall the animation should be (CSS value)
 * className: Additional CSS classes to apply
 */
interface LottieAnimationProps {
  width?: string;
  height?: string;
  className?: string;
}

/**
 * CraftingAnimation Component
 * ==========================
 * 
 * Shows a "crafting" or "loading" animation.
 * Used when generating podcasts or loading content.
 * 
 * WHAT IT LOOKS LIKE:
 * -------------------
 * Usually shows spinning gears, loading dots, or a progress indicator.
 * The animation is embedded as a data URL (base64 encoded) so we don't
 * need external files.
 */
export function CraftingAnimation({
  width = '200px',
  height = '200px',
  className = '',
}: LottieAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/**
       * DotLottieReact Component
       * 
       * The `src` prop contains the animation data as a data URL.
       * This is a base64-encoded string that contains the entire
       * Lottie animation. It looks like:
       * "data:application/json;base64,eyJ2ZXJ..."
       * 
       * This approach means:
       * - No external files to load
       * - Animation is bundled with the component
       * - Works offline
       * 
       * `autoplay` makes it play immediately
       * `loop` makes it repeat forever
       */}
      <DotLottieReact
        src="data:application/json;base64,eyJ2ZXJzaW9uIjoiMy4wIiwicGF0aHMiOlsiYTNiZjUyOWEtMjFhOC00MTM2LWExZjktYjJjMjExMjM0NTg0Il0sImxheWVycyI6W3sibmFtZSI6IkxheWVyIDEiLCJzaGFwZXMiOlt7ImlkIjoiYTNiZjUyOWEtMjFhOC00MTM2LWExZjktYjJjMjExMjM0NTg0IiwidHlwZSI6ImNpcmNsZSIsImNvbnRyb2xzIjpbeyJ0eXBlIjoiZmlsbCIsImNvbG9yIjoiI0Y1OUVGQiIsIm9wYWNpdHkiOjF9XSwiY2VudGVyIjpbMC41LDAuNV0sInJhZGl1cyI6MC4zLCJwb3NpdGlvbiI6WzAuNSwwLjVdLCJzaXplIjpbMSwxXSx9XX1dfQ=="
        autoplay
        loop
        style={{ width, height }}
      />
    </div>
  );
}

/**
 * SuccessAnimation Component
 * =========================
 * 
 * Shows a checkmark or success indicator.
 * Used after successfully creating a podcast or speaker.
 * 
 * WHAT IT LOOKS LIKE:
 * -------------------
 * Usually a circle with a checkmark that pops in and bounces.
 */
export function SuccessAnimation({
  width = '150px',
  height = '150px',
  className = '',
}: LottieAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src="data:application/json;base64,eyJ2ZXJzaW9uIjoiMy4wIiwicGF0aHMiOlsiYThkMjI4N2QtMmNlZi00OTFhLWI5Y2YtYjNlMzFkZjg5MjAiXSwibGF5ZXJzIjpbeyJuYW1lIjoiTGF5ZXIgMSIsInNoYXBlcyI6eyJpZCI6ImE4ZDIyODdkLTJjZWYtNDkxYS1iOWNmLWIzZTMxZGY4OTIwIiwidHlwZSI6ImNpcmNsZSIsImNvbnRyb2xzIjpbeyJ0eXBlIjoiZmlsbCIsImNvbG9yIjoiIzEwQjk4MSIsIm9wYWNpdHkiOjF9XSwiY2VudGVyIjpbMC41LDAuNV0sInJhZGl1cyI6MC40LCJwb3NpdGlvbiI6WzAuNSwwLjVdLCJzaXplIjpbMSwxXSx9XX1dfQ=="
        autoplay
        loop={false}
        style={{ width, height }}
      />
    </div>
  );
}

/**
 * EmptyStateAnimation Component
 * ============================
 * 
 * Shows an animation for empty states.
 * Used when there are no podcasts, no speakers, etc.
 * 
 * WHAT IT LOOKS LIKE:
 * -------------------
 * Usually shows an empty box, folder, or ghost-like figure.
 */
export function EmptyStateAnimation({
  width = '250px',
  height = '250px',
  className = '',
}: LottieAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src="data:application/json;base64,eyJ2ZXJzaW9uIjoiMy4wIiwicGF0aHMiOlsiNjJjMWM5Y2ItY2Q5Yi00N2JjLThjZTktYWRlMDQ2MTc4ODcyIl0sImxheWVycyI6W3sibmFtZSI6IkxheWVyIDEiLCJzaGFwZXMiOlt7ImlkIjoiNjJjMWM5Y2ItY2Q5Yi00N2JjLThjZTktYWRlMDQ2MTc4ODcyIiwidHlwZSI6ImNpcmNsZSIsImNvbnRyb2xzIjpbeyJ0eXBlIjoiZmlsbCIsImNvbG9yIjoiIzhCNUNGNiIsIm9wYWNpdHkiOjF9XSwiY2VudGVyIjpbMC41LDAuNV0sInJhZGl1cyI6MC4zLCJwb3NpdGlvbiI6WzAuNSwwLjVdLCJzaXplIjpbMSwxXSx9XX1dfQ=="
        autoplay
        loop
        style={{ width, height }}
      />
    </div>
  );
}

/**
 * AudioWaveAnimation Component
 * ===========================
 * 
 * Shows animated audio waves.
 * Used when audio is playing or loading.
 * 
 * WHAT IT LOOKS LIKE:
 * -------------------
 * Animated bars that move up and down like sound waves.
 */
export function AudioWaveAnimation({
  width = '100px',
  height = '50px',
  className = '',
}: LottieAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src="data:application/json;base64,eyJ2ZXJzaW9uIjoiMy4wIiwicGF0aHMiOlsiYjM1NjYwMzItYmFhZC00ZjFlLWExNjYtZjQ2YTBiY2EyNjVkIl0sImxheWVycyI6W3sibmFtZSI6IkxheWVyIDEiLCJzaGFwZXMiOlt7ImlkIjoiYjM1NjYwMzItYmFhZC00ZjFlLWExNjYtZjQ2YTBiY2EyNjVkIiwidHlwZSI6InJlY3QiLCJjb250cm9scyI6W3sidHlwZSI6ImZpbGwiLCJjb2xvciI6IiNGRTZDMDQiLCJvcGFjaXR5IjoxfV0sImNlbnRlciI6WzAuNSwwLjVdLCJzaXplIjpbMC4xLDAuOF0sInBvc2l0aW9uIjpbMC4xLDAuNV0sInJvdGF0aW9uIjpbMF19XX1dfQ=="
        autoplay
        loop
        style={{ width, height }}
      />
    </div>
  );
}
