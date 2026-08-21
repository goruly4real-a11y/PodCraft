/**
 * ============================================================================
 * usePodcasts HOOK - Podcast Management
 * ============================================================================
 * 
 * This hook handles all podcast-related operations:
 * - Fetching podcasts from the database
 * - Creating new podcasts
 * - Updating existing podcasts
 * - Deleting podcasts
 * - Generating podcast audio (calls the API)
 * - Uploading source materials
 * - Fetching podcast speakers
 * 
 * WHAT IS A PODCAST?
 * -----------------
 * A podcast in PodCraft is an AI-generated audio conversation.
 * Each podcast has:
 * - A title and topic
 * - One or more speakers (AI characters)
 * - Optional source material (documents to base the conversation on)
 * - A generated script
 * - Generated audio
 * - A status (draft, generating, ready, error)
 * 
 * THE PODCAST LIFECYCLE:
 * ---------------------
 * 1. User creates a podcast (status: 'draft')
 * 2. User clicks "Generate" (status: 'generating')
 * 3. API generates script and audio
 * 4. Podcast is ready (status: 'ready')
 * - OR something went wrong (status: 'error')
 * 
 * ============================================================================
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { usePodcastStore } from '@/store';
import type { Podcast } from '@/types';

/**
 * usePodcasts Hook
 * ================
 * 
 * USAGE:
 * ------
 * function PodcastList() {
 *   const { podcasts, fetchPodcasts } = usePodcasts();
 *   
 *   useEffect(() => { fetchPodcasts(userId); }, [userId]);
 *   
 *   return podcasts.map(p => <p>{p.title}</p>);
 * }
 */
export function usePodcasts() {
  /**
   * Extract state and actions from the podcast store
   */
  const {
    podcasts,
    currentPodcast,
    loading,
    generating,
    error,
    setPodcasts,
    addPodcast,
    updatePodcast,
    removePodcast,
    setCurrentPodcast,
    setLoading,
    setGenerating,
    setError,
  } = usePodcastStore();

  /**
   * fetchPodcasts Function
   * =====================
   * 
   * Fetches all podcasts for a specific user.
   * 
   * SQL Generated:
   * SELECT * FROM podcasts WHERE user_id = 'xxx' ORDER BY created_at DESC
   * 
   * @param userId - The ID of the user whose podcasts to fetch
   */
  const fetchPodcasts = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });  // Newest first

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setPodcasts(data || []);
    setLoading(false);
  }, [setPodcasts, setLoading, setError]);

  /**
   * fetchPodcast Function
   * ====================
   * 
   * Fetches a single podcast by ID.
   * 
   * SQL Generated:
   * SELECT * FROM podcasts WHERE id = 'xxx' LIMIT 1
   * 
   * @param id - The podcast ID
   * @returns The podcast object, or null if not found
   */
  const fetchPodcast = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();  // Return single object, not array

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }

    setCurrentPodcast(data);
    setLoading(false);
    return data;
  }, [setCurrentPodcast, setLoading, setError]);

  /**
   * createPodcast Function
   * =====================
   * 
   * Creates a new podcast and associates speakers with it.
   * 
   * THIS IS A MULTI-STEP PROCESS:
   * ----------------------------
   * 1. Insert the podcast into the 'podcasts' table
   * 2. Insert speaker associations into 'podcast_speakers' table
   * 3. Add the podcast to the local store
   * 
   * THE PODCAST_SPEAKERS TABLE:
   * -------------------------
   * This is a "junction table" that links podcasts to speakers.
   * One podcast can have many speakers, one speaker can be in many podcasts.
   * This is called a "many-to-many" relationship.
   * 
   * @param userId - The ID of the user creating the podcast
   * @param podcast - The podcast data
   * @returns The newly created podcast object
   */
  const createPodcast = useCallback(async (
    userId: string,
    podcast: {
      title: string;
      topic?: string | null;
      notes?: string | null;
      script?: string | null;
      source_material_url?: string | null;
      source_material_name?: string | null;
      speakerIds: string[];  // Array of speaker IDs to associate
      duration?: number | null;  // Duration in minutes
    }
  ) => {
    setLoading(true);
    setError(null);

    // STEP 1: Create the podcast record
    const { data: podcastData, error: createError } = await supabase
      .from('podcasts')
      .insert({
        user_id: userId,
        title: podcast.title,
        topic: podcast.topic || null,
        notes: podcast.notes || null,
        script: podcast.script || null,
        source_material_url: podcast.source_material_url || null,
        source_material_name: podcast.source_material_name || null,
        duration: podcast.duration || null,
        status: 'draft',  // New podcasts start as drafts
      })
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      setLoading(false);
      throw new Error(createError.message);
    }

    // STEP 2: Associate speakers with the podcast
    if (podcast.speakerIds.length > 0) {
      // Map speaker IDs to the format Supabase expects
      const speakerEntries = podcast.speakerIds.map((speakerId) => ({
        podcast_id: podcastData.id,
        speaker_id: speakerId,
      }));

      const { error: speakerError } = await supabase
        .from('podcast_speakers')
        .insert(speakerEntries);

      if (speakerError) {
        setError(speakerError.message);
        setLoading(false);
        throw new Error(speakerError.message);
      }
    }

    // STEP 3: Update local store
    addPodcast(podcastData);
    setLoading(false);
    return podcastData;
  }, [addPodcast, setLoading, setError]);

  /**
   * updatePodcastById Function
   * =========================
   * 
   * Updates an existing podcast in the database.
   * 
   * @param id - The podcast ID to update
   * @param updates - The fields to update
   */
  const updatePodcastById = useCallback(async (
    id: string,
    updates: Partial<Omit<Podcast, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    setError(null);

    const { error: updateError } = await supabase
      .from('podcasts')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      throw new Error(updateError.message);
    }

    // Update local store
    updatePodcast(id, updates);
  }, [updatePodcast, setError]);

  /**
   * deletePodcast Function
   * =====================
   * 
   * Deletes a podcast from the database.
   * 
   * NOTE: Deleting a podcast also deletes:
   * - All podcast_speakers entries (CASCADE delete)
   * - The audio file in storage (if implemented)
   * 
   * @param id - The podcast ID to delete
   */
  const deletePodcast = useCallback(async (id: string) => {
    setError(null);

    const { error: deleteError } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      throw new Error(deleteError.message);
    }

    removePodcast(id);
  }, [removePodcast, setError]);

  /**
   * generatePodcast Function
   * =======================
   * 
   * Generates audio for a podcast by calling the API.
   * 
   * THE GENERATION FLOW:
   * -------------------
   * 1. Update status to 'generating'
   * 2. Call the generation API (Cloudflare Worker)
   * 3. API generates script using Gemini
   * 4. API generates audio using Gemini TTS
   * 5. API uploads audio to Supabase Storage
   * 6. API returns audio URL, transcript, and duration
   * 7. Update podcast with the results
   * 
   * WHAT HAPPENS IF IT FAILS:
   * ------------------------
   * - Status is set to 'error'
   * - Error message is stored
   * - User can try again
   * 
   * @param podcastId - The podcast ID to generate
   * @param duration - Duration in minutes (5, 10, 15, 20, 25, 30, 32, 45, 60)
   * @returns The generation result (audioUrl, transcript, duration)
   */
  const generatePodcast = useCallback(async (podcastId: string, duration: number = 10) => {
    setGenerating(true);
    setError(null);

    // Update status to 'generating'
    await updatePodcastById(podcastId, { status: 'generating' });

    try {
      // Call the generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastId, duration }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate podcast');
      }

      const result = await response.json();
      
      // Update podcast with generated data
      await updatePodcastById(podcastId, {
        status: 'ready',
        audio_url: result.audioUrl,
        transcript: result.transcript,
        duration: result.duration,
      });

      setGenerating(false);
      return result;
    } catch (err) {
      // Something went wrong - mark as error
      await updatePodcastById(podcastId, { status: 'error' });
      setError(err instanceof Error ? err.message : 'Generation failed');
      setGenerating(false);
      throw err;
    }
  }, [updatePodcastById, setGenerating, setError]);

  /**
   * uploadSourceMaterial Function
   * ============================
   * 
   * Uploads a source material file (PDF, text, etc.) to Supabase Storage.
   * 
   * This allows users to provide documents that the AI will use
   * as reference material when generating the podcast script.
   * 
   * @param file - The file to upload
   * @param userId - The ID of the user uploading
   * @returns Object with url and name of the uploaded file
   */
  const uploadSourceMaterial = useCallback(async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `source-materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('podcasts')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from('podcasts')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      name: file.name,
    };
  }, []);

  /**
   * fetchPodcastSpeakers Function
   * ============================
   * 
   * Fetches the speaker IDs associated with a podcast.
   * 
   * SQL Generated:
   * SELECT speaker_id FROM podcast_speakers WHERE podcast_id = 'xxx'
   * 
   * @param podcastId - The podcast ID
   * @returns Array of speaker IDs
   */
  const fetchPodcastSpeakers = useCallback(async (podcastId: string) => {
    const { data, error } = await supabase
      .from('podcast_speakers')
      .select('speaker_id')
      .eq('podcast_id', podcastId);

    if (error) {
      throw new Error(error.message);
    }

    // Extract just the speaker_id from each row
    return data.map((entry) => entry.speaker_id);
  }, []);

  /**
   * Return values
   * =============
   */
  return {
    podcasts,
    currentPodcast,
    loading,
    generating,
    error,
    fetchPodcasts,
    fetchPodcast,
    createPodcast,
    updatePodcast: updatePodcastById,
    deletePodcast,
    generatePodcast,
    uploadSourceMaterial,
    fetchPodcastSpeakers,
  };
}
