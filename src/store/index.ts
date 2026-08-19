/**
 * ============================================================================
 * STATE MANAGEMENT - Zustand Stores
 * ============================================================================
 * 
 * This file contains all the global state management for the app.
 * We use Zustand, a lightweight state management library for React.
 * 
 * WHAT IS STATE MANAGEMENT?
 * -------------------------
 * In React, "state" is data that changes over time. For example:
 * - Is the user logged in? (auth state)
 * - What speakers exist? (speaker state)
 * - Is a podcast generating? (podcast state)
 * 
 * Without state management, each component would have its own state,
 * making it hard to share data between components.
 * 
 * ZUSTAND EXPLAINED:
 * ------------------
 * Zustand creates "stores" - containers for state that any component can access.
 * 
 * Key concepts:
 * - Store: A container for state and functions to modify it
 * - State: The current data (e.g., { user: null, loading: true })
 * - Actions: Functions that modify state (e.g., setUser, addSpeaker)
 * - Selector: A function that extracts specific state from the store
 * 
 * HOW TO USE A STORE:
 * -------------------
 * 1. Import the store hook: import { useAuthStore } from '@/store'
 * 2. In your component: const { user, setUser } = useAuthStore()
 * 3. Read state: <p>{user?.email}</p>
 * 4. Call actions: setUser(null)
 * 
 * ============================================================================
 */

// Import the `create` function from Zustand
// This function creates a new store with state and actions
import { create } from 'zustand';

// Import Supabase's User type (defines what a user object looks like)
import type { User } from '@supabase/supabase-js';

// Import our custom types for Speaker and Podcast
import type { Speaker, Podcast } from '@/types';

/**
 * ============================================================================
 * AUTH STATE STORE
 * ============================================================================
 * 
 * Manages authentication state:
 * - Who is logged in?
 * - Is the app still checking auth status?
 * 
 * WHY DO WE NEED THIS?
 * --------------------
 * Many components need to know:
 * - If the user is logged in (to show/hide content)
 * - Who the user is (to fetch their data)
 * - If auth is still loading (to show loading spinner)
 * 
 * ============================================================================
 */

/**
 * AuthState Interface
 * ===================
 * Defines the shape of the auth state.
 * This is like a blueprint for what data the store contains.
 */
interface AuthState {
  /** The currently logged-in user, or null if not logged in */
  user: User | null;
  
  /** Whether the app is still checking authentication status */
  loading: boolean;
  
  /**
   * Sets the current user
   * @param user - The user object, or null to log out
   */
  setUser: (user: User | null) => void;
  
  /**
   * Sets the loading state
   * @param loading - true if still checking auth, false if done
   */
  setLoading: (loading: boolean) => void;
}

/**
 * Create the Auth Store
 * 
 * create<AuthState> tells TypeScript what shape the state has.
 * The function passed to create returns the initial state and actions.
 * 
 * (set) is a function provided by Zustand that updates the state.
 * When you call set({ user: newUser }), it merges the new state.
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state values
  user: null,          // No user logged in initially
  loading: true,       // Start in loading state (checking auth)
  
  /**
   * Actions (functions that modify state)
   * 
   * setUser: Replaces the entire user object
   * Example: setUser(someUser) → state.user = someUser
   */
  setUser: (user) => set({ user }),
  
  /**
   * setLoading: Updates the loading flag
   * Example: setLoading(false) → state.loading = false
   */
  setLoading: (loading) => set({ loading }),
}));

/**
 * ============================================================================
 * SPEAKER STATE STORE
 * ============================================================================
 * 
 * Manages speaker data:
 * - List of all speakers
 * - Which speakers are selected (for podcast creation)
 * - Loading and error states
 * 
 * ============================================================================
 */

interface SpeakerState {
  /** Array of all the user's speakers */
  speakers: Speaker[];
  
  /** Array of selected speaker IDs (for creating a podcast) */
  selectedSpeakers: string[];
  
  /** Whether speakers are currently being loaded */
  loading: boolean;
  
  /** Error message if something went wrong, or null if no error */
  error: string | null;
  
  /** Replaces the entire speakers array */
  setSpeakers: (speakers: Speaker[]) => void;
  
  /** Adds a new speaker to the list */
  addSpeaker: (speaker: Speaker) => void;
  
  /** Updates a specific speaker by ID */
  updateSpeaker: (id: string, updates: Partial<Speaker>) => void;
  
  /** Removes a speaker by ID */
  removeSpeaker: (id: string) => void;
  
  /** Replaces the entire selectedSpeakers array */
  setSelectedSpeakers: (ids: string[]) => void;
  
  /** Toggles a speaker's selection (adds if not selected, removes if selected) */
  toggleSpeaker: (id: string) => void;
  
  /** Updates loading state */
  setLoading: (loading: boolean) => void;
  
  /** Updates error state */
  setError: (error: string | null) => void;
}

export const useSpeakerStore = create<SpeakerState>((set) => ({
  // Initial state
  speakers: [],            // Empty array of speakers
  selectedSpeakers: [],    // No speakers selected
  loading: false,          // Not loading
  error: null,             // No error
  
  /**
   * setSpeakers: Replace the entire speakers array
   * 
   * Used when fetching speakers from the database.
   * Example: setSpeakers([speaker1, speaker2])
   */
  setSpeakers: (speakers) => set({ speakers }),
  
  /**
   * addSpeaker: Add a new speaker to the array
   * 
   * Uses the functional form of set() to access current state.
   * The ...state.speakers spreads the existing speakers,
   * then we add the new speaker at the end.
   * 
   * Example: If speakers = [A, B], after addSpeaker(C):
   * speakers = [A, B, C]
   */
  addSpeaker: (speaker) => set((state) => ({ speakers: [...state.speakers, speaker] })),
  
  /**
   * updateSpeaker: Update a specific speaker
   * 
   * Uses .map() to iterate through speakers.
   * If the speaker ID matches, merge the updates.
   * Otherwise, keep the speaker unchanged.
   * 
   * Example: updateSpeaker("123", { name: "New Name" })
   * - Speaker with ID "123" gets name updated
   * - All other speakers remain unchanged
   */
  updateSpeaker: (id, updates) =>
    set((state) => ({
      speakers: state.speakers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  
  /**
   * removeSpeaker: Remove a speaker by ID
   * 
   * Uses .filter() to keep only speakers that DON'T match the ID.
   * 
   * Example: If speakers = [A, B, C] and we remove B:
   * speakers = [A, C]
   */
  removeSpeaker: (id) =>
    set((state) => ({
      speakers: state.speakers.filter((s) => s.id !== id),
    })),
  
  /**
   * setSelectedSpeakers: Replace the entire selected array
   * Used when programmatically selecting speakers.
   */
  setSelectedSpeakers: (ids) => set({ selectedSpeakers: ids }),
  
  /**
   * toggleSpeaker: Toggle a speaker's selection
   * 
   * If the speaker is already selected, remove it.
   * If the speaker is not selected, add it.
   * 
   * This uses a ternary operator (condition ? ifTrue : ifFalse):
   * - .includes(id) checks if the speaker is already selected
   * - If yes, filter it out (remove)
   * - If no, spread existing and add new ID
   * 
   * Example: selectedSpeakers = ["A", "B"]
   * - toggleSpeaker("A") → selectedSpeakers = ["B"]
   * - toggleSpeaker("C") → selectedSpeakers = ["A", "B", "C"]
   */
  toggleSpeaker: (id) =>
    set((state) => ({
      selectedSpeakers: state.selectedSpeakers.includes(id)
        ? state.selectedSpeakers.filter((sid) => sid !== id)
        : [...state.selectedSpeakers, id],
    })),
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

/**
 * ============================================================================
 * PODCAST STATE STORE
 * ============================================================================
 * 
 * Manages podcast data:
 * - List of all podcasts
 * - Currently viewed/playing podcast
 * - Loading and generation states
 * 
 * ============================================================================
 */

interface PodcastState {
  /** Array of all the user's podcasts */
  podcasts: Podcast[];
  
  /** The currently viewed/playing podcast, or null */
  currentPodcast: Podcast | null;
  
  /** Whether podcasts are being fetched */
  loading: boolean;
  
  /** Whether a podcast is currently being generated (AI creating audio) */
  generating: boolean;
  
  /** Error message, or null if no error */
  error: string | null;
  
  setPodcasts: (podcasts: Podcast[]) => void;
  addPodcast: (podcast: Podcast) => void;
  updatePodcast: (id: string, updates: Partial<Podcast>) => void;
  removePodcast: (id: string) => void;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePodcastStore = create<PodcastState>((set) => ({
  podcasts: [],
  currentPodcast: null,
  loading: false,
  generating: false,
  error: null,
  
  setPodcasts: (podcasts) => set({ podcasts }),
  addPodcast: (podcast) => set((state) => ({ podcasts: [...state.podcasts, podcast] })),
  updatePodcast: (id, updates) =>
    set((state) => ({
      podcasts: state.podcasts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePodcast: (id) =>
    set((state) => ({
      podcasts: state.podcasts.filter((p) => p.id !== id),
    })),
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setLoading: (loading) => set({ loading }),
  setGenerating: (generating) => set({ generating }),
  setError: (error) => set({ error }),
}));

/**
 * ============================================================================
 * UI STATE STORE
 * ============================================================================
 * 
 * Manages UI state that doesn't belong to any specific feature:
 * - Sidebar open/closed
 * - Toast notifications
 * 
 * ============================================================================
 */

interface UIState {
  /** Whether the sidebar is open (mobile menu) */
  sidebarOpen: boolean;
  
  /** Current toast notification, or null if none */
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  
  /** Toggles the sidebar open/closed */
  toggleSidebar: () => void;
  
  /** Sets the sidebar state directly */
  setSidebarOpen: (open: boolean) => void;
  
  /**
   * Shows a toast notification
   * @param message - What to display
   * @param type - 'success' (green), 'error' (red), or 'info' (blue)
   */
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  
  /** Hides the current toast */
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toast: null,
  
  /**
   * toggleSidebar: Toggle sidebar visibility
   * 
   * Uses functional form to access current state.
   * !state.sidebarOpen flips the boolean (true→false, false→true)
   */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  /**
   * showToast: Display a notification
   * 
   * Creates a toast object with message and type,
   * then sets it as the current toast.
   */
  showToast: (message, type) => set({ toast: { message, type } }),
  
  /**
   * hideToast: Clear the current notification
   * Sets toast to null, which removes it from the UI.
   */
  hideToast: () => set({ toast: null }),
}));

/**
 * ============================================================================
 * CREDIT STATE STORE
 * ============================================================================
 * 
 * Manages user credits for podcast generation:
 * - Current credit balance
 * - Credit pack pricing
 * - Add/deduct credits
 * 
 * ============================================================================
 */

interface CreditState {
  /** Current credit balance */
  credits: number;
  
  /** Whether credits are being loaded */
  loading: boolean;
  
  /** Sets the credit balance */
  setCredits: (credits: number) => void;
  
  /** Adds credits after purchase */
  addCredits: (amount: number) => void;
  
  /** Deducts credits for podcast generation */
  deductCredits: (amount: number) => void;
  
  /** Updates loading state */
  setLoading: (loading: boolean) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  credits: 127,
  loading: false,
  
  setCredits: (credits) => set({ credits }),
  
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  
  setLoading: (loading) => set({ loading }),
}));
