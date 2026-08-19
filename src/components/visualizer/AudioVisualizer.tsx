/**
 * ============================================================================
 * THREE.JS 3D AUDIO VISUALIZER COMPONENT
 * ============================================================================
 * 
 * This component creates a 3D visualization that reacts to audio playback.
 * Think of it like the equalizer bars you see in music apps, but in 3D!
 * 
 * WHAT IS THREE.JS?
 * -----------------
 * Three.js is a JavaScript library that makes it easy to create 3D graphics
 * in the browser. It uses WebGL (a web standard for 3D rendering) under the hood.
 * 
 * HOW THIS VISUALIZER WORKS:
 * --------------------------
 * 1. When audio plays, we use the Web Audio API to get frequency data
 * 2. This data tells us how loud each frequency range is (bass, mid, treble)
 * 3. We use this data to modify 3D objects in real-time
 * 4. The result: 3D shapes that dance and pulse with the music!
 * 
 * THE 3D SCENE CONCEPT:
 * ---------------------
 * Imagine a stage with:
 * - A camera (your viewpoint)
 * - Objects (the things you see)
 * - Lights (illuminate the objects)
 * - A renderer (draws everything to the screen)
 * 
 * ============================================================================
 */

// Import React hooks and Three.js
import { useRef, useEffect, useCallback } from 'react';
// THREE is the main Three.js library
import * as THREE from 'three';

/**
 * Props for the AudioVisualizer component
 * 
 * audioUrl: The URL of the audio file to visualize
 * isPlaying: Whether the audio is currently playing
 * primaryColor: The main color of the visualization (default: amber)
 * secondaryColor: The accent color (default: emerald)
 */
interface AudioVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * AudioVisualizer Component
 * ========================
 * 
 * This component renders a 3D canvas that visualizes audio.
 * 
 * THE FLOW:
 * ---------
 * 1. Component mounts → Create 3D scene
 * 2. Audio plays → Start analyzing audio data
 * 3. Each frame → Update 3D objects based on audio
 * 4. Component unmounts → Clean up everything
 */
export function AudioVisualizer({
  audioUrl,
  isPlaying,
  primaryColor = '#F59E0B',   // Default: amber
  secondaryColor = '#10B981',  // Default: emerald
}: AudioVisualizerProps) {
  /**
   * useRef creates references that persist across renders.
   * Think of them as "instance variables" for the component.
   * 
   * mountRef: Tracks if component is mounted (for cleanup)
   * containerRef: Points to the HTML element where we'll render 3D
   * sceneRef: The Three.js scene (like a stage)
   * cameraRef: The Three.js camera (your viewpoint)
   * rendererRef: The Three.js renderer (draws to screen)
   * analyserRef: Web Audio API analyser (gets frequency data)
   * audioContextRef: Web Audio API context (manages audio)
   * barsRef: Array of 3D bars that visualize the audio
   * animationFrameRef: ID for the animation loop (for cleanup)
   */
  const mountRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number>(0);

  /**
   * convertColorToThree converts a hex color string to a Three.js color.
   * 
   * Three.js uses its own Color class to handle colors.
   * This function takes a string like '#F59E0B' and converts it
   * to a THREE.Color object.
   * 
   * @param color - Hex color string (e.g., '#F59E0B')
   * @returns THREE.Color object
   */
  const convertColorToThree = useCallback((color: string) => {
    return new THREE.Color(color);
  }, []);

  /**
   * initScene sets up the entire 3D environment.
   * 
   * This is like setting up a stage for a play:
   * 1. Create the stage (scene)
   * 2. Set up the camera (viewpoint)
   * 3. Add lights (illumination)
   * 4. Create the actors (3D bars)
   * 5. Start the show (animation loop)
   */
  const initScene = useCallback(() => {
    if (!containerRef.current || mountRef.current) return;
    
    mountRef.current = true;

    // ---- STEP 1: CREATE THE SCENE ----
    // The scene is like a container for all 3D objects
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);  // Dark slate background
    sceneRef.current = scene;

    // ---- STEP 2: CREATE THE CAMERA ----
    // PerspectiveCamera mimics how human eyes see:
    // - Objects further away appear smaller
    // - Objects closer appear larger
    // 
    // Parameters:
    // - 75: Field of view (75 degrees - like human vision)
    // - container width/height: Aspect ratio (matches screen)
    // - 0.1: Near clipping plane (closest visible distance)
    // - 1000: Far clipping plane (farthest visible distance)
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;  // Move camera back so we can see the bars
    cameraRef.current = camera;

    // ---- STEP 3: CREATE THE RENDERER ----
    // The renderer draws the 3D scene to a 2D canvas on the screen
    const renderer = new THREE.WebGLRenderer({ antialias: true });  // antialias = smooth edges
    renderer.setSize(width, height);  // Match container size
    renderer.setPixelRatio(window.devicePixelRatio);  // Sharp on retina displays
    container.appendChild(renderer.domElement);  // Add canvas to DOM
    rendererRef.current = renderer;

    // ---- STEP 4: ADD LIGHTS ----
    // Without lights, everything would be black!
    // We add two lights for different effects:
    
    // AmbientLight: Soft, even lighting (like daylight)
    // Intensity 0.5 means 50% brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // PointLight: Focused light from a point (like a spotlight)
    // Position (10, 10, 10) puts it above and to the right
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // ---- STEP 5: CREATE THE 3D BARS ----
    // These are the bars that will dance with the music
    
    const barCount = 32;  // Number of frequency bars
    const barWidth = 0.8;  // Width of each bar
    const primaryThreeColor = convertColorToThree(primaryColor);
    const secondaryThreeColor = convertColorToThree(secondaryColor);

    // Create each bar
    for (let i = 0; i < barCount; i++) {
      /**
       * BoxGeometry creates a 3D box shape.
       * Parameters: width, height, depth
       * - barWidth: How wide the bar is
       * - 1: Starting height (will be modified)
       * - 1: Depth (how "thick" the bar looks)
       */
      const geometry = new THREE.BoxGeometry(barWidth, 1, 1);
      
      /**
       * MeshStandardMaterial creates a realistic material.
       * - color: The bar's color
       * - metalness: How metallic it looks (0.3 = slightly metallic)
       * - roughness: How rough/shiny it is (0.4 = slightly shiny)
       */
      const material = new THREE.MeshStandardMaterial({
        // Alternate between primary and secondary colors
        color: i % 2 === 0 ? primaryThreeColor : secondaryThreeColor,
        metalness: 0.3,
        roughness: 0.4,
      });

      // Create the actual mesh (geometry + material = visible object)
      const bar = new THREE.Mesh(geometry, material);

      // Position the bar in a circle around the center
      // - i / barCount: Percentage of the way around the circle
      // - Math.PI * 2: Full circle (360 degrees in radians)
      // - Math.cos/sin: Convert angle to x/y coordinates
      const angle = (i / barCount) * Math.PI * 2;
      const radius = 8;  // Distance from center
      
      bar.position.x = Math.cos(angle) * radius;  // X position
      bar.position.y = Math.sin(angle) * radius;  // Y position
      bar.position.z = 0;  // Z position (front/back)
      
      // Rotate the bar to face outward from the center
      bar.rotation.z = angle;

      // Add the bar to the scene and store reference
      scene.add(bar);
      barsRef.current.push(bar);
    }

    // ---- STEP 6: ANIMATION LOOP ----
    // This function runs every frame (~60 times per second)
    const animate = () => {
      if (!mountRef.current) return;
      
      // Request the next frame
      animationFrameRef.current = requestAnimationFrame(animate);

      // Get audio frequency data if available
      if (analyserRef.current && isPlaying) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Update each bar based on audio data
        barsRef.current.forEach((bar, i) => {
          // Map bar index to frequency data index
          const dataIndex = Math.floor((i / barsRef.current.length) * dataArray.length);
          const value = dataArray[dataIndex] || 0;
          
          // Normalize value to 0-1 range
          const normalizedValue = value / 255;
          
          // Scale bar height based on audio (min 0.5, max 4)
          const scale = 0.5 + normalizedValue * 3.5;
          bar.scale.y = scale;
        });
      } else {
        // When not playing, make bars small
        barsRef.current.forEach((bar) => {
          bar.scale.y = 0.5;
        });
      }

      // Slowly rotate the entire scene
      if (sceneRef.current) {
        sceneRef.current.rotation.z += 0.002;
      }

      // Render the scene from the camera's perspective
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Start the animation loop
    animate();

    // ---- STEP 7: HANDLE WINDOW RESIZE ----
    // When the window resizes, update camera and renderer
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryColor, secondaryColor, convertColorToThree, isPlaying]);

  /**
   * setupAudioAnalyser creates the Web Audio API connection.
   * 
   * THE WEB AUDIO API FLOW:
   * -----------------------
   * 1. Create AudioContext (manages all audio)
   * 2. Load the audio file
   * 3. Create AnalyserNode (extracts frequency data)
   * 4. Connect everything: Audio → Analyser → Speakers
   * 5. Now we can read frequency data while audio plays
   */
  const setupAudioAnalyser = useCallback(async () => {
    if (!audioUrl) return;

    try {
      // Create audio context (only one per page)
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;  // 256 frequency bins
      analyserRef.current = analyser;

      // Load the audio file
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data (convert file → audio samples)
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create audio source from buffer
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect: Source → Analyser → Destination (speakers)
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // Start playing
      source.start(0);
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }, [audioUrl]);

  // Initialize scene when component mounts
  useEffect(() => {
    const cleanup = initScene();
    
    return () => {
      // Clean up Three.js resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      mountRef.current = false;
      
      if (cleanup) cleanup();
    };
  }, [initScene]);

  // Setup audio analyser when audio URL changes
  useEffect(() => {
    if (audioUrl) {
      setupAudioAnalyser();
    }
  }, [audioUrl, setupAudioAnalyser]);

  // Render the container div
  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '300px' }}
    />
  );
}
