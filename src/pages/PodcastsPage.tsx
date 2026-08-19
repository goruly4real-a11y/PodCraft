import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Mic, Headphones, Play, Trash2, Clock, Loader2 } from 'lucide-react';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';

export default function PodcastsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
      const children = Array.from(containerRef.current.children);
      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
        duration: 500,
        delay: stagger(80),
        ease: 'outQuad',
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">PodCraft</span>
          </Link>
          <Link to="/dashboard/podcasts/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Podcast
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Podcasts</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated podcasts
          </p>
        </div>

        {podcasts.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI podcast to get started
              </p>
              <Link to="/dashboard/podcasts/new">
                <Button>
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
                id={`podcast-${podcast.id}`}
                className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { y: -5, scale: 1.01, duration: 0.3, ease: 'power2.out' });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{podcast.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {podcast.topic || 'No topic specified'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {podcast.status === 'ready' && (
                        <div className="w-2 h-2 rounded-full bg-secondary" />
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
      </main>
    </div>
  );
}
