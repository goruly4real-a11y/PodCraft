// Vertex shader for particle atmosphere
export const particleVertex = `
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
`;

// Fragment shader for particles
export const particleFragment = `
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
    
    // Subtle pulsing
    float pulse = sin(uTime * 0.5 + vPosition.x * 0.1) * 0.15 + 0.85;
    alpha *= pulse;
    
    // Color based on height
    float height = (vPosition.y + 5.0) / 10.0;
    vec3 color = mix(uColor1, uColor2, height);
    
    gl_FragColor = vec4(color, alpha * 0.4);
  }
`;

// Post-processing vignette
export const vignetteFragment = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  uniform float uIntensity;
  uniform float uSmoothness;
  
  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec2 center = vUv - 0.5;
    float dist = length(center) * 2.0;
    float vignette = smoothstep(uSmoothness, 1.0, dist);
    vignette = 1.0 - vignette;
    vignette = pow(vignette, 2.0);
    color.rgb = mix(color.rgb, vec3(0.0), vignette * uIntensity);
    gl_FragColor = color;
  }
`;

// Bloom-like glow for microphone
export const glowFragment = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  uniform vec3 uGlowColor;
  uniform float uIntensity;
  
  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    if (luminance > 0.8) {
      color.rgb += uGlowColor * (luminance - 0.8) * uIntensity * 5.0;
    }
    gl_FragColor = color;
  }
`;