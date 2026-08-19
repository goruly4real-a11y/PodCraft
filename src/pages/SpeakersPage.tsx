import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Mic, Trash2, Play, User, Loader2 } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { createAudioUrl } from '@/lib/gemini';
import { previewVoice } from '@/lib/gemini';
import gsap from 'gsap';

export default function SpeakersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { speakers, fetchSpeakers, deleteSpeaker, loading } = useSpeakers();
  const { showToast } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchSpeakers(user.id);
    }
  }, [user, fetchSpeakers]);

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
  }, [loading, speakers]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSpeaker(id);
      showToast('Speaker deleted', 'success');
    } catch {
      showToast('Failed to delete speaker', 'error');
    }
  };

  const handlePreview = async (speaker: typeof speakers[0]) => {
    setPreviewingId(speaker.id);
    try {
      const audioData = await previewVoice(speaker.voice_id as any);
      const audioUrl = createAudioUrl(audioData);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch {
      showToast('Failed to preview voice', 'error');
    } finally {
      setPreviewingId(null);
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
          <Link to="/dashboard/speakers/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Speaker
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Speakers</h1>
          <p className="text-muted-foreground">
            Create and manage your AI podcast speakers
          </p>
        </div>

        {speakers.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No speakers yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI speaker to get started
              </p>
              <Link to="/dashboard/speakers/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Speaker
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card
                key={speaker.id}
                id={`speaker-${speaker.id}`}
                className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { y: -8, scale: 1.02, duration: 0.3, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.avatar'), { scale: 1.1, duration: 0.3, ease: 'back.out(1.7)' });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.avatar'), { scale: 1, duration: 0.3, ease: 'power2.out' });
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="avatar w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold text-primary overflow-hidden">
                        {speaker.profile_pic_url ? (
                          <img
                            src={speaker.profile_pic_url}
                            alt={speaker.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          speaker.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{speaker.name}</CardTitle>
                        <CardDescription>
                          {speaker.career || 'Podcast Speaker'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    {speaker.age && <span>{speaker.age} years</span>}
                    {speaker.age && speaker.tone && <span>·</span>}
                    {speaker.tone && <span className="capitalize">{speaker.tone}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(speaker)}
                      disabled={previewingId === speaker.id}
                    >
                      {previewingId === speaker.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(speaker.id)}
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
