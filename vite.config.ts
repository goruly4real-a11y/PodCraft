/**
 * ============================================================================
 * VITE CONFIGURATION - Build Tool Settings
 * ============================================================================
 * 
 * This file configures Vite, the build tool used by this project.
 * 
 * WHAT IS VITE?
 * ------------
 * Vite is a fast build tool for modern web apps. It:
 * - Starts a development server (for local development)
 * - Bundles your code for production
 * - Handles TypeScript, JSX, CSS, and more
 * 
 * WHY VITE?
 * --------
 * - Lightning fast hot reload (changes appear instantly)
 * - Simple configuration
 * - Great defaults (no complex setup needed)
 * 
 * ============================================================================
 */

// Import defineConfig from Vite (helps with TypeScript autocompletion)
import { defineConfig } from 'vite';

// Import React plugin (enables JSX and React features)
import react from '@vitejs/plugin-react';

// Import Tailwind CSS plugin (enables Tailwind in Vite)
import tailwindcss from '@tailwindcss/vite';

// Import path module (for resolving file paths)
import path from 'path';

/**
 * Vite Configuration
 * 
 * export default defineConfig({...}) exports the configuration.
 * defineConfig wraps the config object with TypeScript types.
 */
export default defineConfig({
  /**
   * PLUGINS
   * 
   * Plugins extend Vite's functionality.
   * - react(): Enables React JSX, fast refresh, etc.
   * - tailwindcss(): Enables Tailwind CSS processing
   */
  plugins: [react(), tailwindcss()],

  /**
   * RESOLVE CONFIGURATION
   * 
   * Path aliases let you import files using @ instead of relative paths.
   * 
   * Example:
   * - Without alias: import { Button } from '../../../components/ui/Button'
   * - With alias: import { Button } from '@/components/ui/Button'
   * 
   * The @ symbol resolves to the ./src directory.
   */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  /**
   * DEVELOPMENT SERVER
   * 
   * These settings only apply during development (npm run dev).
   * 
   * - port: 5173 - The port to run on (default is 5173)
   * - host: true - Allow access from other devices on your network
   *   (useful for testing on your phone)
   */
  server: {
    port: 5173,
    host: true,
  },
});
