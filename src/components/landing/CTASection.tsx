import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Zap } from 'lucide-react';
import { Waveform } from '@/components/animations/Waveform';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          ref={contentRef}
          className="relative p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border/50 text-center overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Free to start
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">
              Ready to Create Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                First Podcast?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using PodCraft to
              produce professional podcasts in minutes, not hours.
            </p>

            <div className="flex justify-center mb-8">
              <Waveform barCount={50} height={40} color="var(--secondary)" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate('/login')}
              >
                Start Crafting - Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required · 5 free credits · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
