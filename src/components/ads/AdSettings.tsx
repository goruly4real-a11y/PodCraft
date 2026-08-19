/**
 * AdSettings Component
 *
 * Allows users to manage their ad preferences.
 * Can disable certain ad types for better UX.
 *
 * @example
 * ```tsx
 * <AdSettings />
 * ```
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';
import { useUIStore } from '@/store';

/** Ad preferences interface */
interface AdPreferences {
  /** Enable banner ads */
  bannerAds: boolean;
  /** Enable interstitial ads */
  interstitialAds: boolean;
  /** Enable video ads */
  videoAds: boolean;
}

/** Default ad preferences */
const DEFAULT_PREFS: AdPreferences = {
  bannerAds: true,
  interstitialAds: true,
  videoAds: true,
};

/** Local storage key for ad preferences */
const STORAGE_KEY = 'podcraft_ad_preferences';

/**
 * AdSettings component for managing ad preferences
 *
 * @returns JSX element with the ad settings form
 */
export default function AdSettings() {
  const { showToast } = useUIStore();
  const [preferences, setPreferences] = useState<AdPreferences>(DEFAULT_PREFS);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFS, ...parsed });
      } catch (e) {
        console.error('Failed to parse ad preferences:', e);
      }
    }
  }, []);

  /**
   * Handle toggle change
   */
  const handleToggle = (key: keyof AdPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  /**
   * Save preferences to localStorage
   */
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setHasChanges(false);
    showToast('Ad preferences saved', 'success');
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Ad Preferences</CardTitle>
        <CardDescription>
          Choose which types of ads you'd like to see. Disabling ads may affect
          the free tier experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Banner Ads */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Banner Ads</p>
            <p className="text-sm text-muted-foreground">
              Display ads at the bottom of pages
            </p>
          </div>
          <button
            onClick={() => handleToggle('bannerAds')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.bannerAds ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.bannerAds ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Interstitial Ads */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Interstitial Ads</p>
            <p className="text-sm text-muted-foreground">
              Full-screen ads after generating podcasts
            </p>
          </div>
          <button
            onClick={() => handleToggle('interstitialAds')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.interstitialAds ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.interstitialAds ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Video Ads */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Video Ads</p>
            <p className="text-sm text-muted-foreground">
              Short video ads during loading states
            </p>
          </div>
          <button
            onClick={() => handleToggle('videoAds')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.videoAds ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.videoAds ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button onClick={handleSave} className="w-full mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
