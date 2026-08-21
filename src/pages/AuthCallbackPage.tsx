/**
 * Auth Callback Page
 *
 * Handles the Supabase magic link redirect.
 * When a user clicks the magic link in their email, Supabase redirects
 * to this page with the access token in the URL hash.
 *
 * This page:
 * 1. Extracts the access token from the URL
 * 2. Sets the Supabase session
 * 3. Redirects to the dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the hash from the URL (#access_token=...)
        const hash = window.location.hash;

        if (!hash) {
          setStatus('error');
          setErrorMessage('No authentication data found in URL');
          return;
        }

        // Supabase handles the session automatically when it detects
        // the access_token in the URL hash. We just need to wait for it.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus('success');
          // Redirect to dashboard after a brief moment
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          // Try to extract token from hash manually
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');

          if (accessToken) {
            // Set the session with the access token
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: params.get('refresh_token') || '',
            });

            if (sessionError) {
              setStatus('error');
              setErrorMessage(sessionError.message);
              return;
            }

            setStatus('success');
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else {
            setStatus('error');
            setErrorMessage('No access token found');
          }
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuth();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">Signed In!</h1>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
