/**
 * Atmosphere Shaders - Particle system and post-processing
 * Inspired by Unseen Studio's nebula and underwater particle systems
 */

export const particleVertex = `
  attribute float size;
  attribute vec3 customColor;
  attribute float phase;
  attribute float speed;
  varying vec3 vColor;
  varying float vSize;
  varying vec3 vPosition;
  varying float vPhase;
  varying float vSpeed;
  uniform float uTime;
  uniform float uScrollProgress;
  
  // Simplex noise for organic movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vColor = customColor;
    vSize = size;
    vPosition = position;
    vPhase = phase;
    vSpeed = speed;
    
    // Organic movement based on simplex noise
    vec3 noisePos = position * 0.3 + uTime * speed * 0.1;
    float noiseX = snoise(noisePos + vec3(0.0, vPhase, 0.0));
    float noiseY = snoise(noisePos + vec3(vPhase, 0.0, 0.0));
    float noiseZ = snoise(noisePos + vec3(0.0, 0.0, vPhase));
    
    vec3 displacedPosition = position + vec3(noiseX, noiseY, noiseZ) * 0.5;
    
    // Subtle scroll influence
    displacedPosition.y += sin(uScrollProgress * 3.14159 + vPhase) * 0.3;
    
    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragment = `
  uniform float uTime;
  uniform vec3 uColorWarm;
  uniform vec3 uColorCool;
  uniform float uScrollProgress;
  varying vec3 vColor;
  varying float vSize;
  varying vec3 vPosition;
  varying float vPhase;
  varying float vSpeed;
  
  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Breathing pulse
    float pulse = sin(uTime * 0.8 + vPhase) * 0.15 + 0.85;
    alpha *= pulse;
    
    // Color based on vertical position and scroll
    float height = (vPosition.y + 5.0) / 10.0;
    float scrollInfluence = uScrollProgress * 0.3;
    vec3 color = mix(uColorCool, uColorWarm, height + scrollInfluence);
    
    // Add sparkle
    float sparkle = step(0.98, fract(vPosition.x * 10.0 + uTime));
    color += vec3(sparkle) * 0.5;
    
    gl_FragColor = vec4(color, alpha * 0.6);
  }
`;

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

export const chromaticAberrationFragment = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  uniform float uAmount;
  
  void main() {
    vec2 offset = vUv - 0.5;
    vec3 color;
    color.r = texture2D(tDiffuse, vUv + offset * uAmount * 0.01).r;
    color.g = texture2D(tDiffuse, vUv).g;
    color.b = texture2D(tDiffuse, vUv - offset * uAmount * 0.01).b;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const filmGrainFragment = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  
  float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float grain = random(vUv * 1000.0 + uTime) * 2.0 - 1.0;
    color.rgb += grain * uIntensity;
    gl_FragColor = color;
  }
`;