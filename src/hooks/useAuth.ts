/**
 * ============================================================================
 * useAuth HOOK - Authentication Management
 * ============================================================================
 * 
 * This hook provides authentication functionality for the app.
 * It handles:
 * - Checking if the user is logged in
 * - Listening for auth state changes (login/logout)
 * - Signing in with email (magic link)
 * - Signing out
 * 
 * WHAT IS A HOOK?
 * ---------------
 * A hook is a special React function that starts with "use".
 * Hooks let you "hook into" React features from function components.
 * 
 * This hook combines:
 * - Supabase auth (handles the actual authentication)
 * - Zustand store (stores the auth state globally)
 * - React effect (runs code when component mounts)
 * 
 * ============================================================================
 */

// Import useEffect for running side effects
import { useEffect } from 'react';

// Import the Supabase client (for making API calls)
import { supabase } from '@/lib/supabase/client';

// Import the auth store (for storing user state)
import { useAuthStore } from '@/store';

// Import the credit store (for fetching credits after login)
import { useCreditStore } from '@/store';

/**
 * useAuth Hook
 * ============
 * 
 * USAGE:
 * ------
 * function MyComponent() {
 *   const { user, isAuthenticated, signInWithEmail, signOut } = useAuth();
 *   
 *   if (isAuthenticated) {
 *     return <p>Welcome, {user.email}</p>;
 *   }
 *   return <button onClick={() => signInWithEmail('test@example.com')}>Sign In</button>;
 * }
 * 
 * @returns Object containing user state and auth functions
 */
export function useAuth() {
  /**
   * Extract state and actions from the auth store
   * 
   * useAuthStore() returns the entire store.
   * We destructure to get only what we need:
   * - user: The current user object (or null)
   * - loading: Whether auth is still being checked
   * - setUser: Function to update the user
   * - setLoading: Function to update loading state
   */
  const { user, loading, setUser, setLoading } = useAuthStore();

  /**
   * Extract credit state and actions from the credit store
   * Used to fetch credits after login
   */
  const { setCredits, setLoading: setCreditsLoading } = useCreditStore();

  /**
   * EFFECT: Initialize authentication
   * 
   * This runs when the component first mounts (like a constructor).
   * 
   * WHAT IT DOES:
   * 1. Checks if there's an existing session (user already logged in)
   * 2. Sets up a listener for auth changes (login/logout events)
   * 3. Cleans up the listener when component unmounts
   */
  useEffect(() => {
    /**
     * STEP 1: Get existing session
     * 
     * supabase.auth.getSession() checks if the user has:
     * - A valid session cookie
     - A valid access token
     * 
     * If yes, it returns the user object.
     * If no, it returns null.
     * 
     * The .then() handles the promise (async result).
     * Destructuring: { data: { session } } extracts session from the response.
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Set user (or null if no session)
      setUser(session?.user ?? null);
      // We're done loading
      setLoading(false);

      // Fetch credits if user is logged in
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    /**
     * STEP 2: Listen for auth changes
     * 
     * supabase.auth.onAuthStateChange() sets up a listener that fires
     * whenever the auth state changes:
     * - User signs in
     * - User signs out
     * - Token refreshes
     * - Password reset
     * 
     * The callback receives:
     * - _event: What happened (SIGNED_IN, SIGNED_OUT, etc.)
     * - session: The current session (or null if logged out)
     * 
     * We use _event with underscore because we don't use it.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch credits when user logs in
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    /**
     * STEP 3: Cleanup
     * 
     * When the component unmounts (is removed from the page),
     * we need to stop listening for auth changes.
     * Otherwise, we'd have a "memory leak" (wasted resources).
     * 
     * return () => { ... } is the cleanup function in useEffect.
     */
    return () => subscription.unsubscribe();
  }, [setUser, setLoading, setCredits, setCreditsLoading]);
  // Empty dependency array [] means this only runs once on mount.
  // But we include setUser and setLoading in case they change (they won't).

  /**
   * signInWithEmail Function
   * =======================
   * 
   * Signs in the user using a "magic link" sent to their email.
   * 
   * MAGIC LINK EXPLAINED:
   * --------------------
   * 1. User enters their email
   * 2. Supabase sends an email with a special link
   * 3. User clicks the link
   * 4. Supabase verifies the link and logs them in
   * 5. User is redirected back to the app
   * 
   * This is more secure than passwords because:
   * - No password to remember
   * - No password to steal
   * - Email proves ownership
   * 
   * @param email - The user's email address
   * @throws Error if something goes wrong
   */
  const signInWithEmail = async (email: string) => {
    /**
     * supabase.auth.signInWithOtp() sends a one-time password (magic link)
     * 
     * The options object configures where to redirect after clicking the link.
     * window.location.origin gives us the current URL (e.g., "https://podcraft.app")
     * The /auth/callback path handles the redirect (not implemented yet).
     */
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    // If there's an error, throw it so the caller can handle it
    if (error) throw error;
  };

  /**
   * signOut Function
   * ================
   * 
   * Signs out the current user.
   * 
   * WHAT HAPPENS:
   * 1. Supabase clears the session cookie
   * 2. Supabase invalidates the access token
   * 3. onAuthStateChange fires with session = null
     * 4. Our listener sets user = null
     * 5. App shows login page
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /**
   * fetchCredits Function
   * ====================
   * 
   * Fetches the user's credit balance from Supabase.
   * Called after login and on auth state changes.
   * 
   * @param userId - The ID of the user whose credits to fetch
   */
  const fetchCredits = async (userId: string) => {
    setCreditsLoading(true);

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } else {
      setCredits(data?.credits ?? 0);
    }

    setCreditsLoading(false);
  };

  /**
   * Return values
   * =============
   * 
   * This object contains everything the component needs:
   * 
   * - user: The Supabase user object (has email, id, etc.)
   * - loading: true while checking auth, false when done
   * - signInWithEmail: Function to sign in with email
   * - signOut: Function to sign out
   * - isAuthenticated: Boolean, true if user is logged in
   * 
   * !!user converts user object to boolean:
   * - If user exists → true
   * - If user is null → false
   */
  return {
    user,
    loading,
    signInWithEmail,
    signOut,
    isAuthenticated: !!user,
  };
}
