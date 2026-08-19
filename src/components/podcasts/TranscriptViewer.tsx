/**
 * ============================================================================
 * TRANSCRIPT VIEWER COMPONENT
 * ============================================================================
 * 
 * This component displays a podcast transcript with speaker color coding
 * and the ability to click on lines to seek to that position in the audio.
 * 
 * WHAT IS A TRANSCRIPT?
 * ---------------------
 * A transcript is a written version of the audio content. It shows:
 * - Who said what (speaker names)
 * - What they said (the text)
 * - When they said it (timestamps, optional)
 * 
 * HOW TRANSCRIPT PARSING WORKS:
 * ----------------------------
 * The transcript is stored as a single string with lines like:
 * "Speaker Name: What they said"
 * 
 * We parse this string into an array of objects:
 * [{ speaker: "Speaker Name", text: "What they said" }]
 * 
 * ============================================================================
 */

// Import React hooks
import { useRef, useEffect } from 'react';
// Import utility function for combining CSS class names
import { cn } from '@/lib/utils';

/**
 * TranscriptLine Interface
 * ========================
 * Defines the structure of a single transcript line.
 * 
 * speaker: Who said this line
 * text: What they said
 * startTime: When this line starts in the audio (optional)
 * endTime: When this line ends in the audio (optional)
 */
interface TranscriptLine {
  speaker: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Props for the TranscriptViewer component
 * 
 * transcript: The full transcript text
 * speakers: Array of speakers with their colors
 * currentTime: Current playback position (for highlighting active line)
 * onSeek: Callback when a line is clicked (seeks to that time)
 */
interface TranscriptViewerProps {
  transcript: string;
  speakers?: { name: string; color: string }[];
  currentTime?: number;
  onSeek?: (time: number) => void;
}

/**
 * Predefined colors for speakers
 * These are used when speaker colors aren't provided
 */
const SPEAKER_COLORS = [
  '#F59E0B', // amber
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

/**
 * TranscriptViewer Component
 * =========================
 * 
 * Displays a scrollable transcript with:
 * - Speaker avatars (first letter of name)
 * - Color-coded speaker names
 * - Click-to-seek functionality
 * - Auto-scroll to active line
 */
export function TranscriptViewer({
  transcript,
  speakers = [],
  currentTime,
  onSeek,
}: TranscriptViewerProps) {
  /**
   * useRef creates references to DOM elements
   * 
   * containerRef: Points to the scrollable container
   * activeLineRef: Points to the currently active line
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  /**
   * parseTranscript Function
   * ========================
   * 
   * Parses a transcript string into an array of TranscriptLine objects.
   * 
   * INPUT:
   * "John: Hello everyone!\nJane: Hi John!"
   * 
   * OUTPUT:
   * [
   *   { speaker: "John", text: "Hello everyone!" },
   *   { speaker: "Jane", text: "Hi John!" }
   * ]
   * 
   * HOW IT WORKS:
   * 1. Split the string by newlines
   * 2. Filter out empty lines
   * 3. For each line, try to match the "Speaker: Text" pattern
   * 4. If match, extract speaker and text
   * 5. If no match, treat whole line as text (no speaker)
   */
  const parseTranscript = (text: string): TranscriptLine[] => {
    // Split by newline and remove empty lines
    const lines = text.split('\n').filter((line) => line.trim());
    
    // Parse each line
    return lines.map((line) => {
      // Regular expression to match "Speaker: Text"
      // ^([^:]+) matches everything before the first colon (speaker)
      // :\s* matches the colon and optional space
      // (.+)$ matches everything after (text)
      const match = line.match(/^([^:]+):\s*(.+)$/);
      
      if (match) {
        // Found a speaker line
        return {
          speaker: match[1].trim(),  // Speaker name
          text: match[2].trim(),      // What they said
        };
      }
      
      // No speaker found, treat as plain text
      return { speaker: '', text: line.trim() };
    });
  };

  // Parse the transcript when it changes
  const lines = parseTranscript(transcript);

  /**
   * getSpeakerColor Function
   * ========================
   * 
   * Returns a color for a speaker.
   * 
   * Priority:
   * 1. Use color from speakers prop (if provided)
   * 2. Otherwise, assign color based on speaker index
   */
  const getSpeakerColor = (speakerName: string) => {
    // First, check if speaker has a color in the speakers prop
    const speaker = speakers.find(
      (s) => s.name.toLowerCase() === speakerName.toLowerCase()
    );
    if (speaker?.color) return speaker.color;
    
    // If no color provided, assign based on index
    const index = lines.findIndex(
      (l) => l.speaker.toLowerCase() === speakerName.toLowerCase()
    );
    return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
  };

  /**
   * EFFECT: Auto-scroll to active line
   * 
   * When currentTime changes, scroll to the active line.
   * This keeps the transcript in sync with audio playback.
   */
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',  // Smooth scrolling animation
        block: 'center',     // Scroll to center of viewport
      });
    }
  }, [currentTime]);

  /**
   * Get unique speaker names
   * 
   * We use Set to remove duplicates, then convert back to array.
   * Example: ["John", "Jane", "John"] → Set{"John", "Jane"} → ["John", "Jane"]
   */
  const uniqueSpeakers = [...new Set(lines.map((l) => l.speaker).filter(Boolean))];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header with title and speaker badges */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold">Transcript</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {uniqueSpeakers.map((speaker) => (
            <span
              key={speaker}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                // Light background with full opacity text
                backgroundColor: `${getSpeakerColor(speaker)}20`,
                color: getSpeakerColor(speaker),
              }}
            >
              {speaker}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable transcript content */}
      <div
        ref={containerRef}
        className="p-6 max-h-96 overflow-y-auto space-y-4"
      >
        {lines.map((line, index) => {
          /**
           * Determine if this line is currently active
           * 
           * A line is "active" if:
           * 1. We have currentTime (audio is playing)
           * 2. The line has a startTime
           * 
           * In the future, you could check if:
           * currentTime >= line.startTime && currentTime < line.endTime
           */
          const isActive = currentTime !== undefined && line.startTime !== undefined;
          
          return (
            <div
              key={index}
              // Only set ref on the active line (for auto-scroll)
              ref={isActive ? activeLineRef : undefined}
              className={cn(
                // Base styles
                'flex gap-3 p-3 rounded-lg transition-colors duration-200',
                // Active line highlight
                isActive && 'bg-muted/50',
                // Clickable if onSeek is provided
                onSeek && 'cursor-pointer hover:bg-muted/30'
              )}
              onClick={() => {
                // Seek to this line's start time when clicked
                if (onSeek && line.startTime !== undefined) {
                  onSeek(line.startTime);
                }
              }}
            >
              {/* Speaker avatar (first letter of name) */}
              {line.speaker && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-background flex-shrink-0"
                  style={{ backgroundColor: getSpeakerColor(line.speaker) }}
                >
                  {line.speaker.charAt(0)}
                </div>
              )}
              
              {/* Speaker name and text */}
              <div className="flex-1">
                {line.speaker && (
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: getSpeakerColor(line.speaker) }}
                  >
                    {line.speaker}
                  </p>
                )}
                <p className="text-foreground leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
