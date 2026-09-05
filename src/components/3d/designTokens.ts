/**
 * PodCraft 3D Experience - Design System
 * Inspired by Unseen Studio's narrative scroll experiences
 */

export const DESIGN_TOKENS = {
  colors: {
    // Studio Signal palette
    studio: 0x0B0F19,
    signal: 0xF59E0B,
    wave: 0x6366F1,
    success: 0x22C55E,
    ghost: 0x64748B,
    paper: 0xF1F5F9,
    
    // Material colors
    micBody: 0x0B0F19,
    micGrille: 0x1a1a2e,
    micAccent: 0xF59E0B,
    micStand: 0x2a2a3e,
    cable: 0x1a1a2e,
    
    // Speaker avatar colors
    speakers: [
      { primary: 0xF59E0B, secondary: 0xFBBF24, name: 'Alex', role: 'Host' },
      { primary: 0x6366F1, secondary: 0x818CF8, name: 'Sarah', role: 'Co-host' },
      { primary: 0x22C55E, secondary: 0x4ADE80, name: 'Mike', role: 'Guest' },
      { primary: 0xEC4899, secondary: 0xF472B6, name: 'Priya', role: 'Expert' },
      { primary: 0x06B6D4, secondary: 0x22D3EE, name: 'James', role: 'Narrator' },
    ],
    
    // Atmosphere
    particleWarm: 0xF59E0B,
    particleCool: 0x6366F1,
    fogColor: 0x0B0F19,
  },
  
  // Animation timings (Unseen-style: smooth, deliberate)
  animation: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    cinematic: 1.5,
    ease: 'power3.out',
    easeSpring: 'back.out(1.2)',
  },
  
  // Camera presets
  camera: {
    fov: 45,
    heroStart: { position: [0, 1.2, 4], lookAt: [0, 1.2, 0] },
    heroEnd: { position: [3, 1.5, 3], lookAt: [0, 1.2, 0] },
    featureDistance: 8,
  },
  
  // Performance budgets
  performance: {
    desktop: { maxParticles: 3000, dpr: 2, postProcessing: true },
    mobile: { maxParticles: 800, dpr: 1, postProcessing: false },
    lowEnd: { maxParticles: 300, dpr: 1, postProcessing: false },
  },
  
  // Section scroll ranges (0-1 normalized)
  sections: {
    hero: { start: 0, end: 0.35 },
    features: { start: 0.35, end: 0.65 },
    speakers: { start: 0.65, end: 0.9 },
    cta: { start: 0.9, end: 1 },
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;