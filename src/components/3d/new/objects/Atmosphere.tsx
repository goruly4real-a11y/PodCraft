import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  radius?: number;
  color1?: THREE.ColorRepresentation;
  color2?: THREE.ColorRepresentation;
  speed?: number;
  opacity?: number;
}

export function ParticleSystem({ 
  count = 2000, 
  radius = 20,
  color1 = 0xF59E0B,
  color2 = 0x6366F1,
  speed = 0.1,
  opacity = 0.4
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(color1) },
    uColor2: { value: new THREE.Color(color2) },
  }), [color1, color2]);

  useEffect(() => {
    if (!pointsRef.current) return;

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.3 + Math.random() * 0.7);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      sizes[i] = Math.random() * 3 + 1;
      
      const color = new THREE.Color().setHSL(
        0.1 + Math.random() * 0.6,
        0.8,
        0.5 + Math.random() * 0.3
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometryRef.current = new THREE.BufferGeometry();
    geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometryRef.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometryRef.current.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    materialRef.current = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vSize;
        varying vec3 vPosition;
        
        void main() {
          vColor = customColor;
          vSize = size;
          vPosition = position;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec3 vColor;
        varying float vSize;
        varying vec3 vPosition;
        
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float n = dot(i, vec3(1.0, 57.0, 113.0));
          float res = mix(
            mix(mix(sin(n + 0.0), sin(n + 1.0), f.x),
                mix(sin(n + 57.0), sin(n + 58.0), f.x), f.y),
            mix(mix(sin(n + 113.0), sin(n + 114.0), f.x),
                mix(sin(n + 170.0), sin(n + 171.0), f.x), f.y), f.z);
          return res;
        }
        
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          float pulse = sin(uTime * 0.5 + vPosition.x * 0.1) * 0.15 + 0.85;
          alpha *= pulse;
          
          float height = (vPosition.y + ${radius}.0) / ${radius * 2.0}.0;
          vec3 color = mix(uColor1, uColor2, height);
          
          gl_FragColor = vec4(color, alpha * ${opacity});
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometryRef.current, materialRef.current);
    pointsRef.current = points;

    return () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, [count, radius, opacity]);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      timeRef.current += 0.01;
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = timeRef.current;
      }
      if (pointsRef.current) {
        pointsRef.current.rotation.y += speed * 0.0001;
        pointsRef.current.rotation.x += speed * 0.00005;
      }
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [speed]);

  return (
    <primitive
      ref={pointsRef}
      object={new THREE.Group()}
      dispose={null}
    />
  );
}

export function FloatingOrbs({ count = 8 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    
    // Clear existing
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    orbsRef.current = [];

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 0.8 + 0.4;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(0.1 + Math.random() * 0.6, 0.8, 0.5),
        metalness: 0.2,
        roughness: 0.8,
        transparent: true,
        opacity: 0.15,
        transmission: 0.3,
        thickness: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      const angle = (i / count) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius
      );
      
      mesh.userData = {
        basePosition: mesh.position.clone(),
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      };
      
      group.add(mesh);
      orbsRef.current.push(mesh);
    }

    return () => {
      orbsRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
    };
  }, [count]);

  useEffect(() => {
    let frameId: number;
    const animate = (time: number) => {
      const t = time * 0.001;
      orbsRef.current.forEach((mesh, i) => {
        if (!mesh.userData.basePosition) return;
        mesh.position.x = mesh.userData.basePosition.x + Math.sin(t * mesh.userData.speed + mesh.userData.phase) * 0.5;
        mesh.position.y = mesh.userData.basePosition.y + Math.cos(t * mesh.userData.speed + mesh.userData.phase) * 0.3;
        mesh.position.z = mesh.userData.basePosition.z + Math.sin(t * mesh.userData.speed * 0.7 + mesh.userData.phase) * 0.5;
        mesh.rotation.y = t * 0.1;
      });
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <group ref={groupRef} />;
}