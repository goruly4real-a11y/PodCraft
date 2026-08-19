import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mic, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { animate } from 'animejs';
import { TONE_OPTIONS, VOICE_DESCRIPTIONS } from '@/types';
import { previewVoice, createAudioUrl } from '@/lib/gemini';

const VOICE_OPTIONS = Object.entries(VOICE_DESCRIPTIONS).map(([value, label]) => ({
  value,
  label: `${value} - ${label}`,
}));

export default function NewSpeakerPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { createSpeaker, uploadProfilePic } = useSpeakers();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    age: '',
    tone: '',
    career: '',
    personality: '',
    voice_id: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!form.voice_id) return;
    setPreviewing(true);
    try {
      const audioData = await previewVoice(form.voice_id as any);
      const audioUrl = createAudioUrl(audioData);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch {
      showToast('Failed to preview voice', 'error');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let profilePicUrl = null;

      // Upload profile pic if selected
      if (profilePic) {
        profilePicUrl = await uploadProfilePic(profilePic, user.id);
      }

      await createSpeaker(user.id, {
        name: form.name,
        age: form.age ? parseInt(form.age) : null,
        tone: form.tone as any || null,
        career: form.career || null,
        personality: form.personality || null,
        voice_id: form.voice_id as any,
        profile_pic_url: profilePicUrl,
      });

      showToast('Speaker created successfully', 'success');

      // Animate success
      const formElement = document.getElementById('speaker-form');
      if (formElement) {
        animate(formElement, {
          opacity: [1, 0],
          y: [0, -20],
          duration: 300,
          ease: 'inQuad',
        });
      }

      setTimeout(() => {
        navigate('/dashboard/speakers');
      }, 300);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create speaker', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/dashboard/speakers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">New Speaker</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card id="speaker-form" className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Create a Speaker</CardTitle>
            <CardDescription>
              Design your AI speaker with a unique personality and voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-border overflow-hidden hover:opacity-80 transition-opacity">
                    {profilePic ? (
                      <img
                        src={URL.createObjectURL(profilePic)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : form.name ? (
                      form.name.charAt(0)
                    ) : (
                      '?'
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                  />
                </label>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Click to upload profile picture
              </p>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Sarah Chen"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Age and Tone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="28"
                    value={form.age}
                    onChange={handleChange}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tone" className="text-sm font-medium">
                    Tone
                  </label>
                  <Select
                    id="tone"
                    name="tone"
                    options={TONE_OPTIONS}
                    placeholder="Select tone"
                    value={form.tone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Career */}
              <div className="space-y-2">
                <label htmlFor="career" className="text-sm font-medium">
                  Career / Role
                </label>
                <Input
                  id="career"
                  name="career"
                  placeholder="e.g., Tech Journalist"
                  value={form.career}
                  onChange={handleChange}
                />
              </div>

              {/* Personality */}
              <div className="space-y-2">
                <label htmlFor="personality" className="text-sm font-medium">
                  Personality
                </label>
                <Textarea
                  id="personality"
                  name="personality"
                  placeholder="Describe their personality, speaking style, and interests..."
                  value={form.personality}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <label htmlFor="voice_id" className="text-sm font-medium">
                  Voice <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Select
                    id="voice_id"
                    name="voice_id"
                    options={VOICE_OPTIONS}
                    placeholder="Select a voice"
                    value={form.voice_id}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={!form.voice_id || previewing}
                  >
                    {previewing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click play to preview the selected voice
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Link to="/dashboard/speakers" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Speaker
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
