/**
 * ============================================================================
 * CLOUDFLARE WORKER - Podcast Generation API
 * ============================================================================
 * 
 * This is a Cloudflare Worker that handles podcast generation.
 * It runs on Cloudflare's edge network (not your browser).
 * 
 * WHAT IS A CLOUDFLARE WORKER?
 * ----------------------------
 * A Worker is a serverless function that runs on Cloudflare's network.
 * It's like a tiny server that:
 * - Receives HTTP requests
 * - Processes them
 * - Returns responses
 * 
 * WHY USE A WORKER?
 * -----------------
 * - Keeps API keys secret (not exposed to browser)
 * - Handles heavy processing (audio generation)
 * - Runs close to users (fast response times)
 * - No server to manage
 * 
 * THE GENERATION FLOW:
 * -------------------
 * 1. Client sends podcastId, topic, speakers
 * 2. Worker generates script using Gemini
 * 3. Worker generates audio using Gemini TTS
 * 4. Worker uploads audio to Supabase Storage
 * 5. Worker updates podcast record in database
 * 6. Worker returns success response
 * 
 * ============================================================================
 */

/**
 * Env Interface - Environment Variables
 * 
 * These are secret values set in Cloudflare dashboard.
 * They're like environment variables on a traditional server.
 */
interface Env {
  /** Google Gemini API key for AI generation */
  GEMINI_API_KEY: string;
  
  /** Supabase project URL */
  SUPABASE_URL: string;
  
  /** Supabase service role key (admin access) */
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * GenerationRequest Interface
 * 
 * Defines what the client must send to trigger generation.
 */
interface GenerationRequest {
  /** The podcast ID to generate */
  podcastId: string;
  
  /** What the podcast is about */
  topic: string;
  
  /** Array of speakers with their configurations */
  speakers: Array<{
    id: string;
    name: string;
    voiceId: string;
    tone: string;
    career: string;
    personality: string;
  }>;
  
  /** Duration in minutes (5, 10, 15, 20, 25, 30, 32, 45, 60) */
  duration: number;
  
  /** Optional additional notes */
  notes?: string;
  
  /** Optional source material content */
  sourceMaterial?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    try {
      const body: GenerationRequest = await request.json();
      
      // Validate request
      if (!body.podcastId || !body.topic || !body.speakers?.length || !body.duration) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      // Validate duration
      const validDurations = [5, 10, 15, 20, 25, 30, 32, 45, 60];
      if (!validDurations.includes(body.duration)) {
        return new Response(
          JSON.stringify({ error: 'Invalid duration. Must be one of: ' + validDurations.join(', ') }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      // Update podcast status to 'generating'
      await updatePodcastStatus(env, body.podcastId, 'generating');

      // Generate script using Gemini
      const script = await generateScript(env, body);

      // Generate audio segments for each speaker
      const audioSegments = await generateAudioSegments(env, script, body.speakers);

      // Concatenate audio segments
      const finalAudio = await concatenateAudio(audioSegments);

      // Upload audio to Supabase Storage
      const audioUrl = await uploadAudio(env, body.podcastId, finalAudio);

      // Update podcast with results
      await updatePodcastComplete(env, body.podcastId, {
        audio_url: audioUrl,
        transcript: script.transcript,
        duration: finalAudio.duration,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          audioUrl,
          duration: finalAudio.duration,
        }),
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Generation error:', error);
      
      // Update podcast status to 'failed'
      if (error instanceof Error && error.message.includes('podcastId')) {
        // Try to extract podcastId from error context
      }

      return new Response(
        JSON.stringify({ error: 'Generation failed' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
  },
};

async function generateScript(
  env: Env,
  request: GenerationRequest
): Promise<{ transcript: string; segments: Array<{ speaker: string; text: string }> }> {
  const speakerContext = request.speakers
    .map(
      (s) =>
        `${s.name} (tone: ${s.tone}, career: ${s.career}, personality: ${s.personality})`
    )
    .join('\n');

  const prompt = `You are a podcast script writer. Create a natural, engaging conversation between speakers on the given topic.

Speakers:
${speakerContext}

Topic: ${request.topic}
${request.notes ? `Additional Notes: ${request.notes}` : ''}
${request.sourceMaterial ? `Source Material: ${request.sourceMaterial}` : ''}

Requirements:
1. Create a natural dialogue between the speakers
2. Each speaker should have 5-10 turns
3. Make the conversation engaging and informative
4. Include natural transitions and reactions
5. Keep the total length to about ${request.duration} minutes of speaking time

Format the output as a transcript with speaker names:
Speaker Name: their dialogue text

Only output the transcript, no additional text.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  const data = await response.json();
  const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse transcript into segments
  const lines = transcript.split('\n').filter((line) => line.trim());
  const segments = lines
    .map((line) => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        return { speaker: match[1].trim(), text: match[2].trim() };
      }
      return null;
    })
    .filter(Boolean) as Array<{ speaker: string; text: string }>;

  return { transcript, segments };
}

async function generateAudioSegments(
  env: Env,
  script: { segments: Array<{ speaker: string; text: string }> },
  speakers: GenerationRequest['speakers']
): Promise<Array<{ speaker: string; audio: ArrayBuffer; duration: number }>> {
  const segments: Array<{ speaker: string; audio: ArrayBuffer; duration: number }> = [];

  for (const segment of script.segments) {
    const speaker = speakers.find(
      (s) => s.name.toLowerCase() === segment.speaker.toLowerCase()
    );
    
    if (!speaker) continue;

    // Gemini TTS has a limit of ~5000 characters per request
    // Split long segments if needed
    const textChunks = splitText(segment.text, 4500);
    
    for (const chunk of textChunks) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: chunk }] }],
            generationConfig: {
              responseModalities: ['audio'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: speaker.voiceId,
                  },
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      
      if (audioData?.data) {
        const audioBuffer = base64ToArrayBuffer(audioData.data);
        const duration = estimateDuration(audioBuffer.byteLength);
        
        segments.push({
          speaker: segment.speaker,
          audio: audioBuffer,
          duration,
        });
      }
    }
  }

  return segments;
}

async function concatenateAudio(
  segments: Array<{ speaker: string; audio: ArrayBuffer; duration: number }>
): Promise<{ audio: ArrayBuffer; duration: number }> {
  // Simple concatenation - in production, use ffmpeg or similar
  // This creates a WAV file from PCM data
  
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
  const sampleRate = 24000; // Gemini TTS output rate
  const channels = 1;
  const bitsPerSample = 16;
  
  // Calculate total data size
  const totalDataSize = segments.reduce((sum, seg) => sum + seg.audio.byteLength, 0);
  
  // Create WAV header
  const header = createWavHeader(totalDataSize, sampleRate, channels, bitsPerSample);
  
  // Concatenate all audio data
  const concatenated = new Uint8Array(header.byteLength + totalDataSize);
  concatenated.set(new Uint8Array(header), 0);
  
  let offset = header.byteLength;
  for (const segment of segments) {
    concatenated.set(new Uint8Array(segment.audio), offset);
    offset += segment.audio.byteLength;
  }
  
  return {
    audio: concatenated.buffer,
    duration: totalDuration,
  };
}

function createWavHeader(
  dataLength: number,
  sampleRate: number,
  channels: number,
  bitsPerSample: number
): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true); // byte rate
  view.setUint16(32, channels * (bitsPerSample / 8), true); // block align
  view.setUint16(34, bitsPerSample, true);
  
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  return header;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function estimateDuration(audioBytes: number): number {
  // Gemini TTS outputs 24kHz 16-bit mono PCM
  const bytesPerSecond = 24000 * 2; // 24000 samples/sec * 2 bytes/sample
  return audioBytes / bytesPerSecond;
}

function splitText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];
  
  const chunks: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    
    // Find a good break point (period, question mark, exclamation, comma)
    let breakPoint = maxLength;
    for (let i = maxLength; i > maxLength - 100 && i > 0; i--) {
      if (/[.!?]/.test(remaining[i])) {
        breakPoint = i + 1;
        break;
      }
    }
    
    chunks.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trim();
  }
  
  return chunks;
}

async function updatePodcastStatus(env: Env, podcastId: string, status: string) {
  await fetch(`${env.SUPABASE_URL}/rest/v1/podcasts?id=eq.${podcastId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
     apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ status }),
  });
}

async function updatePodcastComplete(
  env: Env,
  podcastId: string,
  data: { audio_url: string; transcript: string; duration: number }
) {
  await fetch(`${env.SUPABASE_URL}/rest/v1/podcasts?id=eq.${podcastId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status: 'completed',
      audio_url: data.audio_url,
      transcript: data.transcript,
      duration: data.duration,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function uploadAudio(
  env: Env,
  podcastId: string,
  audio: { audio: ArrayBuffer; duration: number }
): Promise<string> {
  const filename = `podcasts/${podcastId}/audio.wav`;
  
  const response = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/podcast-audios/${filename}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: audio.audio,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload audio');
  }

  return `${env.SUPABASE_URL}/storage/v1/object/public/podcast-audios/${filename}`;
}
