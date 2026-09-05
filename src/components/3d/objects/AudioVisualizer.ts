/**
 * Audio Visualizer - Real-time frequency visualization
 * Web Audio API + Three.js with GSAP smoothing
 */

import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

interface AudioVisualizerProps {
  enabled?: boolean;
  position?: [number, number, number];
  scale?: number;
}

export function AudioVisualizer({ enabled = true, position = [0, -1.5, 1.2], scale = 1 }: AudioVisualizerProps) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const barsRef = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.AudioContext) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;
    audioCtxRef.current = audioCtx;

    // Create silent oscillator for demo, or connect to microphone
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    oscillator.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    oscillator.start();

    // Also try to get microphone for real audio
    navigator.mediaDevices?.getUserMedia({ audio: true, video: false })
      .then(stream => {
        mediaStreamRef.current = stream;
        const micSource = audioCtx.createMediaStreamSource(stream);
        micSource.connect(analyser);
      })
      .catch(() => {
        // Mic denied, use oscillator demo
        console.log('Using demo oscillator for visualizer');
      });

    return () => {
      oscillator.stop();
      audioCtx.close();
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [enabled]);

  useFrame(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    barsRef.current.forEach((bar, i) => {
      if (!bar || !bar.material) return;
      
      const freqIndex = Math.floor(i * (dataArray.length / barsRef.current.length));
      const value = dataArray[freqIndex] / 255;
      
      // Apply frequency weighting (bass boost)
      const freqRatio = i / barsRef.current.length;
      const weight = 1.5 - freqRatio * 0.5;
      const weightedValue = Math.min(value * weight, 1);
      
      const targetScale = 0.15 + weightedValue * 2.5;
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetScale, 0.2);
      
      // Color by frequency
      const hue = 0.1 + (1 - freqRatio) * 0.6; // Amber to indigo
      const saturation = 0.7 + weightedValue * 0.3;
      const lightness = 0.4 + weightedValue * 0.4;
      
      const mat = bar.material as THREE.MeshStandardMaterial;
      mat.color.setHSL(hue, saturation, lightness);
      mat.emissive.setHSL(hue, saturation, lightness * 0.5);
      mat.emissiveIntensity = weightedValue * 0.8;
    });
  });

  const barCount = 32;
  const bars: THREE.Mesh[] = [];

  for (let i = 0; i < barCount; i++) {
    bars.push(
      <mesh
        key={i}
        ref={(el) => { if (el) barsRef.current[i] = el; }}
        position={[(i - barCount / 2) * 0.12, 0, 0]}
        geometry={new THREE.BoxGeometry(0.08, 0.1, 0.08)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={0xF59E0B} 
          emissive={0xF59E0B} 
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    );
  }

  return (
    <group position={position} scale={scale}>
      {bars}
    </group>
  );
}

/**
 * Advanced visualizer with multiple modes
 */
export function createVisualizerBars(count: number = 64): THREE.Group {
  const group = new THREE.Group();
  group.name = 'visualizerBars';

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.BoxGeometry(0.06, 0.1, 0.06);
    const material = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((i - count / 2) * 0.1, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { index: i };
    group.add(mesh);
  }

  return group;
}

/**
 * Circular visualizer (radial bars)
 */
export function createRadialVisualizer(count: number = 48, radius: number = 1): THREE.Group {
  const group = new THREE.Group();
  group.name = 'radialVisualizer';

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const geometry = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const material = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    mesh.lookAt(0, 0, 0);
    mesh.rotation.y += Math.PI / 2;
    mesh.castShadow = true;
    mesh.userData = { index: i, baseRadius: radius };
    group.add(mesh);
  }

  return group;
}

/**
 * Waveform visualizer - oscilloscope style
 */
export function createWaveformVisualizer(width: number = 2, resolution: number = 128): THREE.Group {
  const group = new THREE.Group();
  group.name = 'waveformVisualizer';

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < resolution; i++) {
    points.push(new THREE.Vector3(
      (i / (resolution - 1) - 0.5) * width,
      0,
      0
    ));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xF59E0B,
    linewidth: 2,
  });

  const line = new THREE.Line(geometry, material);
  line.name = 'waveformLine';
  group.add(line);

  return group;
}