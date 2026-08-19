/**
 * InterstitialAd Component
 *
 * Displays a full-screen interstitial ad from AdCombo.
 * Typically shown after podcast generation or during natural pauses.
 *
 * @example
 * ```tsx
 * <InterstitialAd
 *   isOpen={showAd}
 *   onClose={() => setShowAd(false)}
 * />
 * ```
 */

import { useEffect, useCallback } from 'react';

/** Props for InterstitialAd component */
interface InterstitialAdProps {
  /** Whether the ad is currently open */
  isOpen: boolean;
  /** Callback when ad is closed */
  onClose: () => void;
  /** Optional ad container ID */
  containerId?: string;
}

/**
 * InterstitialAd component for displaying full-screen interstitial ads
 *
 * @param props - Component props
 * @returns JSX element with the interstitial ad or null
 */
export default function InterstitialAd({
  isOpen,
  onClose,
  containerId = 'interstitial-container',
}: InterstitialAdProps) {
  /**
   * Handle escape key press to close ad
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      // Load AdCombo interstitial ad
      console.log('[InterstitialAd] Loading interstitial ad');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="interstitial-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="interstitial-content"
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close ad"
        >
          ×
        </button>

        {/* Ad container */}
        <div
          id={containerId}
          style={{
            width: '300px',
            height: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#6c757d', fontSize: '14px' }}>
            Loading ad...
          </span>
        </div>

        {/* Skip link after delay */}
        <div
          style={{
            padding: '10px',
            textAlign: 'center',
            background: '#f8f9fa',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            Skip Ad
          </button>
        </div>
      </div>
    </div>
  );
}
