/**
 * ============================================================================
 * AUDIO PLAYER COMPONENT
 * ============================================================================
 * 
 * This is a custom audio player with waveform visualization, playback controls,
 * and a modern design. It's more feature-rich than the default HTML5 audio player.
 * 
 * HOW AUDIO PLAYBACK WORKS IN BROWSERS:
 * --------------------------------------
 * 1. Create an <audio> element (hidden)
 * 2. Use JavaScript to control it (play, pause, seek, etc.)
 * 3. Use Web Audio API to analyze the audio (for waveform)
 * 4. Draw the waveform on a <canvas> element
 * 
 * THE WEB AUDIO API FLOW:
 * -----------------------
 * Audio Element → MediaElementSource → AnalyserNode → Destination (speakers)
 *                    ↑                       ↑
 *              Extracts audio         Analyzes frequencies
 *              from HTML element      (for visualization)
 * 
 * ============================================================================
 */

// Import React hooks for state and side effects
import { useState, useRef, useEffect, useCallback } from 'react';
// Import icons from lucide-react
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';
// Import our custom Button component
import { Button } from '@/components/ui/Button';
// Import audio visualization components
import { AudioBars } from '@/components/animations/AudioBars';

/**
 * Props for the AudioPlayer component
 * 
 * audioUrl: URL of the audio file to play
 * title: Optional title to display
 * speakers: Optional array of speakers (for color coding)
 * onDownload: Optional callback when download button is clicked
 */
interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  speakers?: { name: string; color: string }[];
  onDownload?: () => void;
}

/**
 * AudioPlayer Component
 * ====================
 * 
 * A full-featured audio player with:
 * - Play/Pause button
 * - Skip forward/back 10 seconds
 * - Volume control
 * - Progress bar (click to seek)
 * - Waveform visualization
 * - Download button
 */
export function AudioPlayer({
  audioUrl,
  title,
  speakers = [],
  onDownload,
}: AudioPlayerProps) {
  /**
   * useRef creates references that persist across renders.
   * These don't trigger re-renders when changed (unlike useState).
   * 
   * audioRef: Points to the hidden <audio> HTML element
   * canvasRef: Points to the <canvas> element for waveform
   * animationRef: ID for the animation loop (for cleanup)
   * analyserRef: Web Audio API analyser (gets frequency data)
   */
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  /**
   * useState creates state variables.
   * When these change, the component re-renders.
   * 
   * isPlaying: Is audio currently playing?
   * currentTime: Current position in the audio (seconds)
   * duration: Total length of the audio (seconds)
   * volume: Current volume (0 to 1)
   * isMuted: Is audio muted?
   */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  /**
   * EFFECT: Initialize Web Audio API
   * 
   * This effect runs when audioUrl changes.
   * It sets up the Web Audio API for frequency analysis.
   * 
   * THE FLOW:
   * 1. Create AudioContext (manages audio processing)
   * 2. Create AnalyserNode (extracts frequency data)
   * 3. Create MediaElementSource (connects <audio> to Web Audio)
   * 4. Connect everything in a chain
   * 5. Now we can read frequency data while audio plays
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;  // Safety check

    // Create AudioContext (one per page)
    const audioContext = new AudioContext();
    
    // Create AnalyserNode
    // fftSize = 256 means we get 128 frequency bins
    // (half of fftSize is the number of frequency data points)
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Connect <audio> element to Web Audio
    // This allows us to analyze the audio as it plays
    const source = audioContext.createMediaElementSource(audio);
    
    // Connect the chain: Audio → Analyser → Speakers
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Store analyser for later use
    analyserRef.current = analyser;

    // Cleanup: close AudioContext when component unmounts
    return () => {
      audioContext.close();
    };
  }, [audioUrl]);  // Re-run if audio URL changes

  /**
   * drawWaveform Function
   * ====================
   * 
   * Draws the audio waveform on the canvas.
   * This creates the "equalizer bars" visualization.
   * 
   * HOW CANVAS DRAWING WORKS:
   * -------------------------
   * 1. Get the 2D drawing context
   * 2. Clear the canvas
   * 3. Get frequency data from the analyser
   * 4. Draw bars for each frequency
   * 5. Repeat 60 times per second (requestAnimationFrame)
   * 
   * THE FREQUENCY DATA:
   * ------------------
   * The analyser gives us an array of values (0-255)
   * Each value represents how loud a frequency range is:
   * - Index 0: Low bass (20-100 Hz)
   * - Index 50: Mid frequencies (1-3 kHz)
   * - Index 100: High treble (8-16 kHz)
   */
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    // Get 2D drawing context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get frequency data
    const bufferLength = analyser.frequencyBinCount;  // 128
    const dataArray = new Uint8Array(bufferLength);   // Array of 128 values
    
    /**
     * The actual drawing function
     * Called every frame (~60fps)
     */
    const draw = () => {
      // Request next frame (creates animation loop)
      animationRef.current = requestAnimationFrame(draw);
      
      // Get current frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate bar dimensions
      const barWidth = (canvas.width / bufferLength) * 2.5;  // Wider bars
      let x = 0;  // Starting x position

      // Draw each bar
      for (let i = 0; i < bufferLength; i++) {
        // Convert frequency value (0-255) to bar height
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Create gradient (amber color, transparent at bottom)
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');  // Bottom: transparent
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.8)');  // Top: more opaque
        
        // Draw the bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        // Move to next bar position
        x += barWidth + 1;  // 1px gap between bars
      }
    };

    // Start the animation loop
    draw();
  }, []);  // Empty deps = function created once

  /**
   * EFFECT: Start/stop waveform animation
   * 
   * When isPlaying changes:
   * - If playing: start the waveform animation
   * - If paused: stop the animation (save CPU)
   */
  useEffect(() => {
    if (isPlaying) {
      drawWaveform();  // Start animation
    } else {
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    // Cleanup: stop animation when component unmounts
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  /**
   * EFFECT: Listen to audio events
   * 
   * The <audio> element fires events we can listen to:
   * - timeupdate: Fires every ~250ms with current time
   * - loadedmetadata: Fires when audio duration is known
   * - ended: Fires when audio finishes playing
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Update current time
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    
    // Update duration
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    // Stop playing when audio ends
    const handleEnded = () => setIsPlaying(false);

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Cleanup: remove listeners when component unmounts
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  /**
   * togglePlay Function
   * ===================
   * Toggles between play and pause.
   */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * seek Function
   * =============
   * Seeks to a position when the progress bar is clicked.
   * 
   * HOW IT WORKS:
   * 1. Calculate where user clicked (percentage of width)
   * 2. Convert percentage to time (percentage × duration)
   * 3. Set audio.currentTime to that time
   */
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Get click position relative to element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    // Seek to that position
    audio.currentTime = percentage * duration;
  };

  /**
   * skipBack Function
   * =================
   * Skips backward 10 seconds.
   * Math.max ensures we don't go below 0.
   */
  const skipBack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  /**
   * skipForward Function
   * ====================
   * Skips forward 10 seconds.
   * Math.min ensures we don't go past the end.
   */
  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }
  };

  /**
   * toggleMute Function
   * ===================
   * Toggles mute on/off.
   */
  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  /**
   * handleVolumeChange Function
   * ===========================
   * Handles volume slider changes.
   * 
   * @param e - The input change event
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const value = parseFloat(e.target.value);  // Convert string to number
    if (audio) {
      audio.volume = value;
      setVolume(value);
      setIsMuted(value === 0);  // Auto-mute if volume is 0
    }
  };

  /**
   * formatTime Function
   * ===================
   * Converts seconds to MM:SS format.
   * 
   * Example: 125 → "2:05"
   */
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the progress bar
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Hidden audio element (controlled via JavaScript) */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Title and speakers */}
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {speakers.length > 0 && (
            <div className="flex gap-2 mt-2">
              {speakers.map((speaker, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${speaker.color}20`, color: speaker.color }}
                >
                  {speaker.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Waveform Visualization Canvas */}
      <div className="relative h-24 mb-4 rounded-lg overflow-hidden bg-muted/30 group">
        <canvas
          ref={canvasRef}
          width={800}
          height={96}
          className="w-full h-full"
        />
        {/* Progress overlay (shows how far through the audio) */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        {/* Play indicator */}
        {!isPlaying && duration > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-primary" />
          </div>
        )}
      </div>

      {/* Progress Bar (click to seek) */}
      <div
        className="relative h-2 bg-muted rounded-full cursor-pointer mb-4"
        onClick={seek}
      >
        {/* Filled portion */}
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        {/* Drag handle */}
        <div
          className="absolute w-4 h-4 bg-primary rounded-full -top-1 transform -translate-x-1/2 shadow-lg"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={skipBack}>
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Button
              variant="default"
              size="icon"
              className="w-14 h-14 rounded-full relative z-10"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            {isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-0">
                <AudioBars barCount={5} color="#F59E0B" isPlaying={isPlaying} className="h-4 w-8" />
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={skipForward}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume and download controls */}
        <div className="flex items-center gap-4">
          {/* Volume control */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Download button (only shown if onDownload is provided) */}
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload}>
              <Download className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
