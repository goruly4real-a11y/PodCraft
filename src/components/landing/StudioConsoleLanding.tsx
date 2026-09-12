/**
 * PodCraft Studio Console - Skeuomorphic, Neomorphic & Glassmorphic Landing Page Experience
 * Tactile audio rack controls, real-time VU meters, vacuum tube warmth, and interactive audio preview.
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Mic, Sparkles, Sliders, 
  Zap, Radio, CheckCircle2, ChevronRight, UserPlus
} from 'lucide-react';
import { Waveform } from '@/components/animations/Waveform';

export function StudioConsoleLanding() {
  // Interactive Studio Mixer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [warmthVal, setWarmthVal] = useState(75);
  const [speakerBalVal, setSpeakerBalVal] = useState(50);
  const [clarityVal, setClarityVal] = useState(88);
  const [durationMins, setDurationMins] = useState(15);
  const [speakerCount, setSpeakerCount] = useState(2);
  const [audioProgress, setAudioProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated audio progress loop when playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Fallback if browser blocks autoplay
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Credit calculation: ceil((duration * speakers) / 5)
  const requiredCredits = Math.ceil((durationMins * speakerCount) / 5);

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-slate-100 overflow-hidden pt-16 sm:pt-20">
      {/* Ambient Atmospheric Studio Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] left-[-200px] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[1600px] right-[-200px] w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Hidden Audio element for preview */}
      <audio 
        ref={audioRef} 
        src="https://cdn.freesound.org/previews/612/612086_5674468-lq.mp3" 
        preload="none" 
      />

      {/* ================= HERO SECTION ============ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full studio-glass-amber border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <Radio className="w-4 h-4 text-amber-400" />
              <span>STUDIO SIGNAL V2.0 • AI PODCAST ARCHITECTURE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white leading-[1.1]">
              Turn Ideas Into <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-400">
                Studio-Grade Podcasts
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl font-body leading-relaxed mx-auto lg:mx-0">
              Generate lifelike multi-speaker conversations with custom AI voices, automated scriptwriting, and instant mastering. No recording equipment required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>Start Crafting — Free (5 Credits)</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                href="#demo-console"
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-slate-300 studio-glass hover:text-white hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Test Studio Mixer</span>
              </a>
            </div>

            {/* Micro Feature Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Output Quality</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">320kbps Studio MP3</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Synthesis Engine</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">Gemini AI + Neural</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Turnaround</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">&lt; 90 Seconds</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res Studio Broadcast Mic Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl studio-glass p-3 sm:p-4 overflow-hidden border border-white/10 shadow-2xl">
              {/* Studio Screws in corners */}
              <div className="absolute top-3 left-3 studio-screw z-20" />
              <div className="absolute top-3 right-3 studio-screw z-20" />
              <div className="absolute bottom-3 left-3 studio-screw z-20" />
              <div className="absolute bottom-3 right-3 studio-screw z-20" />

              {/* High-Resolution Broadcast Mic Media Asset */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-b from-slate-900 via-slate-950 to-[#070A12] border border-slate-800 flex flex-col justify-between p-6">
                
                {/* Background Image of Broadcast Mic with atmospheric studio lighting */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-75 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80')` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

                {/* Top Status Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-mono tracking-wider text-slate-300">
                      {isPlaying ? 'AIR SIGNAL ON' : 'STANDBY MODE'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                    SHURE BROADCAST RX
                  </div>
                </div>

                {/* Middle Audio Waveform Overlay */}
                <div className="relative z-10 py-6 my-auto text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-950/80 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center studio-glass-amber shadow-lg shadow-amber-500/20">
                    <Mic className="w-8 h-8 text-amber-400" />
                  </div>
                  
                  <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
                    <Waveform barCount={28} height={24} color="#F59E0B" animated={isPlaying} />
                  </div>
                </div>

                {/* Bottom Live Audio Player Card */}
                <div className="relative z-10 bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/30"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-mono text-amber-400">EPISODE PREVIEW</div>
                        <div className="text-sm font-semibold text-white">AI & The Future of Audio</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      00:{audioProgress < 10 ? `0${audioProgress}` : audioProgress} / 01:30
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300" 
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ================= SKEUOMORPHIC & NEOMORPHIC RACK CONSOLE ============ */}
      <section id="demo-console" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full studio-glass text-amber-400 text-xs font-mono mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>SKEUOMORPHIC STUDIO RACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Tactile Control Over Every Wave
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Experience the precision of an analog broadcast studio combined with neural speech synthesis.
          </p>
        </div>

        {/* Rack Panel Main Box */}
        <div className="relative rounded-3xl studio-glass p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8">
          
          {/* Rack Screws */}
          <div className="absolute top-4 left-4 studio-screw" />
          <div className="absolute top-4 right-4 studio-screw" />
          <div className="absolute bottom-4 left-4 studio-screw" />
          <div className="absolute bottom-4 right-4 studio-screw" />

          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">MASTER CONSOLE RX-800</div>
              <div className="text-xl font-bold font-display text-white mt-0.5">PodCraft Master Signal Processor</div>
            </div>

            {/* Vacuum Tube Warmth Indicators */}
            <div className="flex items-center gap-6 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <div className={`w-2 h-6 rounded-full bg-amber-500 transition-opacity duration-500 ${isPlaying ? 'opacity-100 tube-glow animate-pulse' : 'opacity-40'}`} />
                </div>
                <div className="relative w-4 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <div className={`w-2 h-6 rounded-full bg-amber-500 transition-opacity duration-500 ${isPlaying ? 'opacity-100 tube-glow animate-pulse' : 'opacity-40'}`} />
                </div>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-slate-500 uppercase">ANALOG TUBE WARMTH</div>
                <div className="text-xs font-mono font-semibold text-amber-400">
                  {isPlaying ? 'ACTIVE (12AX7 GLOW)' : 'READY'}
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Controls: VU Meters + Rotary Knobs + Neomorphic Push Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Dual Analog VU Meters */}
            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span>SIGNAL VU METERS (dB)</span>
                <span className="text-amber-400 font-semibold">PEAK: +3dB</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left VU Meter */}
                <div className="relative bg-[#F5E6CA] h-28 rounded-lg border-2 border-slate-800 p-2 overflow-hidden flex flex-col justify-between text-slate-900 shadow-inner">
                  <div className="flex justify-between text-[9px] font-mono font-bold opacity-70">
                    <span>-20</span>
                    <span>-10</span>
                    <span>0</span>
                    <span className="text-red-600">+3</span>
                  </div>

                  {/* Meter Arc */}
                  <div className="relative h-12 border-b border-slate-400/50">
                    {/* Bouncing Needle */}
                    <div 
                      className={`absolute bottom-0 left-1/2 w-0.5 h-10 bg-slate-950 transition-transform duration-300 ${isPlaying ? 'animate-vu-needle' : ''}`}
                      style={{ transform: isPlaying ? undefined : 'rotate(-25deg)', transformOrigin: 'bottom center' }}
                    />
                  </div>

                  <div className="text-center text-[10px] font-mono font-bold tracking-widest text-slate-800">
                    LEFT CHANNEL
                  </div>
                </div>

                {/* Right VU Meter */}
                <div className="relative bg-[#F5E6CA] h-28 rounded-lg border-2 border-slate-800 p-2 overflow-hidden flex flex-col justify-between text-slate-900 shadow-inner">
                  <div className="flex justify-between text-[9px] font-mono font-bold opacity-70">
                    <span>-20</span>
                    <span>-10</span>
                    <span>0</span>
                    <span className="text-red-600">+3</span>
                  </div>

                  {/* Meter Arc */}
                  <div className="relative h-12 border-b border-slate-400/50">
                    {/* Bouncing Needle */}
                    <div 
                      className={`absolute bottom-0 left-1/2 w-0.5 h-10 bg-slate-950 transition-transform duration-300 ${isPlaying ? 'animate-vu-needle' : ''}`}
                      style={{ transform: isPlaying ? undefined : 'rotate(-15deg)', transformOrigin: 'bottom center' }}
                    />
                  </div>

                  <div className="text-center text-[10px] font-mono font-bold tracking-widest text-slate-800">
                    RIGHT CHANNEL
                  </div>
                </div>
              </div>
            </div>

            {/* Tactile Rotary Knobs */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-6 text-center">
              
              {/* Knob 1: Voice Warmth */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">VOICE WARMTH</div>
                <div className="relative inline-flex items-center justify-center p-3 rounded-full neo-outset cursor-pointer group">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md relative transition-transform duration-200"
                    style={{ transform: `rotate(${(warmthVal - 50) * 1.8}deg)` }}
                    onClick={() => setWarmthVal((prev) => (prev >= 100 ? 10 : prev + 15))}
                  >
                    {/* Knob Line Indicator */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                  </div>
                </div>
                <div className="text-xs font-mono text-amber-400 font-semibold">{warmthVal}%</div>
              </div>

              {/* Knob 2: Speaker Balance */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">SPEAKER BAL</div>
                <div className="relative inline-flex items-center justify-center p-3 rounded-full neo-outset cursor-pointer group">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md relative transition-transform duration-200"
                    style={{ transform: `rotate(${(speakerBalVal - 50) * 1.8}deg)` }}
                    onClick={() => setSpeakerBalVal((prev) => (prev >= 100 ? 10 : prev + 15))}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366F1]" />
                  </div>
                </div>
                <div className="text-xs font-mono text-indigo-400 font-semibold">{speakerBalVal}%</div>
              </div>

              {/* Knob 3: Clarity Engine */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">NEURAL CLARITY</div>
                <div className="relative inline-flex items-center justify-center p-3 rounded-full neo-outset cursor-pointer group">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md relative transition-transform duration-200"
                    style={{ transform: `rotate(${(clarityVal - 50) * 1.8}deg)` }}
                    onClick={() => setClarityVal((prev) => (prev >= 100 ? 10 : prev + 15))}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#22C55E]" />
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold">{clarityVal}%</div>
              </div>

            </div>

          </div>

          {/* Neomorphic Soft-Touch Push Buttons Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-200 neo-outset hover:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>AI COMPRESSOR</span>
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-200 neo-outset hover:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>SPATIAL STEREO</span>
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-200 neo-outset hover:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>DE-ESSER V2</span>
              </button>
            </div>

            <button 
              onClick={togglePlay}
              className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isPlaying ? 'PAUSE SIGNAL' : 'TEST MASTER AUDIO'}</span>
            </button>
          </div>

        </div>
      </section>


      {/* ================= MULTI-SPEAKER CASTING RACK ============ */}
      <section id="speakers" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full studio-glass text-amber-400 text-xs font-mono mb-3">
            <UserPlus className="w-3.5 h-3.5" />
            <span>AI SPEAKER ENSEMBLE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
            Cast Diverse AI Personalities
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Combine distinct voices for natural, back-and-forth podcast dialogue.
          </p>
        </div>

        {/* Speaker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Speaker 1: Alex */}
          <div className="relative rounded-2xl studio-glass p-6 border border-white/10 hover:border-amber-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold font-display text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Alex</h3>
                  <span className="text-xs font-mono text-amber-400">HOST • WARM & ENGAGING</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20">
                DEFAULT
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Natural conversational tone, ideal for introducing topics and guiding interview flows.
            </p>

            <div className="pt-2">
              <Waveform barCount={20} height={16} color="#F59E0B" animated={isPlaying} />
            </div>
          </div>

          {/* Speaker 2: Sarah */}
          <div className="relative rounded-2xl studio-glass p-6 border border-white/10 hover:border-indigo-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold font-display text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  S
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Sarah</h3>
                  <span className="text-xs font-mono text-indigo-400">CO-HOST • ENERGETIC</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                POPULAR
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Upbeat and quick-witted speaker, perfect for tech reviews, news breakdowns, and Q&A.
            </p>

            <div className="pt-2">
              <Waveform barCount={20} height={16} color="#6366F1" animated={isPlaying} />
            </div>
          </div>

          {/* Speaker 3: Mike */}
          <div className="relative rounded-2xl studio-glass p-6 border border-white/10 hover:border-emerald-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold font-display text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  M
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Mike</h3>
                  <span className="text-xs font-mono text-emerald-400">GUEST • AUTHORITATIVE</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                EXPERT
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Deep, calm resonance suited for educational content, business analysis, and narration.
            </p>

            <div className="pt-2">
              <Waveform barCount={20} height={16} color="#22C55E" animated={isPlaying} />
            </div>
          </div>

        </div>
      </section>


      {/* ================= CREDIT & PRICING CALCULATOR ============ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl studio-glass p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full studio-glass-amber text-amber-400 text-xs font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>TRANSPARENT CREDIT FORMULA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
                Simple Credit Calculation
              </h2>
              <p className="text-slate-400 text-base">
                Credits are strictly calculated using <code className="text-amber-400 font-mono px-2 py-0.5 bg-slate-900 rounded border border-slate-800">ceil((duration × speakers) / 5)</code>. Every new user gets 5 free credits on signup.
              </p>

              {/* Interactive Duration & Speaker Sliders */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                    <span>PODCAST DURATION:</span>
                    <span className="text-amber-400 font-bold">{durationMins} MINUTES</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="60" 
                    step="5"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                    <span>SPEAKER COUNT:</span>
                    <span className="text-amber-400 font-bold">{speakerCount} SPEAKERS</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="1"
                    value={speakerCount}
                    onChange={(e) => setSpeakerCount(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Credit Result Box */}
            <div className="lg:col-span-5 bg-slate-950/90 p-6 sm:p-8 rounded-2xl border border-slate-800 text-center space-y-4 neo-inset">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                ESTIMATED CREDIT COST
              </div>
              <div className="text-5xl sm:text-6xl font-extrabold font-display text-amber-400">
                {requiredCredits} <span className="text-lg font-normal text-slate-400 font-mono">CREDITS</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>5 FREE CREDITS INCLUDED ON SIGNUP</span>
              </div>

              <a
                href="/login"
                className="block w-full py-4 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                Claim Free Credits & Start
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
