import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Mic, Trash2, Play, User, Loader2, Home, Headphones, CreditCard, LogOut } from 'lucide-react';
import { createAudioUrl } from '@/lib/gemini';
import { previewVoice } from '@/lib/gemini';
import gsap from 'gsap';

export default function SpeakersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
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
      gsap.from(Array.from(containerRef.current.children), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
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
              <h1 className="text-3xl font-bold mb-2 font-display">Speakers</h1>
              <p className="text-muted-foreground">
                Create and manage your AI podcast speakers
              </p>
            </div>
            <Link to="/dashboard/speakers/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Speaker
              </Button>
            </Link>
          </div>

          {speakers.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-display">No speakers yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first AI speaker to get started
                </p>
                <Link to="/dashboard/speakers/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                  className="group border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-bold text-primary overflow-hidden transition-transform duration-300 group-hover:scale-105">
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
                          <CardTitle className="text-lg font-display">{speaker.name}</CardTitle>
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
        </div>
      </main>
    </div>
  );
}
