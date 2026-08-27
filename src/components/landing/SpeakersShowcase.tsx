import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const speakers = [
  { name: 'Alex', role: 'Host', color: '#F59E0B' },
  { name: 'Sarah', role: 'Co-host', color: '#6366F1' },
  { name: 'Mike', role: 'Guest', color: '#22C55E' },
];

export function SpeakersShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

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

      const speakerEls = speakersRef.current?.querySelectorAll('.speaker');
      if (speakerEls) {
        gsap.from(speakerEls, {
          opacity: 0,
          y: 40,
          scale: 0.9,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: speakersRef.current,
            start: 'top 80%',
          },
        });

        speakerEls.forEach((el, i) => {
          gsap.to(el, {
            y: -8,
            duration: 2.5 + i * 0.3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          });
        });
      }

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
    <section ref={sectionRef} className="py-16 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h2
          ref={titleRef}
          className="text-3xl md:text-5xl font-bold text-center mb-16 font-display"
        >
          Create Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
            Dream Team
          </span>
        </h2>

        <div ref={speakersRef} className="flex items-center justify-center gap-12 md:gap-20 py-8">
          {speakers.map((speaker) => (
            <div
              key={speaker.name}
              className="speaker flex flex-col items-center cursor-pointer"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 transition-shadow duration-300"
                style={{
                  backgroundColor: `${speaker.color}15`,
                  color: speaker.color,
                  border: `2px solid ${speaker.color}30`,
                }}
              >
                {speaker.name[0]}
              </div>
              <span className="text-sm font-semibold font-display">{speaker.name}</span>
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
