import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const speakers = [
  { name: 'Alex', role: 'Host', color: '#F59E0B', x: 100 },
  { name: 'Sarah', role: 'Co-host', color: '#10B981', x: 200 },
  { name: 'Mike', role: 'Guest', color: '#8B5CF6', x: 300 },
];

export function SpeakersShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
        },
      });

      // SVG connection lines drawing animation
      if (svgRef.current) {
        const lines = svgRef.current.querySelectorAll('line');
        lines.forEach((line) => {
          const length = Math.sqrt(
            Math.pow(
              parseFloat(line.getAttribute('x2') || '0') -
                parseFloat(line.getAttribute('x1') || '0'),
              2
            ) +
              Math.pow(
                parseFloat(line.getAttribute('y2') || '0') -
                  parseFloat(line.getAttribute('y1') || '0'),
                2
              )
          );
          gsap.set(line, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          gsap.to(line, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: speakersRef.current,
              start: 'top 75%',
            },
          });
        });
      }

      // Speakers - floating in with spring bounce
      const speakerEls = speakersRef.current?.querySelectorAll('.speaker');
      if (speakerEls) {
        gsap.set(speakerEls, { opacity: 0, y: 60, scale: 0.5, rotation: -10 });

        gsap.to(speakerEls, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'elastic.out(1, 0.6)',
          scrollTrigger: {
            trigger: speakersRef.current,
            start: 'top 80%',
          },
        });

        // Continuous floating animation
        speakerEls.forEach((el, i) => {
          gsap.to(el, {
            y: -10,
            duration: 2 + i * 0.3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.5,
          });
        });
      }

      // Parallax effect
      gsap.to(speakersRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Description
      gsap.from(descRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        scrollTrigger: {
          trigger: descRef.current,
          start: 'top 90%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h2
          ref={titleRef}
          className="text-3xl md:text-5xl font-bold text-center mb-16"
        >
          Create Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            Dream Team
          </span>
        </h2>

        <div ref={speakersRef} className="relative h-64 flex items-center justify-center">
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 200"
          >
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <line
              x1="100"
              y1="100"
              x2="200"
              y2="100"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <line
              x1="200"
              y1="100"
              x2="300"
              y2="100"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          </svg>

          {speakers.map((speaker, i) => (
            <div
              key={speaker.name}
              className="speaker absolute flex flex-col items-center cursor-pointer"
              style={{
                left: `${(i + 1) * 25}%`,
                transform: 'translateX(-50%)',
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget.querySelector('.avatar'), {
                  scale: 1.2,
                  boxShadow: `0 0 30px ${speaker.color}40`,
                  duration: 0.3,
                  ease: 'back.out(1.7)',
                });
                gsap.to(e.currentTarget.querySelector('.pulse-ring'), {
                  scale: 1.5,
                  opacity: 0,
                  duration: 0.8,
                  ease: 'power2.out',
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget.querySelector('.avatar'), {
                  scale: 1,
                  boxShadow: 'none',
                  duration: 0.3,
                  ease: 'power2.out',
                });
              }}
            >
              <div
                className="avatar w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 relative"
                style={{ backgroundColor: `${speaker.color}20`, color: speaker.color }}
              >
                {speaker.name[0]}
                <div
                  className="pulse-ring absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${speaker.color}30` }}
                />
              </div>
              <span className="text-sm font-medium">{speaker.name}</span>
              <span className="text-xs text-muted-foreground">{speaker.role}</span>
            </div>
          ))}
        </div>

        <p
          ref={descRef}
          className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto"
        >
          Create multiple speakers with unique voices and personalities.
          Mix and match to create dynamic, engaging conversations.
        </p>
      </div>
    </section>
  );
}
