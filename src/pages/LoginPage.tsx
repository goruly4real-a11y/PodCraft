/**
 * ============================================================================
 * LOGIN PAGE - Authentication
 * ============================================================================
 * 
 * This is the login/signup page for the app.
 * Users enter their email to receive a "magic link" for authentication.
 * 
 * HOW MAGIC LINK AUTH WORKS:
 * -------------------------
 * 1. User enters their email
 * 2. App sends email to Supabase
 * 3. Supabase sends an email with a special link
 * 4. User clicks the link in their email
 * 5. Supabase verifies the link and logs them in
 * 6. User is redirected back to the app
 * 
 * WHY MAGIC LINKS?
 * ---------------
 * - No password to remember
 * - More secure (can't be phished)
 * - Email proves ownership
 * 
 * ============================================================================
 */

// Import React hooks for state and side effects
import { useState, useEffect } from 'react';

// Import navigation hook for redirecting
import { useNavigate } from 'react-router-dom';

// Import the auth hook
import { useAuth } from '@/hooks/useAuth';

// Import UI components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

// Import icons
import { Mic, Mail, ArrowRight, Loader2 } from 'lucide-react';

// Import animation components
import { FloatingIcons } from '@/components/animations/FloatingIcons';
import { GlowOrbs } from '@/components/animations/GlowOrbs';

/**
 * LoginPage Component
 * ==================
 * 
 * The main login/signup page.
 * 
 * STATE:
 * ------
 * - email: What the user typed in the email field
 * - sent: Whether the magic link was sent successfully
 * - loading: Whether we're currently sending the link
 * - error: Error message if something went wrong
 */
export default function LoginPage() {
  // Navigation hook for redirecting after login
  const navigate = useNavigate();
  
  // Auth hook for signing in and checking auth status
  const { signInWithEmail, isAuthenticated, loading: authLoading } = useAuth();
  
  // Local state for the form
  const [email, setEmail] = useState('');           // Email input value
  const [sent, setSent] = useState(false);           // Magic link sent?
  const [loading, setLoading] = useState(false);     // Currently sending?
  const [error, setError] = useState<string | null>(null);  // Error message

  /**
   * EFFECT: Redirect if already logged in
   * 
   * If the user is already authenticated, redirect to dashboard.
   * This prevents logged-in users from seeing the login page.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  /**
   * handleSubmit Function
   * ====================
   * 
   * Called when the form is submitted.
   * 
   * THE FLOW:
   * 1. Prevent default form submission (page reload)
   * 2. Set loading state
   * 3. Call signInWithEmail with the email
   * 4. If successful, show "check your email" message
   * 5. If error, show error message
   * 6. Finally, stop loading
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();  // Prevent page reload
    setLoading(true);
    setError(null);

    try {
      // Send magic link via Supabase
      await signInWithEmail(email);
      setSent(true);  // Show success message
    } catch (err) {
      // Handle errors
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      // Always stop loading (even if error occurred)
      setLoading(false);
    }
  }

  /**
   * LOADING STATE
   * 
   * If auth is still loading (checking if user is logged in),
   * show a spinner.
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /**
   * MAIN RENDER
   * 
   * Two states:
   * 1. Email not sent: Show the email form
   * 2. Email sent: Show "check your email" message
   */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated background elements */}
      <GlowOrbs count={3} />
      <FloatingIcons count={4} />

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">PodCraft</CardTitle>
          <CardDescription className="text-muted-foreground">
            Craft your podcast with AI-powered voices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/**
           * CONDITIONAL RENDERING
           * 
           * If sent is true: Show success message
           * If sent is false: Show email form
           */}
          {sent ? (
            /**
             * SUCCESS STATE
             * 
             * Shown after magic link is sent.
             * Tells user to check their email.
             */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a magic link to <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSent(false);   // Go back to form
                  setEmail('');     // Clear email
                }}
                className="w-full"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            /**
             * FORM STATE
             * 
             * Email input form.
             * onSubmit triggers handleSubmit.
             */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              
              {/* Error message */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  // Loading spinner
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  // Normal text with arrow icon
                  <>
                    Continue with Email
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Terms of service text */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
