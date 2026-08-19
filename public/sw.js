/**
 * ============================================================================
 * SERVICE WORKER - Offline Support & Caching
 * ============================================================================
 * 
 * This is a service worker that enables offline functionality for the PWA.
 * 
 * WHAT IS A SERVICE WORKER?
 * -------------------------
 * A service worker is a script that runs in the background of your browser.
 * It acts as a proxy between your app and the network.
 * 
 * WHAT CAN SERVICE WORKERS DO?
 * ----------------------------
 * - Cache files for offline use
 * - Intercept network requests
 * - Serve cached content when offline
 * - Send push notifications
 * - Sync data in the background
 * 
 * HOW SERVICE WORKERS WORK:
 * ------------------------
 * 1. Browser registers the service worker
 * 2. Service worker installs (caches files)
 * 3. Service worker activates (cleans old caches)
 * 4. Service worker intercepts fetch requests
 * 5. Service worker serves cached content or fetches from network
 * 
 * IMPORTANT: Service workers run on a separate thread!
 * This means they can't access the DOM or window object.
 * They're like a background worker that handles network requests.
 * 
 * ============================================================================
 */

/**
 * CACHE NAME
 * 
 * This is the name of the cache where we store files.
 * When you update files, change this name to invalidate old caches.
 * 
 * Example: 'podcraft-v2' will be a different cache than 'podcraft-v1'
 */
const CACHE_NAME = 'podcraft-v1';

/**
 * FILES TO CACHE
 * 
 * These are the files that will be available offline.
 * When the service worker installs, it caches all these files.
 * 
 * IMPORTANT: These must be relative to the service worker file.
 * 
 * WHAT TO CACHE:
 * - index.html: The main HTML file
 * - CSS files: Styling
 * - JavaScript files: App logic
 * - Icons: App icons for the home screen
 * 
 * WHAT NOT TO CACHE:
 * - API responses (they change frequently)
 * - Audio files (too large)
 * - User-uploaded content
 */
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/**
 * ============================================================================
 * INSTALL EVENT
 * ============================================================================
 * 
 * Fires when the service worker is first installed.
 * This is where we cache all the files we need for offline use.
 * 
 * THE INSTALL FLOW:
 * ----------------
 * 1. open() creates a new cache
 * 2. addAll() fetches and caches all files
 * 3. waitUntil() tells the browser to wait until caching is done
 * 
 * ============================================================================
 */
self.addEventListener('install', (event) => {
  /**
   * event.waitUntil()
   * 
   * This tells the browser: "Don't finish installing until this Promise resolves."
   * If we don't wait, the service worker might activate before caching is done.
   */
  event.waitUntil(
    /**
     * caches.open()
     * 
     * Opens (or creates) a cache with the specified name.
     * Returns a Promise that resolves to a Cache object.
     */
    caches.open(CACHE_NAME).then((cache) => {
      /**
       * cache.addAll()
       * 
       * Fetches all URLs and adds them to the cache.
       * If any fetch fails, the entire install fails.
       * 
       * This is important! If a file can't be cached,
       * the service worker won't install, and offline won't work.
       */
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

/**
 * ============================================================================
 * ACTIVATE EVENT
 * ============================================================================
 * 
 * Fires when the service worker is activated (ready to control the page).
 * This is where we clean up old caches.
 * 
 * WHY CLEAN UP?
 * -------------
 * When we change CACHE_NAME (e.g., 'podcraft-v1' → 'podcraft-v2'),
 * the old cache still exists. We need to delete it to save space.
 * 
 * ============================================================================
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    /**
     * caches.keys()
     * 
     * Returns a Promise that resolves to an array of all cache names.
     * Example: ['podcraft-v1', 'podcraft-v2']
     */
    caches.keys().then((cacheNames) => {
      /**
       * Promise.all()
       * 
       * Waits for ALL promises to resolve.
       * We use this because we might need to delete multiple caches.
       */
      return Promise.all(
        /**
         * .filter()
         * 
         * Keep only caches that are NOT the current version.
         * We want to delete old versions, not the current one.
         */
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          /**
           * .map()
           * 
           * Delete each old cache.
           * caches.delete() returns a Promise.
           */
          .map((name) => caches.delete(name))
      );
    })
  );
});

/**
 * ============================================================================
 * FETCH EVENT
 * ============================================================================
 * 
 * Fires whenever the app makes a network request (fetch, image load, etc.).
 * This is where we implement our caching strategy.
 * 
 * CACHING STRATEGIES:
 * -------------------
 * 1. Cache First: Try cache, fall back to network
 * 2. Network First: Try network, fall back to cache
 * 3. Stale While Revalidate: Serve cache, update in background
 * 
 * We use "Cache First" for static assets (fast, offline support)
 * and "Network First" for API calls (always fresh data)
 * 
 * ============================================================================
 */
self.addEventListener('fetch', (event) => {
  /**
   * event.respondWith()
   * 
   * Tells the browser: "I'll handle this request myself."
   * Without this, the browser would make a normal network request.
   */
  event.respondWith(
    /**
     * caches.match()
     * 
     * Checks if the request URL is in our cache.
     * Returns a Promise that resolves to a Response or undefined.
     */
    caches.match(event.request).then((cachedResponse) => {
      /**
       * CACHE FIRST STRATEGY
       * 
       * If we have a cached version, use it.
       * Otherwise, fetch from the network.
       * 
       * This is great for:
       * - HTML files (rarely change)
       * - CSS files (rarely change)
       * - JavaScript files (change with updates)
       * - Icons (never change)
       * 
       * This is NOT good for:
       * - API responses (always fresh)
       * - User-uploaded content (unique per user)
       * - Audio files (too large to cache)
       */
      if (cachedResponse) {
        return cachedResponse;
      }

      /**
       * NETWORK FALLBACK
       * 
       * If not in cache, fetch from network.
       * We clone the response because responses can only be read once.
       * 
       * The flow:
       * 1. Fetch from network
       * 2. Clone the response (one for browser, one for cache)
       * 3. Return original response to browser
       * 4. Add cloned response to cache
       */
      return fetch(event.request).then((networkResponse) => {
        /**
         * VALIDATE RESPONSE
         * 
         * Only cache successful responses (status 200).
         * Also only cache same-origin requests (not external APIs).
         * 
         * response.type:
         * - 'basic': Same origin
         * - 'cors': Cross-origin with CORS
         * - 'opaque': Cross-origin without CORS (can't read)
         */
        if (
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          /**
           * CLONE AND CACHE
           * 
           * We clone because:
           * 1. Response can only be read once
           * 2. We need to return the original to the browser
           * 3. We want to store a copy in the cache
           */
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        /**
         * RETURN RESPONSE
         * 
         * Return the network response to the browser.
         * The browser will display it normally.
         */
        return networkResponse;
      });
    })
  );
});

/**
 * ============================================================================
 * MESSAGE EVENT
 * ============================================================================
 * 
 * Fires when the app sends a message to the service worker.
 * This is used for cache invalidation and updates.
 * 
 * USAGE:
 * ------
 * In your app: navigator.serviceWorker.postMessage({ type: 'SKIP_WAITING' })
 * 
 * ============================================================================
 */
self.addEventListener('message', (event) => {
  /**
   * SKIP_WAITING
   * 
   * Tells the service worker to skip the waiting phase
   * and activate immediately. This is used when:
   * - A new version is available
   * - We want to update immediately
   * 
   * The flow:
   * 1. New service worker installs (caches new files)
   * 2. Old service worker is still controlling the page
   * 3. We call skipWaiting()
   * 4. New service worker activates immediately
   * 5. New service worker takes control
   */
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
