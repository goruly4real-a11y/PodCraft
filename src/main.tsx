/**
 * ============================================================================
 * MAIN ENTRY POINT - App Initialization
 * ============================================================================
 * 
 * This is the entry point of the React application.
 * It's the first file that runs when the app starts.
 * 
 * WHAT THIS FILE DOES:
 * -------------------
 * 1. Imports React and necessary libraries
 * 2. Finds the root HTML element (#root)
 * 3. Renders the App component into it
 * 4. Wraps App with necessary providers (Router, StrictMode)
 * 
 * ============================================================================
 */

// Import StrictMode from React
// StrictMode enables extra checks during development:
// - Warns about deprecated usage
// - Detects unexpected side effects
// - Ensures reusable state
import { StrictMode } from 'react';

// Import createRoot from React DOM
// createRoot is the modern way to render React apps (React 18+)
import { createRoot } from 'react-dom/client';

// Import BrowserRouter for client-side routing
// This enables URL-based navigation without page reloads
import { BrowserRouter } from 'react-router-dom';

// Import the main App component
import App from './App';

// Import global CSS styles (Tailwind CSS)
import './index.css';

/**
 * RENDER THE APP
 * 
 * document.getElementById('root') finds the <div id="root"> in index.html
 * The ! (non-null assertion) tells TypeScript this element definitely exists
 * 
 * createRoot() creates a React root (the top-level container)
 * .render() renders the React tree into the root
 * 
 * THE COMPONENT TREE:
 * -------------------
 * StrictMode
 *   └── BrowserRouter
 *         └── App
 *               └── Routes
 *                     └── Pages...
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

/**
 * REGISTER SERVICE WORKER (PWA offline support)
 *
 * Only runs in production builds — registering in dev would serve stale
 * cached assets while you're editing code.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
