import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Mic, Headphones, Sparkles, ArrowRight, LogOut, Loader2, CreditCard, Home, Settings } from 'lucide-react';
import gsap from 'gsap';
import { Waveform } from '@/components/animations/Waveform';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { speakers, fetchSpeakers, loading: speakersLoading } = useSpeakers();
  const { podcasts, fetchPodcasts, loading: podcastsLoading } = usePodcasts();
  const { credits } = useCredits();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchSpeakers(user.id);
      fetchPodcasts(user.id);
    }
  }, [user, fetchSpeakers, fetchPodcasts]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }
  }, []);

  useEffect(() => {
    if (statsRef.current) {
      const statCards = Array.from(statsRef.current.children);
      gsap.from(statCards, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2,
      });
    }
  }, [speakers.length, podcasts.length, credits]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/speakers', label: 'Speakers', icon: Mic },
    { href: '/dashboard/podcasts', label: 'Podcasts', icon: Headphones },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-display">PodCraft</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" ref={containerRef}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 font-display">Dashboard</h1>
            <p className="text-muted-foreground">
              Create AI-powered podcasts with custom speakers, voices, and topics.
            </p>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{speakersLoading ? '—' : speakers.length}</p>
                    <p className="text-sm text-muted-foreground">Speakers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{podcastsLoading ? '—' : podcasts.length}</p>
                    <p className="text-sm text-muted-foreground">Podcasts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{credits}</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/dashboard/speakers/new">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-display">Create Speaker</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Design a custom AI speaker with unique personality, tone, and voice
                  </p>
                  <div className="flex items-center text-primary group-hover:gap-2 transition-all duration-300">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/podcasts/new">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-display">Create Podcast</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate an AI podcast with multiple speakers on any topic
                  </p>
                  <div className="flex items-center text-secondary group-hover:gap-2 transition-all duration-300">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Waveform accent */}
          <div className="flex justify-center opacity-30">
            <Waveform barCount={80} height={30} color="var(--primary)" animated={false} />
          </div>
        </div>
      </main>
    </div>
  );
}
