/**
 * Speaker Avatars - 3D Character System
 * Stylized, expressive 3D heads with personality
 * Inspired by Unseen Studio's RSPCA Animal Futures companions
 */

import * as THREE from 'three';
import { DESIGN_TOKENS } from '../designTokens';

export interface SpeakerData {
  name: string;
  role: string;
  primaryColor: number;
  secondaryColor: number;
  personality: 'warm' | 'energetic' | 'calm' | 'authoritative' | 'friendly';
}

export const SPEAKER_PRESETS: SpeakerData[] = [
  { name: 'Alex', role: 'Host', primaryColor: 0xF59E0B, secondaryColor: 0xFBBF24, personality: 'warm' },
  { name: 'Sarah', role: 'Co-host', primaryColor: 0x6366F1, secondaryColor: 0x818CF8, personality: 'energetic' },
  { name: 'Mike', role: 'Guest', primaryColor: 0x22C55E, secondaryColor: 0x4ADE80, personality: 'calm' },
  { name: 'Priya', role: 'Expert', primaryColor: 0xEC4899, secondaryColor: 0xF472B6, personality: 'authoritative' },
  { name: 'James', role: 'Narrator', primaryColor: 0x06B6D4, secondaryColor: 0x22D3EE, personality: 'friendly' },
];

export function createSpeakerAvatar(data: SpeakerData): THREE.Group {
  const avatar = new THREE.Group();
  avatar.name = `Speaker_${data.name}`;

  // Materials
  const skinTone = getSkinTone(data.personality);
  const materials = {
    skin: new THREE.MeshPhysicalMaterial({
      color: skinTone,
      metalness: 0.0,
      roughness: 0.7,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5,
      subsurfaceColor: new THREE.Color(skinTone).multiplyScalar(1.5),
    }),
    hair: new THREE.MeshPhysicalMaterial({
      color: getHairColor(data.personality),
      metalness: 0.0,
      roughness: 0.6,
      sheen: 0.5,
      sheenColor: new THREE.Color(getHairColor(data.personality)).multiplyScalar(1.3),
    }),
    eyes: new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.4,
    }),
    eyeWhite: new THREE.MeshPhysicalMaterial({
      color: 0xF5F5F0,
      metalness: 0.0,
      roughness: 0.3,
    }),
    accent: new THREE.MeshPhysicalMaterial({
      color: data.primaryColor,
      metalness: 1.0,
      roughness: 0.05,
      emissive: data.primaryColor,
      emissiveIntensity: 0.1,
    }),
    accentGlow: new THREE.MeshBasicMaterial({
      color: data.primaryColor,
      transparent: true,
      opacity: 0.3,
    }),
    clothing: new THREE.MeshPhysicalMaterial({
      color: getClothingColor(data.personality),
      metalness: 0.0,
      roughness: 0.8,
      sheen: 0.3,
    }),
  };

  // ============ HEAD ============
  const headGroup = new THREE.Group();
  headGroup.name = 'head';

  // Head base (slightly stylized proportions)
  const headGeo = new THREE.SphereGeometry(0.5, 48, 32);
  const head = new THREE.Mesh(headGeo, materials.skin);
  head.scale.set(1.0, 1.1, 0.95);
  head.position.y = 0.1;
  head.castShadow = true;
  head.receiveShadow = true;
  head.name = 'headBase';
  headGroup.add(head);

  // Face plane for features
  const faceGeo = new THREE.PlaneGeometry(0.7, 0.7);
  const faceMat = new THREE.MeshPhysicalMaterial({
    color: skinTone,
    metalness: 0.0,
    roughness: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  // We'll use actual geometry for features instead

  // ============ EYES ============
  const eyeGroup = new THREE.Group();
  eyeGroup.name = 'eyes';
  eyeGroup.position.set(0, 0.15, 0.48);

  const eyeGeo = new THREE.SphereGeometry(0.08, 32, 24);
  
  // Left eye
  const leftEyeWhite = new THREE.Mesh(eyeGeo, materials.eyeWhite);
  leftEyeWhite.position.set(-0.16, 0, 0);
  leftEyeWhite.scale.set(1.0, 1.1, 0.6);
  eyeGroup.add(leftEyeWhite);

  const leftEye = new THREE.Mesh(eyeGeo, materials.eyes);
  leftEye.position.set(-0.16, 0, 0.02);
  leftEye.scale.set(0.5, 0.55, 0.4);
  leftEye.name = 'leftPupil';
  eyeGroup.add(leftEye);

  // Right eye
  const rightEyeWhite = new THREE.Mesh(eyeGeo, materials.eyeWhite);
  rightEyeWhite.position.set(0.16, 0, 0);
  rightEyeWhite.scale.set(1.0, 1.1, 0.6);
  eyeGroup.add(rightEyeWhite);

  const rightEye = new THREE.Mesh(eyeGeo, materials.eyes);
  rightEye.position.set(0.16, 0, 0.02);
  rightEye.scale.set(0.5, 0.55, 0.4);
  rightEye.name = 'rightPupil';
  eyeGroup.add(rightEye);

  // Eye highlights (catch lights)
  const highlightGeo = new THREE.SphereGeometry(0.02, 16, 12);
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  
  const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
  leftHighlight.position.set(-0.14, 0.025, 0.08);
  leftHighlight.scale.set(1, 1.2, 0.5);
  eyeGroup.add(leftHighlight);

  const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
  rightHighlight.position.set(0.18, 0.025, 0.08);
  rightHighlight.scale.set(1, 1.2, 0.5);
  eyeGroup.add(rightHighlight);

  // Eyelids (for blinking/expressions)
  const eyelidGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32, 1, true);
  const eyelidMat = new THREE.MeshPhysicalMaterial({
    color: skinTone,
    metalness: 0.0,
    roughness: 0.7,
  });

  const topLid = new THREE.Mesh(eyelidGeo, eyelidMat);
  topLid.position.set(0, 0.08, 0.48);
  topLid.rotation.x = Math.PI / 2;
  topLid.scale.set(1.2, 0.5, 0.3);
  topLid.name = 'topEyelid';
  eyeGroup.add(topLid);

  const bottomLid = new THREE.Mesh(eyelidGeo, eyelidMat);
  bottomLid.position.set(0, -0.08, 0.48);
  bottomLid.rotation.x = Math.PI / 2;
  bottomLid.scale.set(1.2, 0.3, 0.2);
  bottomLid.name = 'bottomEyelid';
  bottomLid.visible = false;
  eyeGroup.add(bottomLid);

  headGroup.add(eyeGroup);

  // ============ EYEBROWS ============
  const browGroup = new THREE.Group();
  browGroup.name = 'eyebrows';
  browGroup.position.set(0, 0.25, 0.48);

  const browGeo = new THREE.TorusGeometry(0.12, 0.008, 8, 16, Math.PI);
  const browMat = new THREE.MeshPhysicalMaterial({
    color: getHairColor(data.personality),
    metalness: 0.0,
    roughness: 0.6,
  });

  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.position.set(-0.16, 0, 0);
  leftBrow.rotation.z = -0.2;
  browGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.position.set(0.16, 0, 0);
  rightBrow.rotation.z = 0.2;
  rightBrow.rotation.y = Math.PI;
  browGroup.add(rightBrow);

  headGroup.add(browGroup);

  // ============ HAIR ============
  const hairGroup = createHair(data.personality, materials.hair);
  hairGroup.name = 'hair';
  hairGroup.position.y = 0.35;
  headGroup.add(hairGroup);

  // ============ EARS ============
  const earGeo = new THREE.SphereGeometry(0.07, 16, 12);
  const earMat = materials.skin;

  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.position.set(-0.52, 0.1, 0);
  leftEar.scale.set(0.8, 1.0, 0.5);
  leftEar.castShadow = true;
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, earMat);
  rightEar.position.set(0.52, 0.1, 0);
  rightEar.scale.set(0.8, 1.0, 0.5);
  rightEar.castShadow = true;
  headGroup.add(rightEar);

  // ============ NOSE ============
  const noseGroup = new THREE.Group();
  noseGroup.name = 'nose';
  noseGroup.position.set(0, 0.02, 0.48);

  const noseGeo = new THREE.ConeGeometry(0.035, 0.06, 16);
  const nose = new THREE.Mesh(noseGeo, materials.skin);
  nose.rotation.x = -Math.PI / 2;
  nose.position.y = -0.02;
  nose.castShadow = true;
  noseGroup.add(nose);

  headGroup.add(noseGroup);

  // ============ MOUTH ============
  const mouthGroup = new THREE.Group();
  mouthGroup.name = 'mouth';
  mouthGroup.position.set(0, -0.12, 0.49);

  const mouthGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI);
  const mouthMat = new THREE.MeshPhysicalMaterial({
    color: 0x8B4A4A,
    metalness: 0.0,
    roughness: 0.6,
  });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.rotation.x = Math.PI;
  mouth.name = 'mouthShape';
  mouthGroup.add(mouth);

  headGroup.add(mouthGroup);

  // ============ ACCENT RING (behind head) ============
  const ringGeo = new THREE.TorusGeometry(0.65, 0.015, 16, 64);
  const ring = new THREE.Mesh(ringGeo, materials.accent);
  ring.position.y = 0.1;
  ring.rotation.x = Math.PI / 2;
  ring.name = 'accentRing';
  headGroup.add(ring);

  // Inner glow ring
  const innerRingGeo = new THREE.RingGeometry(0.55, 0.62, 64);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.accentGlow);
  innerRing.position.y = 0.1;
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.name = 'innerGlowRing';
  headGroup.add(innerRing);

  // ============ CLOTHING / SHOULDERS ============
  const shoulderGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.3, 32, 1, true);
  const shoulders = new THREE.Mesh(shoulderGeo, materials.clothing);
  shoulders.position.y = -0.25;
  shoulders.castShadow = true;
  shoulders.receiveShadow = true;
  shoulders.name = 'shoulders';
  headGroup.add(shoulders);

  // Collar
  const collarGeo = new THREE.TorusGeometry(0.45, 0.03, 16, 32, Math.PI);
  const collar = new THREE.Mesh(collarGeo, materials.accent);
  collar.position.y = -0.1;
  collar.rotation.x = Math.PI / 2;
  headGroup.add(collar);

  // Name plate
  const namePlateGeo = new THREE.BoxGeometry(1.2, 0.12, 0.02);
  const namePlateMat = new THREE.MeshPhysicalMaterial({
    color: 0x0B0F19,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1,
  });
  const namePlate = new THREE.Mesh(namePlateGeo, namePlateMat);
  namePlate.position.set(0, -0.5, 0);
  namePlate.castShadow = true;
  headGroup.add(namePlate);

  // Role badge
  const badgeGeo = new THREE.BoxGeometry(0.8, 0.06, 0.015);
  const badgeMat = new THREE.MeshPhysicalMaterial({
    color: data.primaryColor,
    metalness: 0.5,
    roughness: 0.3,
    emissive: data.primaryColor,
    emissiveIntensity: 0.2,
  });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(0, -0.6, 0);
  headGroup.add(badge);

  avatar.add(headGroup);

  // Store references for animation
  avatar.userData = {
    data,
    eyeGroup,
    browGroup,
    mouthGroup,
    hairGroup,
    headGroup,
    eyeMeshes: { left: leftEye, right: rightEye },
    eyelids: { top: topLid, bottom: bottomLid },
    mouthMesh: mouth,
    isBlinking: false,
    blinkTimeout: null as any,
    lookTarget: new THREE.Vector3(0, 0.15, 1),
    personality: data.personality,
    baseEyePositions: {
      left: new THREE.Vector3(-0.16, 0, 0.02),
      right: new THREE.Vector3(0.16, 0, 0.02),
    },
  };

  return avatar;
}

function createHair(personality: string, hairMaterial: THREE.MeshPhysicalMaterial): THREE.Group {
  const hair = new THREE.Group();
  hair.name = 'hair';

  const hairStyles: Record<string, { count: number; length: number; spread: number; style: 'short' | 'medium' | 'long' | 'curly' }> = {
    warm: { count: 120, length: 0.25, spread: 0.55, style: 'medium' },
    energetic: { count: 150, length: 0.2, spread: 0.5, style: 'short' },
    calm: { count: 100, length: 0.3, spread: 0.6, style: 'long' },
    authoritative: { count: 80, length: 0.15, spread: 0.45, style: 'short' },
    friendly: { count: 130, length: 0.22, spread: 0.5, style: 'medium' },
  };

  const style = hairStyles[personality] || hairStyles.warm;
  const strandGeo = new THREE.CapsuleGeometry(0.008, style.length, 4, 8);

  for (let i = 0; i < style.count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1) * style.spread;
    const r = 0.48 + Math.random() * 0.05;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = 0.35 + r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    const strand = new THREE.Mesh(strandGeo, hairMaterial);
    strand.position.set(x, y, z);
    strand.lookAt(0, 0.35, 0);
    strand.rotation.x += Math.PI / 2;
    strand.castShadow = true;
    strand.userData = {
      basePosition: strand.position.clone(),
      baseRotation: strand.rotation.clone(),
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.5 + Math.random() * 0.5,
    };
    hair.add(strand);
  }

  return hair;
}

function getSkinTone(personality: string): number {
  // Diverse skin tones
  const tones = {
    warm: 0xE8C5A0,
    energetic: 0xD4A574,
    calm: 0xF0D8C0,
    authoritative: 0xC8A070,
    friendly: 0xE0C090,
  };
  return tones[personality as keyof typeof tones] || 0xE8C5A0;
}

function getHairColor(personality: string): number {
  const colors = {
    warm: 0x3D2B1F,
    energetic: 0x1A1A2E,
    calm: 0x2D2D3A,
    authoritative: 0x1A1A1A,
    friendly: 0x4A3728,
  };
  return colors[personality as keyof typeof colors] || 0x3D2B1F;
}

function getClothingColor(personality: string): number {
  const colors = {
    warm: 0x1E3A5F,
    energetic: 0x0F1F3A,
    calm: 0x2D5A4A,
    authoritative: 0x1A1A2E,
    friendly: 0x3D2F1A,
  };
  return colors[personality as keyof typeof colors] || 0x1E3A5F;
}

/**
 * Animate speaker avatar - call in useFrame
 */
export function animateSpeakerAvatar(
  avatar: THREE.Group,
  time: number,
  scrollProgress: number,
  isHovered: boolean = false,
  lookTarget: THREE.Vector3 = new THREE.Vector3(0, 0.15, 1)
): void {
  const ud = avatar.userData;
  if (!ud) return;

  const { eyeMeshes, eyelids, mouthMesh, hairGroup, browGroup, personality } = ud;

  // Blinking
  if (!ud.isBlinking && Math.random() < 0.003) {
    triggerBlink(avatar);
  }

  // Breathing
  const breath = Math.sin(time * 0.8) * 0.01;
  avatar.getObjectByName('head')?.scale.setScalar(1 + breath);
  avatar.getObjectByName('shoulders')?.position.y = -0.25 + breath * 2;

  // Eye tracking
  if (eyeMeshes.left && eyeMeshes.right) {
    const lookDir = new THREE.Vector3().subVectors(lookTarget, avatar.getWorldPosition(new THREE.Vector3())).normalize();
    
    // Limit eye movement
    const maxOffset = 0.02;
    const targetX = THREE.MathUtils.clamp(lookDir.x * 0.05, -maxOffset, maxOffset);
    const targetY = THREE.MathUtils.clamp(lookDir.y * 0.05, -maxOffset, maxOffset);

    eyeMeshes.left.position.x = THREE.MathUtils.lerp(eyeMeshes.left.position.x, ud.baseEyePositions.left.x + targetX, 0.1);
    eyeMeshes.left.position.y = THREE.MathUtils.lerp(eyeMeshes.left.position.y, ud.baseEyePositions.left.y + targetY, 0.1);
    eyeMeshes.right.position.x = THREE.MathUtils.lerp(eyeMeshes.right.position.x, ud.baseEyePositions.right.x + targetX, 0.1);
    eyeMeshes.right.position.y = THREE.MathUtils.lerp(eyeMeshes.right.position.y, ud.baseEyePositions.right.y + targetY, 0.1);

    // Highlights follow
    avatar.getObjectByName('leftHighlight')?.position.set(-0.14 + targetX * 2, 0.025 + targetY, 0.08);
    avatar.getObjectByName('rightHighlight')?.position.set(0.18 + targetX * 2, 0.025 + targetY, 0.08);
  }

  // Hair sway
  if (hairGroup) {
    hairGroup.children.forEach((strand: THREE.Mesh) => {
      const ud2 = strand.userData;
      if (ud2) {
        const swayX = Math.sin(time * ud2.swaySpeed + ud2.swayPhase) * 0.01;
        const swayZ = Math.cos(time * ud2.swaySpeed * 0.7 + ud2.swayPhase) * 0.01;
        strand.position.x = ud2.basePosition.x + swayX;
        strand.position.z = ud2.basePosition.z + swayZ;
      }
    });
  }

  // Brow expression based on personality
  if (browGroup) {
    const browOffset = Math.sin(time * 0.3) * 0.005;
    browGroup.position.y = 0.25 + browOffset;
  }

  // Subtle head movement
  const headGroup = avatar.getObjectByName('head');
  if (headGroup) {
    headGroup.rotation.y = Math.sin(time * 0.15) * 0.02 * (isHovered ? 2 : 1);
    headGroup.rotation.x = Math.sin(time * 0.1) * 0.01;
  }

  // Accent ring rotation
  const ring = avatar.getObjectByName('accentRing');
  if (ring) {
    ring.rotation.z = time * 0.05;
  }

  const innerRing = avatar.getObjectByName('innerGlowRing');
  if (innerRing) {
    innerRing.rotation.z = -time * 0.03;
    innerRing.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
  }

  // Hover reaction
  if (isHovered) {
    avatar.scale.setScalar(1.02);
    const ring2 = avatar.getObjectByName('accentRing');
    if (ring2) ring2.material.emissiveIntensity = 0.3;
  } else {
    avatar.scale.setScalar(1);
    const ring2 = avatar.getObjectByName('accentRing');
    if (ring2) ring2.material.emissiveIntensity = 0.1;
  }
}

function triggerBlink(avatar: THREE.Group): void {
  const ud = avatar.userData;
  if (ud.isBlinking) return;
  ud.isBlinking = true;

  const topLid = avatar.getObjectByName('topEyelid');
  const bottomLid = avatar.getObjectByName('bottomEyelid');
  const mouthMesh = avatar.getObjectByName('mouthShape');

  // Close eyes
  if (topLid) topLid.scale.y = 1;
  if (bottomLid) bottomLid.visible = true;

  // Slight mouth change during blink
  if (mouthMesh) mouthMesh.scale.y = 0.8;

  setTimeout(() => {
    if (topLid) topLid.scale.y = 0;
    if (bottomLid) bottomLid.visible = false;
    if (mouthMesh) mouthMesh.scale.y = 1;
    ud.isBlinking = false;
  }, 150 + Math.random() * 100);
}

/**
 * Create speaker card for grid layout
 */
export function createSpeakerCard(avatar: THREE.Group): THREE.Group {
  const card = new THREE.Group();
  card.name = 'speakerCard';
  
  // Card background
  const cardGeo = new THREE.PlaneGeometry(1.8, 2.2);
  const cardMat = new THREE.MeshPhysicalMaterial({
    color: 0x111827,
    metalness: 0.1,
    roughness: 0.8,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.position.z = -0.1;
  cardMesh.receiveShadow = true;
  card.add(cardMesh);

  // Accent border
  const borderGeo = new THREE.PlaneGeometry(1.85, 2.25);
  const borderMat = new THREE.MeshBasicMaterial({
    color: avatar.userData.data.primaryColor,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.z = -0.11;
  card.add(border);

  // Add avatar
  const avatarClone = avatar.clone();
  avatarClone.position.set(0, 0.3, 0.15);
  avatarClone.scale.setScalar(0.8);
  card.add(avatarClone);

  // Store reference for animation
  card.userData = { avatar: avatarClone };

  return card;
}