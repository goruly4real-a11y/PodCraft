/**
 * VideoAd Component
 *
 * Displays a video ad from AdCombo in a fixed position.
 * Typically shown during loading states or after podcast generation.
 *
 * @example
 * ```tsx
 * <VideoAd
 *   isOpen={showVideoAd}
 *   onClose={() => setShowVideoAd(false)}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';

/** Props for VideoAd component */
interface VideoAdProps {
  /** Whether the ad is currently open */
  isOpen: boolean;
  /** Callback when ad is closed */
  onClose: () => void;
  /** Optional ad container ID */
  containerId?: string;
}

/**
 * VideoAd component for displaying video ads
 *
 * @param props - Component props
 * @returns JSX element with the video ad or null
 */
export default function VideoAd({
  isOpen,
  onClose,
  containerId = 'video-ad-container',
}: VideoAdProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load AdCombo video ad
      console.log('[VideoAd] Loading video ad');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={videoRef}
      className="video-ad"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        height: '180px',
        background: 'black',
        borderRadius: '8px',
        overflow: 'hidden',
        zIndex: 9998,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close video ad"
      >
        ×
      </button>

      {/* Video container */}
      <div
        id={containerId}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
        }}
      >
        <span style={{ color: '#6c757d', fontSize: '14px' }}>
          Loading video ad...
        </span>
      </div>

      {/* Ad label */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
        }}
      >
        Ad
      </div>
    </div>
  );
}
