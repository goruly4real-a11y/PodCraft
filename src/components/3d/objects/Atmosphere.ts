/**
 * Atmosphere System - Particle fields, fog, lighting
 * Inspired by Unseen Studio's nebula and underwater atmospheres
 */

import * as THREE from 'three';
import { DESIGN_TOKENS } from '../designTokens';
import { particleVertex, particleFragment } from '../shaders/atmosphere';

export function createAtmosphereParticles(
  count: number = 2000,
  options: {
    radius?: number;
    colorWarm?: number;
    colorCool?: number;
    speed?: number;
  } = {}
): THREE.Points {
  const {
    radius = 20,
    colorWarm = DESIGN_TOKENS.colors.particleWarm,
    colorCool = DESIGN_TOKENS.colors.particleCool,
    speed = 0.1,
  } = options;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Spherical distribution with density toward center
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.pow(Math.random(), 0.5); // Concentrated toward center

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = Math.random() * 2 + 0.5;

    // Color gradient from cool to warm
    const color = new THREE.Color().setHSL(
      0.1 + Math.random() * 0.6, // Amber to indigo
      0.8,
      0.4 + Math.random() * 0.3
    );
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.3 + Math.random() * 0.7;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms: {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uColorWarm: { value: new THREE.Color(colorWarm) },
      uColorCool: { value: new THREE.Color(colorCool) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'atmosphereParticles';
  points.userData = { speed, material };

  return points;
}

export function createFloatingOrbs(count: number = 8): THREE.Group {
  const group = new THREE.Group();
  group.name = 'floatingOrbs';

  for (let i = 0; i < count; i++) {
    const size = 0.4 + Math.random() * 0.8;
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    
    const color = new THREE.Color().setHSL(
      0.1 + Math.random() * 0.6,
      0.7,
      0.5
    );
    
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.1,
      roughness: 0.7,
      transparent: true,
      opacity: 0.1,
      transmission: 0.3,
      thickness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    const angle = (i / count) * Math.PI * 2;
    const r = 10 + Math.random() * 5;
    mesh.position.set(
      Math.cos(angle) * r,
      (Math.random() - 0.5) * 8,
      Math.sin(angle) * r
    );
    
    mesh.userData = {
      basePosition: mesh.position.clone(),
      speed: 0.15 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
    };
    
    group.add(mesh);
  }

  return group;
}

export function createLightRays(count: number = 12): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lightRays';

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.ConeGeometry(0.1, 15, 8, 1, true);
    const material = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const ray = new THREE.Mesh(geometry, material);
    const angle = (i / count) * Math.PI * 2;
    ray.position.set(
      Math.cos(angle) * 2,
      -2,
      Math.sin(angle) * 2
    );
    ray.rotation.x = Math.PI;
    ray.rotation.y = angle;
    ray.userData = {
      baseRotation: angle,
      speed: 0.001 + Math.random() * 0.002,
    };
    group.add(ray);
  }

  return group;
}

export function createDustMotes(count: number = 500): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    sizes[i] = Math.random() * 0.5 + 0.1;
    opacities[i] = Math.random() * 0.5 + 0.1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.PointsMaterial({
    color: 0xF59E0B,
    size: 1,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'dustMotes';
  points.userData = { speeds: new Float32Array(count).map(() => 0.01 + Math.random() * 0.02) };

  return points;
}

/**
 * Studio lighting setup - cinematic, dramatic
 */
export function createStudioLighting(): THREE.Group {
  const lights = new THREE.Group();
  lights.name = 'studioLighting';

  // Key light - warm, from top-right
  const keyLight = new THREE.DirectionalLight(0xFFF8E7, 2.5);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  lights.add(keyLight);

  // Fill light - cool, from left
  const fillLight = new THREE.DirectionalLight(0x6366F1, 1.0);
  fillLight.position.set(-8, 4, 3);
  lights.add(fillLight);

  // Rim light - golden, from behind
  const rimLight = new THREE.DirectionalLight(0xF59E0B, 1.5);
  rimLight.position.set(0, 5, -8);
  lights.add(rimLight);

  // Ambient
  const ambient = new THREE.AmbientLight(0x1a1a2e, 0.3);
  lights.add(ambient);

  // Accent spotlights
  const spot1 = new THREE.SpotLight(0xF59E0B, 1.5);
  spot1.position.set(-3, 5, 3);
  spot1.target.position.set(0, 1, 0);
  spot1.angle = Math.PI / 6;
  spot1.penumbra = 0.5;
  spot1.decay = 1.5;
  spot1.distance = 20;
  lights.add(spot1);
  lights.add(spot1.target);

  const spot2 = new THREE.SpotLight(0x6366F1, 1.0);
  spot2.position.set(3, 5, -3);
  spot2.target.position.set(0, 1, 0);
  spot2.angle = Math.PI / 8;
  spot2.penumbra = 0.6;
  spot2.decay = 1.5;
  spot2.distance = 20;
  lights.add(spot2);
  lights.add(spot2.target);

  // Subtle point lights for mic accents
  const accentLight = new THREE.PointLight(0xF59E0B, 0.5, 3, 2);
  accentLight.position.set(0, 1.5, 0.5);
  lights.add(accentLight);

  return lights;
}

/**
 * HDRI Environment alternative - for when we want image-based lighting
 */
export function createEnvironment(): THREE.Group {
  const env = new THREE.Group();
  env.name = 'environment';

  // Sky dome
  const skyGeo = new THREE.SphereGeometry(100, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x0B0F19,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  env.add(sky);

  // Gradient overlay
  const gradGeo = new THREE.SphereGeometry(99, 64, 32);
  const gradMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorTop;
      uniform vec3 uColorBottom;
      varying vec3 vWorldPosition;
      void main() {
        float gradient = (vWorldPosition.y + 50.0) / 100.0;
        vec3 color = mix(uColorBottom, uColorTop, gradient);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uColorTop: { value: new THREE.Color(0x1a1a2e) },
      uColorBottom: { value: new THREE.Color(0x0B0F19) },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });
  const gradient = new THREE.Mesh(gradGeo, gradMat);
  env.add(gradient);

  return env;
}