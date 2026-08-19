/**
 * ============================================================================
 * GEMINI API CLIENT - AI Script & Audio Generation
 * ============================================================================
 * 
 * This file contains all the functions for interacting with Google's Gemini API.
 * Gemini is Google's AI model that can:
 * - Generate text (scripts)
 * - Generate speech (TTS - Text-to-Speech)
 * 
 * HOW THE GEMINI API WORKS:
 * -------------------------
 * 1. You send a request with your API key
 * 2. You specify what you want (text generation, TTS, etc.)
 * 3. Gemini processes your request
 * 4. Gemini returns the result (text or audio data)
 * 
 * THE TWO GEMINI MODELS WE USE:
 * ----------------------------
 * 1. gemini-2.5-flash: For generating podcast scripts (text)
 * 2. gemini-2.5-flash-preview-tts: For converting text to speech (audio)
 * 
 * ============================================================================
 */

// Import types for type safety
import type { GeminiVoice, Speaker } from '@/types';

/**
 * API Configuration
 * 
 * GEMINI_API_KEY: Your Google AI API key (from Google AI Studio)
 * GEMINI_API_URL: Base URL for all Gemini API requests
 * 
 * The URL includes /v1beta because we're using the beta version
 * of the API (newer features, might change).
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * ============================================================================
 * INTERFACES - Data Structures
 * ============================================================================
 * 
 * Interfaces define the shape of objects in TypeScript.
 * They're like blueprints that specify what properties an object must have.
 * 
 * ============================================================================
 */

/**
 * Parameters for generating a script
 * 
 * topic: What the podcast is about
 * speakers: Array of speaker objects
 * notes: Optional additional notes for the AI
 * sourceMaterial: Optional document to reference
 */
interface GenerateScriptParams {
  topic: string;
  speakers: Speaker[];
  notes?: string;
  sourceMaterial?: string;
}

/**
 * Parameters for generating TTS audio
 * 
 * script: The text to convert to speech
 * speakers: Array of speaker objects (for voice assignment)
 */
interface GenerateTTSParams {
  script: string;
  speakers: Speaker[];
}

/**
 * Result from TTS generation
 * 
 * audioData: Base64-encoded audio data
 * transcript: The formatted script that was spoken
 */
interface TTSResult {
  audioData: string; // base64 encoded audio
  transcript: string;
}

/**
 * ============================================================================
 * SCRIPT GENERATION
 * ============================================================================
 * 
 * Generates a podcast conversation script using Gemini.
 * 
 * HOW IT WORKS:
 * 1. Create a prompt describing the speakers and topic
 * 2. Send the prompt to Gemini
 * 3. Gemini generates a conversation
 * 4. Return the generated text
 * 
 * THE PROMPT STRUCTURE:
 * --------------------
 * "Create a natural conversation between [speakers] about [topic]"
 * 
 * The prompt includes:
 * - Speaker descriptions (name, tone, career, personality)
 * - The topic
 * - Optional notes and source material
 * - Formatting instructions
 * 
 * @param params - The generation parameters
 * @returns The generated script as a string
 */
export async function generateScript(params: GenerateScriptParams): Promise<string> {
  const { topic, speakers, notes, sourceMaterial } = params;

  /**
   * Create speaker descriptions
   * 
   * .map() transforms each speaker into a description string
   * .join('\n') combines all descriptions with newlines
   * 
   * Example output:
   * "- John (professional tone, tech expert, personality: curious)"
   * "- Jane (casual tone, scientist, personality: enthusiastic)"
   */
  const speakerDescriptions = speakers
    .map((s) => `- ${s.name} (${s.tone || 'neutral'} tone, ${s.career || 'speaker'}, personality: ${s.personality || 'friendly'})`)
    .join('\n');

  /**
   * Build the prompt
   * 
   * Template literals (backticks) let us embed variables in strings.
   * ${variable} inserts the variable's value.
   * 
   * The prompt is carefully crafted to get good results:
   * - Specifies format (SpeakerName: dialogue)
   * - Asks for natural, engaging conversation
   * - Sets length (5-8 exchanges)
   */
  const prompt = `Create a natural, engaging podcast conversation between the following speakers:

${speakerDescriptions}

Topic: ${topic}
${notes ? `\nImportant notes to include:\n${notes}` : ''}
${sourceMaterial ? `\nSource material to reference:\n${sourceMaterial}` : ''}

Format the conversation as:
SpeakerName: dialogue

Make it sound like a real podcast - with natural transitions, engaging questions, and informative responses. Keep it conversational and interesting. Aim for about 5-8 exchanges between speakers.`;

  /**
   * Make the API request
   * 
   * fetch() is the browser's built-in function for making HTTP requests.
   * 
   * The URL includes:
   * - The base API URL
   * - The model name (gemini-2.5-flash)
   * - The action (generateContent)
   * - Your API key
   * 
   * The request body contains:
   * - contents: The prompt text
   * - generationConfig: Settings for the generation
   *   - temperature: 0.8 (creativity level, 0-1)
   *   - maxOutputTokens: 2048 (max response length)
   */
  const response = await fetch(
    `${GEMINI_API_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,      // Higher = more creative
          maxOutputTokens: 2048, // Max response length
        },
      }),
    }
  );

  // Check for errors
  if (!response.ok) {
    throw new Error('Failed to generate script');
  }

  // Parse the response
  const data = await response.json();
  
  /**
   * Extract the generated text
   * 
   * The response structure is:
   * data.candidates[0].content.parts[0].text
   * 
   * We use optional chaining (?.) to safely access nested properties.
   * If any part is null/undefined, the whole expression returns undefined.
   */
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * ============================================================================
 * TEXT-TO-SPEECH (TTS) GENERATION
 * ============================================================================
 * 
 * Converts a script into audio using Gemini's TTS model.
 * 
 * HOW GEMINI TTS WORKS:
 * --------------------
 * 1. You provide a script with speaker labels
 * 2. You configure which voice each speaker uses
 * 3. Gemini generates audio for the entire conversation
 * 4. The audio includes both speakers with their assigned voices
 * 
 * LIMITATIONS:
 * -----------
 * - Gemini TTS supports max 2 speakers at once
 * - For 3+ speakers, you'd need to generate separately and combine
 * 
 * @param params - The TTS parameters
 * @returns Object with audioData (base64) and transcript
 */
export async function generateTTS(params: GenerateTTSParams): Promise<TTSResult> {
  const { script, speakers } = await Promise.resolve(params);

  /**
   * Parse the script into lines
   * 
   * Each line should be in format: "SpeakerName: What they said"
   * We filter out empty lines.
   */
  const lines = script.split('\n').filter((line) => line.trim());
  
  /**
   * Get the first 2 speakers (Gemini TTS limit)
   * 
   * .slice(0, 2) gets elements at index 0 and 1
   * If there's only 1 speaker, it returns just that one
   */
  const primarySpeakers = speakers.slice(0, 2);
  
  /**
   * Create voice configuration for each speaker
   * 
   * This tells Gemini which voice to use for each speaker.
   * The voiceConfig object matches Gemini's expected format.
   */
  const speakerVoiceConfigs = primarySpeakers.map((speaker) => ({
    speaker: speaker.name,
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: speaker.voice_id as GeminiVoice,
      },
    },
  }));

  /**
   * Format the script for TTS
   * 
   * We parse each line to ensure consistent formatting:
   * - Trim extra whitespace
   * - Ensure proper "Name: Text" format
   */
  const formattedScript = lines
    .map((line) => {
      // Try to match "Speaker: Text" pattern
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, speakerName, dialogue] = match;
        return `${speakerName.trim()}: ${dialogue.trim()}`;
      }
      // If no match, return as-is
      return line;
    })
    .join('\n');

  /**
   * Make the TTS API request
   * 
   * This uses a different model: gemini-2.5-flash-preview-tts
   * The key differences from text generation:
   * - responseModalities: ['AUDIO'] tells Gemini to return audio
   * - speechConfig: Configures which voice each speaker uses
   */
  const response = await fetch(
    `${GEMINI_API_URL}/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formattedScript }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],  // We want audio, not text
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs,
            },
          },
        },
      }),
    }
  );

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to generate TTS');
  }

  // Parse response
  const data = await response.json();
  
  /**
   * Extract audio data
   * 
   * The audio is returned as base64-encoded data.
   * Base64 is a way to represent binary data (audio) as text.
   * 
   * Structure: data.candidates[0].content.parts[0].inlineData.data
   */
  const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioData) {
    throw new Error('No audio data received');
  }

  return {
    audioData,        // Base64-encoded audio
    transcript: formattedScript,  // The script that was spoken
  };
}

/**
 * ============================================================================
 * VOICE PREVIEW
 * ============================================================================
 * 
 * Generates a short audio sample for a specific voice.
 * This lets users hear what a voice sounds like before selecting it.
 * 
 * @param voiceId - The voice to preview (e.g., "Zephyr", "Puck")
 * @param sampleText - Optional custom text to speak
 * @returns Base64-encoded audio data
 */
export async function previewVoice(
  voiceId: GeminiVoice,
  sampleText?: string
): Promise<string> {
  // Default sample text if none provided
  const text = sampleText || "Hello, I'm your podcast host. Let's dive into today's topic.";

  const response = await fetch(
    `${GEMINI_API_URL}/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceId,
              },
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to preview voice');
  }

  const data = await response.json();
  const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioData) {
    throw new Error('No audio data received');
  }

  return audioData;
}

/**
 * ============================================================================
 * AUDIO CONVERSION UTILITIES
 * ============================================================================
 * 
 * These functions convert between different audio formats.
 * 
 * BASE64 EXPLAINED:
 * ----------------
 * Base64 is a way to represent binary data (like audio) as text.
 * It uses 64 characters (A-Z, a-z, 0-9, +, /) to encode bytes.
 * 
 * Why use base64?
 * - JSON can't contain binary data
 * - Base64 lets us send audio through JSON APIs
 * - We decode it back to binary on the client
 * 
 * ============================================================================
 */

/**
 * Converts base64-encoded audio to a Blob
 * 
 * BLOB EXPLAINED:
 * --------------
 * A Blob is a browser object that represents binary data.
 * It's used to create URLs for audio/video elements.
 * 
 * THE CONVERSION PROCESS:
 * ----------------------
 * 1. atob(): Decode base64 string to binary string
 * 2. Create Uint8Array: Convert string to byte array
 * 3. Create Blob: Wrap bytes with MIME type
 * 
 * @param base64 - The base64-encoded audio string
 * @param mimeType - The audio format (default: 'audio/wav')
 * @returns A Blob object containing the audio data
 */
export function base64ToAudioBlob(base64: string, mimeType: string = 'audio/wav'): Blob {
  // Decode base64 to binary string
  const binaryString = atob(base64);
  
  // Create byte array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create Blob with the audio bytes
  return new Blob([bytes], { type: mimeType });
}

/**
 * Creates a playable URL from base64 audio data
 * 
 * URL.createObjectURL() creates a temporary URL that points to the Blob.
 * This URL can be used in <audio> elements or download links.
 * 
 * IMPORTANT: These URLs are temporary and should be revoked when done
 * to free memory: URL.revokeObjectURL(url)
 * 
 * @param base64 - The base64-encoded audio string
 * @returns A URL like "blob:http://localhost:5173/abc-123"
 */
export function createAudioUrl(base64: string): string {
  const blob = base64ToAudioBlob(base64);
  return URL.createObjectURL(blob);
}
