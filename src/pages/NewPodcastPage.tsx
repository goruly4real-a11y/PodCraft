import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSpeakers } from '@/hooks/useSpeakers';
import { usePodcasts } from '@/hooks/usePodcasts';
import { useCredits } from '@/hooks/useCredits';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Headphones, Upload, FileText, Loader2, X, Mic, Clock, Zap } from 'lucide-react';
import { PodcastGenerationAnimation } from '@/components/podcasts/PodcastGenerationAnimation';
import { DURATION_OPTIONS, calculateCredits, formatCreditCost } from '@/lib/credits';
import { supabase } from '@/lib/supabase/client';
import gsap from 'gsap';

export default function NewPodcastPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { speakers, fetchSpeakers, loading: speakersLoading } = useSpeakers();
  const { createPodcast, uploadSourceMaterial, generatePodcast } = usePodcasts();
  const { credits, hasEnoughCredits, deductCredits, refundCredits } = useCredits();
  const { showToast } = useUIStore();
  const formRef = useRef<HTMLFormElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'connecting' | 'generating' | 'success' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    notes: '',
    script: '',
  });

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
    if (stepsRef.current) {
      const steps = Array.from(stepsRef.current.children);
      gsap.from(steps, {
        opacity: 0,
        x: -20,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSpeaker = (speakerId: string) => {
    setSelectedSpeakers((prev) =>
      prev.includes(speakerId) ? prev.filter((id) => id !== speakerId) : [...prev, speakerId]
    );
  };

  const handleStepChange = (newStep: number) => {
    // Animate current step out
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0,
        x: newStep > step ? -30 : 30,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setStep(newStep);
          // Animate new step in
          gsap.fromTo(formRef.current, 
            { opacity: 0, x: newStep > step ? 30 : -30 },
            { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
          );
        },
      });
    } else {
      setStep(newStep);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSourceFile(e.target.files[0]);
      setForm({ ...form, topic: '' });
    }
  };

  const removeFile = () => {
    setSourceFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedSpeakers.length === 0) {
      showToast('Please select at least one speaker', 'error');
      return;
    }
    if (!form.topic && !sourceFile) {
      showToast('Please provide a topic or upload source material', 'error');
      return;
    }

    // Check if user has enough credits
    const requiredCredits = calculateCredits(selectedDuration, selectedSpeakers.length);
    if (!hasEnoughCredits(requiredCredits)) {
      showToast('Insufficient credits. Please purchase more credits.', 'error');
      navigate('/dashboard/billing');
      return;
    }

    setLoading(true);
    setGenerationStatus('connecting');

    try {
      // Deduct credits before generation
      const deducted = await deductCredits(user.id, requiredCredits);
      if (!deducted) {
        throw new Error('Failed to deduct credits');
      }

      let sourceMaterialUrl = null;
      let sourceMaterialName = null;

      // Upload source material if provided
      if (sourceFile) {
        const uploadResult = await uploadSourceMaterial(sourceFile, user.id);
        sourceMaterialUrl = uploadResult.url;
        sourceMaterialName = uploadResult.name;
      }

      // Create podcast with duration
      const podcast = await createPodcast(user.id, {
        title: form.title,
        topic: form.topic || null,
        notes: form.notes || null,
        script: form.script || null,
        source_material_url: sourceMaterialUrl,
        source_material_name: sourceMaterialName,
        speakerIds: selectedSpeakers,
        duration: selectedDuration,
      });

      // Start generation with animation
      setGenerationStatus('generating');
      setGenerationProgress(10);

      // Poll for actual progress from the database
      const pollProgress = async () => {
        const { data: podcastData } = await supabase
          .from('podcasts')
          .select('status, error_message')
          .eq('id', podcast.id)
          .single();

        if (podcastData) {
          if (podcastData.status === 'generating') {
            setGenerationProgress((prev) => Math.min(prev + 10, 80));
            return true; // Continue polling
          } else if (podcastData.status === 'completed') {
            setGenerationProgress(100);
            setGenerationStatus('success');
            return false; // Stop polling
          } else if (podcastData.status === 'failed') {
            setGenerationStatus('error');
            showToast(podcastData.error_message || 'Generation failed', 'error');
            return false; // Stop polling
          }
        }
        return true; // Continue polling
      };

      // Start polling
      let pollInterval: NodeJS.Timeout;
      const startPolling = async () => {
        // Initial progress
        setGenerationProgress(20);

        // Poll every 2 seconds
        pollInterval = setInterval(async () => {
          const shouldContinue = await pollProgress();
          if (!shouldContinue) {
            clearInterval(pollInterval);
          }
        }, 2000);
      };

      await startPolling();

      // Wait for generation to complete
      await generatePodcast(podcast.id, selectedDuration);

      // Clear polling interval
      clearInterval(pollInterval);

      // Final progress update
      setGenerationProgress(100);
      setGenerationStatus('success');

      showToast('Podcast generated successfully!', 'success');

      setTimeout(() => {
        navigate('/dashboard/podcasts');
      }, 1500);
    } catch (err) {
      // Refund credits on failure
      await refundCredits(user.id, calculateCredits(selectedDuration, selectedSpeakers.length));
      
      setGenerationStatus('error');
      showToast(err instanceof Error ? err.message : 'Failed to create podcast', 'error');
      setTimeout(() => {
        setGenerationStatus('idle');
        setLoading(false);
        setGenerationProgress(0);
      }, 2000);
    }
  };

  if (authLoading || speakersLoading) {
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
          <Link to="/dashboard/podcasts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xl font-bold">New Podcast</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Steps Indicator */}
        <div ref={stepsRef} className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Speakers' },
            { num: 2, label: 'Content' },
            { num: 3, label: 'Duration' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                step === s.num
                  ? 'bg-primary text-primary-foreground'
                  : step > s.num
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                {s.num}
              </span>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Step 1: Select Speakers */}
          {step === 1 && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Select Speakers</CardTitle>
                <CardDescription>
                  Choose which speakers to include in your podcast (select 1-4)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {speakers.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No speakers yet</p>
                    <Link to="/dashboard/speakers/new">
                      <Button>Create Speaker First</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {speakers.map((speaker) => (
                      <div
                        key={speaker.id}
                        onClick={() => toggleSpeaker(speaker.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedSpeakers.includes(speaker.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
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
                            <p className="font-medium">{speaker.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {speaker.voice_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    onClick={() => handleStepChange(2)}
                    disabled={selectedSpeakers.length === 0}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Podcast Content</CardTitle>
                <CardDescription>
                  Provide a topic or upload source material for your podcast
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Podcast Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., The Future of Technology"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Topic or Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">
                    Content Source <span className="text-destructive">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Topic Option */}
                    <div
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        form.topic
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (sourceFile) removeFile();
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">Topic</span>
                      </div>
                      <Textarea
                        id="topic"
                        name="topic"
                        placeholder="What should the podcast be about?"
                        value={form.topic}
                        onChange={handleChange}
                        rows={3}
                        className="bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    {/* Upload Option */}
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        sourceFile
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      {sourceFile ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-secondary" />
                              <span className="font-medium">Source Material</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removeFile}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {sourceFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(sourceFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <div className="flex items-center gap-3 mb-3">
                            <Upload className="w-5 h-5 text-secondary" />
                            <span className="font-medium">Upload File</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            PDF, TXT, or DOCX (max 10MB)
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.txt,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Things that should be mentioned, specific points to cover, tone guidelines..."
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                {/* Script Override */}
                <div className="space-y-2">
                  <label htmlFor="script" className="text-sm font-medium">
                    Custom Script (Optional)
                  </label>
                  <Textarea
                    id="script"
                    name="script"
                    placeholder="Override the AI-generated script with your own. Format: SpeakerName: dialogue"
                    value={form.script}
                    onChange={handleChange}
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, this will be used instead of the AI-generated script
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => handleStepChange(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleStepChange(3)}
                    disabled={!form.title || (!form.topic && !sourceFile)}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Duration */}
          {step === 3 && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Select Duration
                </CardTitle>
                <CardDescription>
                  Choose how long your podcast should be
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((option) => {
                    const creditCost = calculateCredits(option.value, selectedSpeakers.length);
                    const canAfford = hasEnoughCredits(creditCost);
                    
                    return (
                      <div
                        key={option.value}
                        onClick={() => canAfford && setSelectedDuration(option.value)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedDuration === option.value
                            ? 'border-primary bg-primary/10'
                            : canAfford
                            ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                            : 'border-border opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold">{option.value}</p>
                          <p className="text-sm text-muted-foreground">minutes</p>
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className={`text-sm font-medium ${canAfford ? 'text-primary' : 'text-destructive'}`}>
                              {formatCreditCost(creditCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your credits:</span>
                    <span className="font-medium">{credits}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Cost for {selectedDuration} min with {selectedSpeakers.length} speaker(s):</span>
                    <span className="font-medium text-primary">
                      {formatCreditCost(calculateCredits(selectedDuration, selectedSpeakers.length))}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => handleStepChange(2)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleStepChange(4)}
                    disabled={!hasEnoughCredits(calculateCredits(selectedDuration, selectedSpeakers.length))}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Review & Create</CardTitle>
                <CardDescription>
                  Review your podcast settings before generating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="font-medium">{form.title}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Speakers</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpeakers.map((id) => {
                        const speaker = speakers.find((s) => s.id === id);
                        return speaker ? (
                          <span
                            key={id}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                          >
                            {speaker.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{selectedDuration} minutes</p>
                  </div>

                  {(form.topic || sourceFile) && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Content Source</p>
                      {form.topic && <p className="text-sm">{form.topic}</p>}
                      {sourceFile && (
                        <p className="text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {sourceFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {form.notes && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{form.notes}</p>
                    </div>
                  )}

                  {form.script && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Custom Script</p>
                      <pre className="text-sm font-mono whitespace-pre-wrap">{form.script}</pre>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Credit Cost</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCreditCost(calculateCredits(selectedDuration, selectedSpeakers.length))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {credits} credits remaining after generation
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => handleStepChange(3)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Headphones className="w-4 h-4 mr-2" />
                        Create Podcast
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>

      {/* Generation Animation Overlay */}
      {generationStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg">
            <PodcastGenerationAnimation
              speakers={selectedSpeakers.map((id) => {
                const speaker = speakers.find((s) => s.id === id);
                const colors = ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
                return {
                  name: speaker?.name || 'Speaker',
                  color: colors[selectedSpeakers.indexOf(id) % colors.length],
                };
              })}
              status={generationStatus}
              progress={generationProgress}
            />
          </div>
        </div>
      )}
    </div>
  );
}
