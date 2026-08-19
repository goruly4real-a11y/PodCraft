/**
 * AdBanner Component
 *
 * Displays a banner ad from AdCombo or PropellerAds.
 * Supports multiple sizes and ad networks.
 *
 * @example
 * ```tsx
 * <AdBanner
 *   network="adcombo"
 *   size="728x90"
 *   className="my-4"
 * />
 * ```
 */

import { useEffect, useRef } from 'react';

/** Supported ad banner sizes */
type AdSize = '728x90' | '300x250' | '160x600' | '320x50';

/** Supported ad networks */
type AdNetwork = 'adcombo';

/** Props for AdBanner component */
interface AdBannerProps {
  /** Ad network to use */
  network: AdNetwork;
  /** Banner size */
  size?: AdSize;
  /** Additional CSS classes */
  className?: string;
  /** Container ID for the ad */
  containerId?: string;
}

/** Size dimensions mapping */
const SIZE_DIMENSIONS: Record<AdSize, { width: string; height: string }> = {
  '728x90': { width: '728px', height: '90px' },
  '300x250': { width: '300px', height: '250px' },
  '160x600': { width: '160px', height: '600px' },
  '320x50': { width: '320px', height: '50px' },
};

/**
 * AdBanner component for displaying banner ads
 *
 * @param props - Component props
 * @returns JSX element with the banner ad
 */
export default function AdBanner({
  network,
  size = '728x90',
  className = '',
  containerId,
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = SIZE_DIMENSIONS[size];

  useEffect(() => {
    // Ad loading logic will go here
    // For now, we'll show a placeholder
    console.log(`[AdBanner] Loading ${network} ad (${size})`);
  }, [network, size]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`ad-banner ad-banner-${network} ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d',
      }}
      data-network={network}
      data-size={size}
    >
      <span>Advertisement</span>
    </div>
  );
}
