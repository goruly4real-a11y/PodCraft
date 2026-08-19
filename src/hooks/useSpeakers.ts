/**
 * ============================================================================
 * useSpeakers HOOK - Speaker Management
 * ============================================================================
 * 
 * This hook handles all speaker-related operations:
 * - Fetching speakers from the database
 * - Creating new speakers
 * - Updating existing speakers
 * - Deleting speakers
 * - Uploading profile pictures
 * 
 * WHAT IS A SPEAKER?
 * ------------------
 * A speaker is a character profile that users create for their podcasts.
 * Each speaker has:
 * - Name, age, tone, career, personality
 * - A voice (from Gemini's 30 prebuilt voices)
 * - An optional profile picture
 * 
 * THE CRUD OPERATIONS:
 * -------------------
 * - Create: Add a new speaker to the database
 * - Read: Fetch all speakers from the database
 * - Update: Modify an existing speaker
 * - Delete: Remove a speaker from the database
 * 
 * ============================================================================
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSpeakerStore } from '@/store';
import type { Speaker, SpeakerTone, GeminiVoice } from '@/types';

/**
 * useSpeakers Hook
 * ================
 * 
 * USAGE:
 * ------
 * function SpeakerList() {
 *   const { speakers, fetchSpeakers, deleteSpeaker } = useSpeakers();
 *   
 *   useEffect(() => { fetchSpeakers(userId); }, [userId]);
 *   
 *   return speakers.map(s => <p>{s.name}</p>);
 * }
 */
export function useSpeakers() {
  /**
   * Extract state and actions from the speaker store
   * 
   * We get:
   * - State: speakers (array), loading (boolean), error (string)
   * - Actions: setSpeakers, addSpeaker, updateSpeaker, removeSpeaker, etc.
   */
  const {
    speakers,
    loading,
    error,
    setSpeakers,
    addSpeaker,
    updateSpeaker,
    removeSpeaker,
    setLoading,
    setError,
  } = useSpeakerStore();

  /**
   * fetchSpeakers Function
   * =====================
   * 
   * Fetches all speakers for a specific user from Supabase.
   * 
   * THE SUPABASE QUERY FLOW:
   * -----------------------
   * 1. supabase.from('speakers') - Select the speakers table
   * 2. .select('*') - Get all columns
   * 3. .eq('user_id', userId) - Only get speakers belonging to this user
   * 4. .order('created_at', { ascending: false }) - Newest first
   * 
   * This generates SQL like:
   * SELECT * FROM speakers WHERE user_id = 'xxx' ORDER BY created_at DESC
   * 
   * useCallback memoizes this function so it doesn't get recreated
   * every time the component re-renders (performance optimization).
   * 
   * @param userId - The ID of the user whose speakers to fetch
   */
  const fetchSpeakers = useCallback(async (userId: string) => {
    setLoading(true);  // Start loading
    setError(null);    // Clear any previous errors

    /**
     * Execute the Supabase query
     * 
     * supabase.from() returns a query builder
     * .select() executes the SELECT query
     * The result has { data, error } properties
     */
    const { data, error: fetchError } = await supabase
      .from('speakers')                          // Table name
      .select('*')                               // Get all columns
      .eq('user_id', userId)                     // WHERE user_id = userId
      .order('created_at', { ascending: false }); // ORDER BY created_at DESC

    // Handle errors
    if (fetchError) {
      setError(fetchError.message);  // Store error message
      setLoading(false);             // Stop loading
      return;                        // Exit early
    }

    // Success: update the store with fetched speakers
    setSpeakers(data || []);  // data might be null, so use || []
    setLoading(false);        // Stop loading
  }, [setSpeakers, setLoading, setError]);
  // Dependencies: if these functions change, recreate this callback

  /**
   * createSpeaker Function
   * =====================
   * 
   * Creates a new speaker in the database.
   * 
   * THE SUPABASE INSERT FLOW:
   * ------------------------
   * 1. supabase.from('speakers') - Select the speakers table
   * 2. .insert({...}) - Insert a new row
   * 3. .select() - Return the inserted row
   * 4. .single() - Return a single object (not an array)
   * 
   * This generates SQL like:
   * INSERT INTO speakers (user_id, name, ...) VALUES (...) RETURNING *
   * 
   * @param userId - The ID of the user creating the speaker
   * @param speaker - The speaker data to insert
   * @returns The newly created speaker object
   * @throws Error if creation fails
   */
  const createSpeaker = useCallback(async (
    userId: string,
    speaker: {
      name: string;
      age?: number | null;
      tone?: SpeakerTone | null;
      career?: string | null;
      personality?: string | null;
      voice_id: GeminiVoice;
      profile_pic_url?: string | null;
    }
  ) => {
    setLoading(true);
    setError(null);

    /**
     * Insert the speaker into Supabase
     * 
     * The insert object must match the database schema.
     * We use || null because Supabase expects null, not undefined.
     */
    const { data, error: createError } = await supabase
      .from('speakers')
      .insert({
        user_id: userId,
        name: speaker.name,
        age: speaker.age || null,
        tone: speaker.tone || null,
        career: speaker.career || null,
        personality: speaker.personality || null,
        voice_id: speaker.voice_id,
        profile_pic_url: speaker.profile_pic_url || null,
      })
      .select()   // Return the inserted row
      .single();  // Return as object, not array

    if (createError) {
      setError(createError.message);
      setLoading(false);
      throw new Error(createError.message);  // Throw so caller can catch
    }

    // Add the new speaker to the local store
    addSpeaker(data);
    setLoading(false);
    return data;  // Return the created speaker
  }, [addSpeaker, setLoading, setError]);

  /**
   * updateSpeakerById Function
   * =========================
   * 
   * Updates an existing speaker in the database.
   * 
   * PARTIAL<T> EXPLAINED:
   * --------------------
   * Partial<Speaker> means all Speaker properties are optional.
   * This lets you update just the fields you want to change.
   * 
   * Example: updateSpeaker("123", { name: "New Name" })
   * - Only updates name, leaves everything else unchanged
   * 
   * OMIT<T, K> EXPLAINED:
   * --------------------
   * Omit<Speaker, 'id' | 'user_id' | ...> removes those fields from the type.
   * This prevents accidentally overwriting:
   * - id (should never change)
   * - user_id (should never change)
   * - created_at (should never change)
   * - updated_at (is set automatically)
   * 
   * @param id - The ID of the speaker to update
   * @param updates - The fields to update
   */
  const updateSpeakerById = useCallback(async (
    id: string,
    updates: Partial<Omit<Speaker, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    setError(null);

    // Update in Supabase
    const { error: updateError } = await supabase
      .from('speakers')
      .update(updates)  // SET name = 'New Name', ...
      .eq('id', id);    // WHERE id = 'xxx'

    if (updateError) {
      setError(updateError.message);
      throw new Error(updateError.message);
    }

    // Update in local store (optimistic update)
    updateSpeaker(id, updates);
  }, [updateSpeaker, setError]);

  /**
   * deleteSpeaker Function
   * =====================
   * 
   * Deletes a speaker from the database.
   * 
   * THE SUPABASE DELETE FLOW:
   * ------------------------
   * 1. supabase.from('speakers') - Select the speakers table
   * 2. .delete() - Delete rows
   * 3. .eq('id', id) - WHERE id = 'xxx'
   * 
   * This generates SQL like:
   * DELETE FROM speakers WHERE id = 'xxx'
   * 
   * @param id - The ID of the speaker to delete
   */
  const deleteSpeaker = useCallback(async (id: string) => {
    setError(null);

    const { error: deleteError } = await supabase
      .from('speakers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      throw new Error(deleteError.message);
    }

    // Remove from local store
    removeSpeaker(id);
  }, [removeSpeaker, setError]);

  /**
   * uploadProfilePic Function
   * ========================
   * 
   * Uploads a profile picture to Supabase Storage.
   * 
   * HOW SUPABASE STORAGE WORKS:
   * --------------------------
   * 1. Create a "bucket" (like a folder) called "avatars"
   * 2. Upload files with a path like "profile-pics/userId/random.ext"
   * 3. Get a public URL to access the file
   * 
   * FILE NAMING STRATEGY:
   * --------------------
   * We use: profile-pics/${userId}/${random}.${extension}
   * 
   * - profile-pics/: Organizes files in a folder
   * - userId/: Groups files by user
   * - random: Prevents filename collisions (two users uploading "photo.jpg")
   * - extension: Keeps the original file type (.jpg, .png, etc.)
   * 
   * @param file - The File object from an <input type="file">
   * @param userId - The ID of the user uploading
   * @returns The public URL of the uploaded file
   */
  const uploadProfilePic = useCallback(async (file: File, userId: string) => {
    // Get file extension (e.g., "jpg" from "photo.jpg")
    const fileExt = file.name.split('.').pop();
    
    // Create unique filename with random number
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    
    // Full path in the bucket
    const filePath = `profile-pics/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')       // Bucket name
      .upload(filePath, file); // Path and file data

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }, []);

  /**
   * Return values
   * =============
   * 
   * Everything the component needs to work with speakers.
   * Note: updateSpeaker is renamed to updateSpeakerById to avoid
   * naming conflict with the store's updateSpeaker.
   */
  return {
    speakers,
    loading,
    error,
    fetchSpeakers,
    createSpeaker,
    updateSpeaker: updateSpeakerById,
    deleteSpeaker,
    uploadProfilePic,
  };
}
