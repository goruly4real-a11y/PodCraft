import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, Sparkles, Headphones, Wand2, Users, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Mic,
    title: 'AI-Powered Voices',
    description:
      'Choose from realistic AI voices that sound natural and engaging.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Scripts',
    description:
      'Write topics and let AI craft engaging podcast scripts for you.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Headphones,
    title: 'Studio Quality',
    description:
      'Professional audio quality with automatic noise reduction and mastering.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Wand2,
    title: 'One-Click Generate',
    description:
      'Create full podcast episodes with a single click. No editing required.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Users,
    title: 'Multiple Speakers',
    description:
      'Create dynamic conversations with multiple AI speakers.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Track your podcast performance with detailed analytics.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
        },
      });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.from(Array.from(cards), {
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2
          ref={titleRef}
          className="text-3xl md:text-5xl font-bold text-center mb-16 font-display"
        >
          Everything You Need to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Create
          </span>
        </h2>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <div
                className={`icon-container w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-display">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
