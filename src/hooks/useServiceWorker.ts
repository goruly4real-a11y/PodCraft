/**
 * ============================================================================
 * useServiceWorker HOOK - PWA Registration
 * ============================================================================
 * 
 * This hook handles registering the service worker for PWA functionality.
 * 
 * WHAT IS A PWA?
 * -------------
 * PWA stands for Progressive Web App. It's a web app that:
 * - Can be installed on your phone/home screen
 * - Works offline
 * - Loads fast (cached assets)
 * - Feels like a native app
 * 
 * HOW PWAS WORK:
 * --------------
 * 1. Service worker registers (background script)
 * 2. Service worker installs (caches files)
 * 3. Service worker activates (ready to use)
 * 4. App can be installed (manifest.json)
 * 5. Works offline (cached content)
 * 
 * ============================================================================
 */

import { useEffect, useState } from 'react';

/**
 * useServiceWorker Hook
 * ====================
 * 
 * USAGE:
 * ------
 * function App() {
 *   const { isOffline, updateAvailable } = useServiceWorker();
 *   
 *   if (isOffline) {
 *     return <p>You are offline</p>;
 *   }
 * }
 * 
 * @returns Object with offline status and update availability
 */
export function useServiceWorker() {
  /**
   * State Variables
   * 
   * isOffline: Whether the app is currently offline
   * updateAvailable: Whether a new version is available
   */
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  /**
   * EFFECT: Register Service Worker
   * 
   * This runs once when the component mounts.
   * It registers the service worker and sets up event listeners.
   */
  useEffect(() => {
    /**
     * CHECK BROWSER SUPPORT
     * 
     * Not all browsers support service workers.
     * We check for 'serviceWorker' in navigator before proceeding.
     * 
     * Supported browsers:
     * - Chrome 45+
     * - Firefox 44+
     * - Safari 11.1+
     * - Edge 17+
     */
    if ('serviceWorker' in navigator) {
      /**
       * REGISTER SERVICE WORKER
       * 
       * navigator.serviceWorker.register() registers the service worker file.
       * 
       * The path '/sw.js' must be relative to the root.
       * Service workers can only control pages in their scope.
       * 
       * Scope: The service worker can control all pages under '/'
       */
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          /**
           * REGISTRATION SUCCESSFUL
           * 
           * registration.scope: The URL scope of the service worker
           * registration.installing: The installing worker
           * registration.waiting: The waiting worker
           * registration.active: The active worker
           */
          console.log('Service Worker registered with scope:', registration.scope);

          /**
           * CHECK FOR UPDATES
           * 
           * registration.update() checks for a new service worker.
           * This happens automatically, but we can trigger it manually.
           */
          registration.addEventListener('updatefound', () => {
            /**
             * NEW SERVICE WORKER FOUND
             * 
             * A new service worker is being installed.
             * This means there's an update available.
             */
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                /**
                 * STATE CHANGE
                 * 
                 * The service worker's state changed.
                 * 'installed' means it's ready to activate.
                 * 'activated' means it's now controlling the page.
                 */
                if (newWorker.state === 'installed') {
                  /**
                   * UPDATE AVAILABLE
                   * 
                   * If there's already an active controller,
                   * it means this is an update (not first install).
                   */
                  if (navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          /**
           * REGISTRATION FAILED
           * 
           * This can happen if:
           * - sw.js doesn't exist
           * - Wrong path
           * - HTTPS required (service workers need HTTPS)
           * - Browser doesn't support service workers
           */
          console.error('Service Worker registration failed:', error);
        });

      /**
       * LISTEN FOR CONTROLLER CHANGE
       * 
       * When a new service worker takes control,
       * reload the page to use the new version.
       */
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        /**
         * RELOAD PAGE
         * 
         * A new service worker is now controlling the page.
         * We reload to ensure all content is from the new version.
         */
        window.location.reload();
      });
    }

    /**
     * LISTEN FOR ONLINE/OFFLINE STATUS
     * 
     * The browser fires these events when connectivity changes.
     * We update our state accordingly.
     */
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    /**
     * CLEANUP
     * 
     * Remove event listeners when the component unmounts.
     * This prevents memory leaks.
     */
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * updateApp Function
   * =================
   * 
   * Triggers an app update by telling the service worker to skip waiting.
   * 
   * THE UPDATE FLOW:
   * ---------------
   * 1. New service worker is installed (in background)
   * 2. User clicks "Update"
   * 3. We send SKIP_WAITING message to service worker
   * 4. Service worker activates immediately
   * 5. New service worker takes control
   * 6. Page reloads with new version
   */
  const updateApp = () => {
    if (navigator.serviceWorker.controller) {
      /**
       * SEND MESSAGE TO SERVICE WORKER
       * 
       * postMessage() sends data to the service worker.
       * We send a type: 'SKIP_WAITING' message.
       * The service worker listens for this and calls skipWaiting().
       */
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING',
      });
    }
  };

  /**
   * Return values
   * 
   * - isOffline: Whether the app is offline
   * - updateAvailable: Whether an update is available
   * - updateApp: Function to trigger the update
   */
  return {
    isOffline,
    updateAvailable,
    updateApp,
  };
}
