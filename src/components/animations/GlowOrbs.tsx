/**
 * GlowOrbs - Drifting gradient orbs for background ambiance
 * 
 * Renders blurred, animated gradient circles that pulse
 * with opacity. Creates a soft, ambient background effect.
 * 
 * Usage: <GlowOrbs count={3} colors={['#F59E0B']} />
 */

interface GlowOrbsProps {
  className?: string;
  count?: number;
  colors?: string[];
}

export function GlowOrbs({
  className = '',
  count = 3,
  colors = ['#F59E0B', '#8B5CF6', '#10B981'],
}: GlowOrbsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const color = colors[i % colors.length];
        const positions = [
          { top: '20%', left: '20%' },
          { top: '60%', right: '20%' },
          { top: '40%', left: '50%' },
        ];
        const size = 200 + i * 100;
        const delay = i * 1.5;

        return (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-pulse-glow"
            style={{
              ...positions[i % positions.length],
              width: `${size}px`,
              height: `${size}px`,
              background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
