/**
 * ============================================================================
 * PWA UPDATE NOTIFICATION COMPONENT
 * ============================================================================
 * 
 * This component shows a notification when a new version is available.
 * It allows users to update the app without manually refreshing.
 * 
 * WHY SHOW UPDATE NOTIFICATIONS?
 * ------------------------------
 * - Users know when they have the latest version
 * - Updates can include bug fixes and new features
 * - Offline support improves with each update
 * 
 * ============================================================================
 */

import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * PWAUpdateNotification Component
 * ==============================
 * 
 * Shows update button when new version is available.
 * Shows offline indicator when app is offline.
 */
export function PWAUpdateNotification() {
  /**
   * Get PWA state from the service worker hook
   * 
   * - isOffline: Whether the app is currently offline
   * - updateAvailable: Whether a new version is ready
   * - updateApp: Function to trigger the update
   */
  const { isOffline, updateAvailable, updateApp } = useServiceWorker();

  /**
   * OFFLINE INDICATOR
   * 
   * If the app is offline, show a subtle indicator.
   * This lets users know they might not see the latest content.
   */
  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 backdrop-blur-sm rounded-lg border border-border text-sm">
          <WifiOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Offline</span>
        </div>
      </div>
    );
  }

  /**
   * UPDATE NOTIFICATION
   * 
   * If an update is available, show a button to update.
   * Clicking the button will:
   * 1. Tell the service worker to skip waiting
   * 2. Activate the new service worker
   * 3. Reload the page with the new version
   */
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg shadow-lg">
          <RefreshCw className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Update Available</p>
            <p className="text-xs text-muted-foreground">
              A new version is ready
            </p>
          </div>
          <Button size="sm" onClick={updateApp}>
            Update
          </Button>
        </div>
      </div>
    );
  }

  /**
   * NO UPDATE AVAILABLE
   * 
   * If no update is available and not offline, render nothing.
   */
  return null;
}

/**
 * PWAStatus Component
 * ==================
 * 
 * Shows the current PWA status in the footer or settings.
 * Useful for debugging and showing app version info.
 */
export function PWAStatus() {
  const { isOffline } = useServiceWorker();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </>
      )}
    </div>
  );
}
