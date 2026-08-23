import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useUIStore } from '@/store';
import { AudioPlayer } from '@/components/podcasts/AudioPlayer';
import { TranscriptViewer } from '@/components/podcasts/TranscriptViewer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Mic, Headphones, Loader2, Download, Trash2, Share2, Home, CreditCard, LogOut } from 'lucide-react';

const SPEAKER_COLORS = ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function PodcastDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { currentPodcast, fetchPodcast, deletePodcast, loading } = usePodcasts();
  const { speakers, fetchSpeakers } = useSpeakers();
  const { showToast } = useUIStore();
  const [podcastSpeakers, setPodcastSpeakers] = useState<{ name: string; color: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPodcast(id);
      fetchSpeakers(user.id);
    }
  }, [user, id, fetchPodcast, fetchSpeakers]);

  // Get speakers for this podcast
  useEffect(() => {
    if (currentPodcast && speakers.length > 0) {
      // For now, use all speakers (in real app, fetch from podcast_speakers table)
      const mappedSpeakers = speakers.slice(0, 2).map((s, i) => ({
        name: s.name,
        color: SPEAKER_COLORS[i % SPEAKER_COLORS.length],
      }));
      setPodcastSpeakers(mappedSpeakers);
    }
  }, [currentPodcast, speakers]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deletePodcast(id);
      showToast('Podcast deleted', 'success');
      navigate('/dashboard/podcasts');
    } catch {
      showToast('Failed to delete podcast', 'error');
    }
  };

  const handleDownload = () => {
    if (!currentPodcast?.audio_url) return;
    
    const link = document.createElement('a');
    link.href = currentPodcast.audio_url;
    link.download = `${currentPodcast.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPodcast?.title,
          text: `Check out this podcast: ${currentPodcast?.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'success');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPodcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Podcast not found</p>
      </div>
    );
  }

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
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
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
        <div className="p-8 max-w-4xl">
          {/* Back button + Title */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard/podcasts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-display truncate">
                {currentPodcast.title}
              </h1>
              <p className="text-muted-foreground">
                {currentPodcast.topic || 'No topic specified'}
              </p>
            </div>
          </div>
        <div className="space-y-6">
          {/* Podcast Info */}
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{currentPodcast.title}</h1>
                  {currentPodcast.topic && (
                    <p className="text-muted-foreground">{currentPodcast.topic}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm text-muted-foreground capitalize">
                      Status: {currentPodcast.status}
                    </span>
                    {currentPodcast.duration && (
                      <span className="text-sm text-muted-foreground">
                        Duration: {Math.floor(currentPodcast.duration / 60)}:{(currentPodcast.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Player */}
          {currentPodcast.audio_url ? (
            <AudioPlayer
              audioUrl={currentPodcast.audio_url}
              title={currentPodcast.title}
              speakers={podcastSpeakers}
              onDownload={handleDownload}
            />
          ) : (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-12 text-center">
                <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {currentPodcast.status === 'generating'
                    ? 'Generating audio...'
                    : 'No audio available'}
                </p>
                {currentPodcast.status === 'generating' && (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {currentPodcast.notes && (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentPodcast.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          {currentPodcast.transcript && (
            <TranscriptViewer
              transcript={currentPodcast.transcript}
              speakers={podcastSpeakers}
            />
          )}

          {/* Source Material */}
          {currentPodcast.source_material_name && (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Source Material</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">{currentPodcast.source_material_name}</p>
                    <a
                      href={currentPodcast.source_material_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View source material
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
