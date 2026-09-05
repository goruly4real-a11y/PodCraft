/**
 * Shure SM7B Microphone - Procedural 3D Model
 * The iconic podcast microphone, built with precision
 */

import * as THREE from 'three';

export function createSM7BMicrophone(): THREE.Group {
  const mic = new THREE.Group();
  mic.name = 'SM7B';

  // Materials
  const materials = {
    body: new THREE.MeshPhysicalMaterial({
      color: 0x0B0F19,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    }),
    grille: new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.85,
      roughness: 0.25,
    }),
    accent: new THREE.MeshPhysicalMaterial({
      color: 0xF59E0B,
      metalness: 1.0,
      roughness: 0.05,
    }),
    darkAccent: new THREE.MeshPhysicalMaterial({
      color: 0x2a2a3e,
      metalness: 0.8,
      roughness: 0.2,
    }),
    foam: new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.0,
    }),
    switchBody: new THREE.MeshPhysicalMaterial({
      color: 0x0B0F19,
      metalness: 0.9,
      roughness: 0.15,
    }),
    switchToggle: new THREE.MeshPhysicalMaterial({
      color: 0xF59E0B,
      metalness: 1.0,
      roughness: 0.05,
    }),
    logo: new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      side: THREE.DoubleSide,
    }),
    yoke: new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.15,
    }),
    yokeKnob: new THREE.MeshPhysicalMaterial({
      color: 0xF59E0B,
      metalness: 1.0,
      roughness: 0.05,
    }),
    cable: new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.1,
      roughness: 0.9,
    }),
    connector: new THREE.MeshPhysicalMaterial({
      color: 0x2a2a3e,
      metalness: 0.9,
      roughness: 0.2,
    }),
    connectorGold: new THREE.MeshPhysicalMaterial({
      color: 0xF59E0B,
      metalness: 1.0,
      roughness: 0.05,
    }),
  };

  // ============ MICROPHONE BODY ============
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';

  // Main cylinder body
  const bodyGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.185, 64);
  const body = new THREE.Mesh(bodyGeo, materials.body);
  body.position.y = 0.0925;
  body.castShadow = true;
  body.receiveShadow = true;
  body.name = 'mainBody';
  bodyGroup.add(body);

  // Top cap (slightly wider)
  const topCapGeo = new THREE.CylinderGeometry(0.054, 0.054, 0.012, 64);
  const topCap = new THREE.Mesh(topCapGeo, materials.body);
  topCap.position.y = 0.191;
  topCap.castShadow = true;
  bodyGroup.add(topCap);

  // Bottom cap
  const bottomCapGeo = new THREE.CylinderGeometry(0.054, 0.054, 0.012, 64);
  const bottomCap = new THREE.Mesh(bottomCapGeo, materials.body);
  bottomCap.position.y = -0.006;
  bottomCap.castShadow = true;
  bodyGroup.add(bottomCap);

  // Accent rings (Shure SM7B signature gold rings)
  const ringGeo = new THREE.TorusGeometry(0.056, 0.003, 16, 64);
  const topRing = new THREE.Mesh(ringGeo, materials.accent);
  topRing.position.y = 0.185;
  topRing.rotation.x = Math.PI / 2;
  bodyGroup.add(topRing);

  const midRing = new THREE.Mesh(ringGeo, materials.accent);
  midRing.position.y = 0.0925;
  midRing.rotation.x = Math.PI / 2;
  bodyGroup.add(midRing);

  const bottomRing = new THREE.Mesh(ringGeo, materials.accent);
  bottomRing.position.y = 0.0;
  bottomRing.rotation.x = Math.PI / 2;
  bodyGroup.add(bottomRing);

  // ============ GRILLE / WINDSCREEN ============
  const grilleGroup = new THREE.Group();
  grilleGroup.name = 'grille';

  // Outer grille sphere (hemisphere)
  const grilleGeo = new THREE.SphereGeometry(0.062, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const grille = new THREE.Mesh(grilleGeo, materials.grille);
  grille.position.y = 0.22;
  grille.castShadow = true;
  grille.name = 'grilleOuter';
  grilleGroup.add(grille);

  // Inner grille mesh (the actual metal mesh)
  const innerGrilleGeo = new THREE.SphereGeometry(0.058, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerGrilleMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a15,
    metalness: 0.9,
    roughness: 0.3,
    transparent: true,
    opacity: 0.7,
    side: THREE.BackSide,
  });
  const innerGrille = new THREE.Mesh(innerGrilleGeo, innerGrilleMat);
  innerGrille.position.y = 0.22;
  innerGrille.name = 'grilleInner';
  grilleGroup.add(innerGrille);

  // Foam windscreen (optional - can be toggled)
  const foamGeo = new THREE.SphereGeometry(0.068, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const foam = new THREE.Mesh(foamGeo, materials.foam);
  foam.position.y = 0.225;
  foam.scale.set(1.0, 0.85, 1.0);
  foam.name = 'foamWindscreen';
  foam.visible = false; // Hidden by default for that classic SM7B look
  grilleGroup.add(foam);

  // Grille top cap
  const grilleCapGeo = new THREE.CircleGeometry(0.062, 48);
  const grilleCap = new THREE.Mesh(grilleCapGeo, materials.grille);
  grilleCap.rotation.x = -Math.PI / 2;
  grilleCap.position.y = 0.22;
  grilleGroup.add(grilleCap);

  // Gold rim at base of grille
  const grilleRimGeo = new THREE.TorusGeometry(0.062, 0.002, 16, 64);
  const grilleRim = new THREE.Mesh(grilleRimGeo, materials.accent);
  grilleRim.position.y = 0.185;
  grilleRim.rotation.x = Math.PI / 2;
  grilleGroup.add(grilleRim);

  bodyGroup.add(grilleGroup);

  // ============ SHURE LOGO ============
  const logoGroup = new THREE.Group();
  logoGroup.name = 'logo';

  // Logo plate
  const logoPlateGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.002, 32);
  const logoPlate = new THREE.Mesh(logoPlateGeo, materials.logo);
  logoPlate.position.set(0, 0.06, 0.055);
  logoPlate.rotation.x = -Math.PI / 2;
  logoGroup.add(logoPlate);

  // "SHURE" text geometry (simplified as a bar)
  const textGeo = new THREE.BoxGeometry(0.045, 0.008, 0.002);
  const textMesh = new THREE.Mesh(textGeo, materials.logo);
  textMesh.position.set(0, 0.061, 0.056);
  logoGroup.add(textMesh);

  // Small accent line under logo
  const lineGeo = new THREE.BoxGeometry(0.03, 0.001, 0.002);
  const lineMesh = new THREE.Mesh(lineGeo, materials.accent);
  lineMesh.position.set(0, 0.055, 0.056);
  logoGroup.add(lineMesh);

  bodyGroup.add(logoGroup);

  // ============ SWITCHES (Back of mic) ============
  const switchGroup = new THREE.Group();
  switchGroup.name = 'switches';
  switchGroup.position.z = -0.056;

  // Switch 1 - Bass rolloff
  const switch1 = createSwitch(0.025, 0.095, materials);
  switch1.name = 'bassRolloff';
  switchGroup.add(switch1);

  // Switch 2 - Presence boost
  const switch2 = createSwitch(0.025, 0.06, materials);
  switch2.name = 'presenceBoost';
  switchGroup.add(switch2);

  bodyGroup.add(switchGroup);

  // ============ YOKE MOUNT ============
  const yokeGroup = new THREE.Group();
  yokeGroup.name = 'yoke';
  yokeGroup.position.y = 0.02;

  // Yoke arms
  const armGeo = new THREE.BoxGeometry(0.008, 0.008, 0.12);
  const armMat = materials.yoke;

  // Left arm
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.07, 0.02, 0);
  leftArm.castShadow = true;
  yokeGroup.add(leftArm);

  // Right arm
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.07, 0.02, 0);
  rightArm.castShadow = true;
  yokeGroup.add(rightArm);

  // Yoke base connector
  const baseGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 32);
  const base = new THREE.Mesh(baseGeo, materials.yoke);
  base.position.y = 0.005;
  base.castShadow = true;
  yokeGroup.add(base);

  // Yoke knobs (gold)
  const knobGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 32);
  const leftKnob = new THREE.Mesh(knobGeo, materials.yokeKnob);
  leftKnob.position.set(-0.07, 0.02, 0.06);
  leftKnob.rotation.z = Math.PI / 2;
  yokeGroup.add(leftKnob);

  const rightKnob = new THREE.Mesh(knobGeo, materials.yokeKnob);
  rightKnob.position.set(0.07, 0.02, 0.06);
  rightKnob.rotation.z = Math.PI / 2;
  yokeGroup.add(rightKnob);

  // Pivot points on mic body
  const pivotGeo = new THREE.SphereGeometry(0.008, 16, 16);
  const pivotMat = materials.accent;
  const leftPivot = new THREE.Mesh(pivotGeo, pivotMat);
  leftPivot.position.set(-0.054, 0.02, 0);
  yokeGroup.add(leftPivot);

  const rightPivot = new THREE.Mesh(pivotGeo, pivotMat);
  rightPivot.position.set(0.054, 0.02, 0);
  yokeGroup.add(rightPivot);

  mic.add(yokeGroup);

  // ============ XLR CONNECTOR ============
  const xlrGroup = new THREE.Group();
  xlrGroup.name = 'xlrConnector';
  xlrGroup.position.y = -0.03;

  // Connector body
  const xlrGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.035, 32);
  const xlr = new THREE.Mesh(xlrGeo, materials.connector);
  xlr.position.y = -0.0175;
  xlr.castShadow = true;
  xlrGroup.add(xlr);

  // Gold pins ring
  const pinsGeo = new THREE.TorusGeometry(0.012, 0.0015, 3, 16);
  for (let i = 0; i < 3; i++) {
    const pin = new THREE.Mesh(pinsGeo, materials.connectorGold);
    pin.position.y = -0.033;
    pin.rotation.x = Math.PI / 2;
    pin.rotation.z = (i / 3) * Math.PI * 2;
    xlrGroup.add(pin);
  }

  // Connector base
  const baseGeo2 = new THREE.CylinderGeometry(0.022, 0.028, 0.02, 32);
  const base2 = new THREE.Mesh(baseGeo2, materials.connector);
  base2.position.y = -0.048;
  base2.castShadow = true;
  xlrGroup.add(base2);

  // Cable strain relief
  const strainGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.04, 16);
  const strain = new THREE.Mesh(strainGeo, materials.cable);
  strain.position.y = -0.068;
  strain.castShadow = true;
  xlrGroup.add(strain);

  mic.add(xlrGroup);

  // ============ CABLE ============
  const cableGroup = createCable();
  cableGroup.name = 'cable';
  cableGroup.position.set(0, -0.088, 0);
  mic.add(cableGroup);

  mic.add(bodyGroup);

  // Set pivot point at base of microphone for natural rotation
  mic.position.y = -0.03;

  return mic;
}

function createSwitch(x: number, y: number, materials: any): THREE.Group {
  const sw = new THREE.Group();
  sw.name = 'switch';

  // Switch base
  const baseGeo = new THREE.BoxGeometry(0.018, 0.022, 0.008);
  const base = new THREE.Mesh(baseGeo, materials.switchBody);
  base.position.set(x, y, 0.004);
  sw.add(base);

  // Switch toggle
  const toggleGeo = new THREE.BoxGeometry(0.012, 0.006, 0.008);
  const toggle = new THREE.Mesh(toggleGeo, materials.switchToggle);
  toggle.position.set(x, y + 0.008, 0.008);
  toggle.name = 'toggle';
  toggle.castShadow = true;
  sw.add(toggle);

  // Switch label indicators (tiny lines)
  const labelGeo = new THREE.BoxGeometry(0.002, 0.008, 0.001);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
  
  const label1 = new THREE.Mesh(labelGeo, labelMat);
  label1.position.set(x - 0.022, y, 0.005);
  sw.add(label1);

  const label2 = new THREE.Mesh(labelGeo, labelMat);
  label2.position.set(x - 0.022, y - 0.018, 0.005);
  sw.add(label2);

  return sw;
}

function createCable(): THREE.Group {
  const cable = new THREE.Group();
  cable.name = 'cable';

  // Create a realistic coiled cable using a spline
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.088, 0),
    new THREE.Vector3(0.02, -0.15, 0.01),
    new THREE.Vector3(0.05, -0.25, -0.02),
    new THREE.Vector3(0.03, -0.35, 0.01),
    new THREE.Vector3(0, -0.45, -0.01),
    new THREE.Vector3(-0.03, -0.55, 0.02),
    new THREE.Vector3(-0.01, -0.65, -0.02),
  ]);

  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.006, 8, false);
  const cableMesh = new THREE.Mesh(tubeGeo, new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    metalness: 0.1,
    roughness: 0.9,
  }));
  cableMesh.castShadow = true;
  cableMesh.name = 'cableTube';
  cable.add(cableMesh);

  // Add subtle cable texture lines
  for (let i = 0; i < 4; i++) {
    const lineGeo = new THREE.TubeGeometry(curve, 64, 0.0008, 8, false);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a15,
      transparent: true,
      opacity: 0.3,
    });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = (i / 4) * Math.PI * 2;
    cable.add(line);
  }

  return cable;
}

/**
 * Create a simplified version for mobile/low-end
 */
export function createSM7BSimplified(): THREE.Group {
  const mic = new THREE.Group();
  mic.name = 'SM7BSimple';

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0B0F19,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1,
  });

  const accentMat = new THREE.MeshPhysicalMaterial({
    color: 0xF59E0B,
    metalness: 1,
    roughness: 0.05,
  });

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.18, 32),
    mat
  );
  body.position.y = 0.09;
  body.castShadow = true;
  mic.add(body);

  // Grille
  const grille = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0x1a1a2e, metalness: 0.8, roughness: 0.3 })
  );
  grille.position.y = 0.22;
  grille.castShadow = true;
  mic.add(grille);

  // Rings
  for (const y of [0, 0.09, 0.18]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.054, 0.003, 8, 32),
      accentMat
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    mic.add(ring);
  }

  // XLR
  const xlr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.04, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x2a2a3e, metalness: 0.9, roughness: 0.2 })
  );
  xlr.position.y = -0.04;
  xlr.castShadow = true;
  mic.add(xlr);

  return mic;
}