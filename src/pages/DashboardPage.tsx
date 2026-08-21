/**
 * ============================================================================
 * DASHBOARD PAGE - Main User Dashboard
 * ============================================================================
 * 
 * This is the main page users see after logging in.
 * It shows:
 * - Quick stats (speakers, podcasts, credits)
 * - Quick action cards (create speaker, create podcast)
 * - Navigation header
 * 
 * ============================================================================
 */

import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Mic, Headphones, Sparkles, ArrowRight, LogOut, Loader2, CreditCard } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { FloatingIcons } from '@/components/animations/FloatingIcons';
import { SparkleEffect } from '@/components/animations/SparkleEffect';
import gsap from 'gsap';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { speakers, fetchSpeakers, loading: speakersLoading } = useSpeakers();
  const { podcasts, fetchPodcasts, loading: podcastsLoading } = usePodcasts();
  const { credits } = useCredits();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch user data when user is available
  useEffect(() => {
    if (user) {
      fetchSpeakers(user.id);
      fetchPodcasts(user.id);
    }
  }, [user, fetchSpeakers, fetchPodcasts]);

  // Animate main content on mount
  useEffect(() => {
    if (containerRef.current) {
      const children = Array.from(containerRef.current.children);
      animate(children, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: stagger(100),
        ease: 'outQuad',
      });
    }
  }, []);

  // Animate stats cards on mount with GSAP
  useEffect(() => {
    if (statsRef.current) {
      const statCards = Array.from(statsRef.current.children);
      
      gsap.from(statCards, {
        opacity: 0,
        scale: 0.8,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.2,
      });

      // Animate counter numbers
      statCards.forEach((card, i) => {
        const numEl = card.querySelector('.stat-number');
        if (numEl) {
          const counter = { value: 0 };
          const targetValue = i === 0 ? speakers.length : i === 1 ? podcasts.length : credits;
          gsap.to(counter, {
            value: targetValue,
            duration: 1.5,
            delay: 0.5 + i * 0.1,
            ease: 'power2.out',
            onUpdate: () => {
              numEl.textContent = Math.round(counter.value).toString();
            }
          });
        }
      });
    }
  }, [speakers.length, podcasts.length, credits]);

  // Animate action cards on mount
  useEffect(() => {
    if (actionsRef.current) {
      const cards = Array.from(actionsRef.current.children);
      gsap.from(cards, {
        opacity: 0,
        x: -30,
        rotateY: -10,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.5,
      });
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingIcons count={5} />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PodCraft</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/dashboard/speakers">
              <Button variant="ghost" size="sm">Speakers</Button>
            </Link>
            <Link to="/dashboard/podcasts">
              <Button variant="ghost" size="sm">Podcasts</Button>
            </Link>
            <Link to="/dashboard/billing">
              <Button variant="ghost" size="sm">
                <CreditCard className="w-4 h-4 mr-1" />
                Billing
              </Button>
            </Link>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                {user?.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10" ref={containerRef}>
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to PodCraft</h1>
          <p className="text-muted-foreground">
            Create AI-powered podcasts with custom speakers, voices, and topics.
          </p>
        </div>

        {/* Quick Stats */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card 
            className="border-border/50 bg-card/50 cursor-pointer"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -5, scale: 1.02, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1.1, rotation: 5, duration: 0.3, ease: 'back.out(1.7)' });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-box w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="stat-number text-2xl font-bold">{speakersLoading ? '...' : speakers.length}</p>
                  <p className="text-sm text-muted-foreground">Speakers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-border/50 bg-card/50 cursor-pointer"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -5, scale: 1.02, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1.1, rotation: 5, duration: 0.3, ease: 'back.out(1.7)' });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-box w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="stat-number text-2xl font-bold">{podcastsLoading ? '...' : podcasts.length}</p>
                  <p className="text-sm text-muted-foreground">Podcasts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-border/50 bg-card/50 cursor-pointer"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { y: -5, scale: 1.02, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1.1, rotation: 5, duration: 0.3, ease: 'back.out(1.7)' });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
              gsap.to(e.currentTarget.querySelector('.icon-box'), { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-box w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="stat-number text-2xl font-bold">{credits}</p>
                  <p className="text-sm text-muted-foreground">Credits Left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div ref={actionsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/dashboard/speakers/new">
            <Card className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer h-full">
              <CardHeader>
                <SparkleEffect>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                </SparkleEffect>
                <CardTitle>Create Speaker</CardTitle>
                <CardDescription>
                  Design a custom AI speaker with unique personality, tone, and voice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary group-hover:gap-2 transition-all duration-300">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/podcasts/new">
            <Card className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer h-full">
              <CardHeader>
                <SparkleEffect>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-6 h-6 text-secondary" />
                  </div>
                </SparkleEffect>
                <CardTitle>Create Podcast</CardTitle>
                <CardDescription>
                  Generate an AI podcast with multiple speakers on any topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-secondary group-hover:gap-2 transition-all duration-300">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
