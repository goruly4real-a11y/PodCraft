/**
 * AdCombo Ad Network Integration
 *
 * Provides utilities for integrating AdCombo ads (interstitial, video, native)
 * into PodCraft. AdCombo supports .pages.dev domains and has a $10 minimum payout.
 *
 * @example
 * ```typescript
 * import { loadAdComboScript, showInterstitial } from '@/lib/adcombo';
 *
 * // Load AdCombo script
 * await loadAdComboScript('your-publisher-id');
 *
 * // Show interstitial ad
 * showInterstitial('container-id');
 * ```
 *
 * @see https://adcombo.com
 */

/** AdCombo publisher ID from environment */
const ADCOMBO_PUBLISHER_ID = import.meta.env.VITE_ADCOMBO_PUBLISHER_ID;

/** AdCombo script URL */
const ADCOMBO_SCRIPT_URL = 'https://acdn.adnxs.com/dsp/ads/px.js';

/** Track if script is already loaded */
let scriptLoaded = false;

/**
 * Load the AdCombo JavaScript SDK
 *
 * @param publisherId - Your AdCombo publisher ID
 * @returns Promise that resolves when script is loaded
 *
 * @example
 * ```typescript
 * await loadAdComboScript('12345');
 * ```
 */
export async function loadAdComboScript(publisherId?: string): Promise<void> {
  const id = publisherId || ADCOMBO_PUBLISHER_ID;

  if (!id) {
    console.warn('[AdCombo] No publisher ID provided');
    return;
  }

  if (scriptLoaded) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ADCOMBO_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load AdCombo script'));
    document.head.appendChild(script);
  });
}

/**
 * Show an interstitial ad in a container
 *
 * @param containerId - DOM element ID for the ad container
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * showInterstitial('ad-container', {
 *   width: 300,
 *   height: 250
 * });
 * ```
 */
export function showInterstitial(
  containerId: string,
  options?: { width?: number; height?: number }
): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[AdCombo] Container #${containerId} not found`);
    return;
  }

  // AdCombo interstitial code will be injected here
  // Replace with actual AdCombo integration code
  container.innerHTML = `
    <div class="adcombo-interstitial" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div class="ad-container" style="
        width: ${options?.width || 300}px;
        height: ${options?.height || 250}px;
        background: white;
        position: relative;
      ">
        <button class="close-btn" style="
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
        " onclick="this.parentElement.parentElement.remove()">×</button>
        <!-- AdCombo ad unit will load here -->
      </div>
    </div>
  `;
}

/**
 * Show a video ad in a container
 *
 * @param containerId - DOM element ID for the ad container
 * @param videoUrl - Optional video URL
 *
 * @example
 * ```typescript
 * showVideoAd('video-container');
 * ```
 */
export function showVideoAd(
  containerId: string,
  _videoUrl?: string
): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[AdCombo] Container #${containerId} not found`);
    return;
  }

  // AdCombo video ad code will be injected here
  container.innerHTML = `
    <div class="adcombo-video" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      height: 180px;
      background: black;
      border-radius: 8px;
      overflow: hidden;
      z-index: 9998;
    ">
      <button class="close-btn" style="
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        z-index: 1;
      " onclick="this.parentElement.remove()">×</button>
      <!-- Video ad will load here -->
    </div>
  `;
}

/**
 * Remove all AdCombo ads from the page
 *
 * @example
 * ```typescript
 * removeAllAdComboAds();
 * ```
 */
export function removeAllAdComboAds(): void {
  const ads = document.querySelectorAll('.adcombo-interstitial, .adcombo-video');
  ads.forEach(ad => ad.remove());
}

export default {
  loadAdComboScript,
  showInterstitial,
  showVideoAd,
  removeAllAdComboAds,
};
