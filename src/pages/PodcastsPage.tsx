import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Mic, Headphones, Play, Trash2, Clock, Loader2, Home, CreditCard, LogOut } from 'lucide-react';
import gsap from 'gsap';

export default function PodcastsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { podcasts, fetchPodcasts, deletePodcast, loading } = usePodcasts();
  const { showToast } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchPodcasts(user.id);
    }
  }, [user, fetchPodcasts]);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.from(Array.from(containerRef.current.children), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }
  }, [loading, podcasts]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePodcast(id);
      showToast('Podcast deleted', 'success');
    } catch {
      showToast('Failed to delete podcast', 'error');
    }
  };

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

  if (authLoading || loading) {
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
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display">Podcasts</h1>
              <p className="text-muted-foreground">
                View and manage your AI-generated podcasts
              </p>
            </div>
            <Link to="/dashboard/podcasts/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Podcast
              </Button>
            </Link>
          </div>

          {podcasts.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display">No podcasts yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first AI podcast to get started
                </p>
                <Link to="/dashboard/podcasts/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Podcast
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {podcasts.map((podcast) => (
                <Card
                  key={podcast.id}
                  className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-display">{podcast.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {podcast.topic || 'No topic specified'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {podcast.status === 'ready' && (
                          <div className="w-2 h-2 rounded-full bg-success" />
                        )}
                        {podcast.status === 'generating' && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        {podcast.status === 'error' && (
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="capitalize">{podcast.status}</span>
                      {podcast.duration && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(podcast.duration)}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatDate(podcast.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {podcast.status === 'ready' && podcast.audio_url && (
                        <Link to={`/dashboard/podcasts/${podcast.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                        </Link>
                      )}
                      {podcast.status === 'generating' && (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          Generating...
                        </Button>
                      )}
                      {podcast.status === 'draft' && (
                        <Link to={`/dashboard/podcasts/${podcast.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Continue
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(podcast.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
