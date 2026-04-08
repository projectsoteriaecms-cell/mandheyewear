import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

interface ParametricGlasses3DProps {
  lensWidth?: number;    // mm, default 52
  bridgeSize?: number;   // mm, default 18
  templeLength?: number; // mm, default 140
  frameShape?: string;   // rectangle, round, oval, etc.
  textureUrl?: string | null;
  color?: string;
}

// Default dimensions (mm) - converted to Three.js units (1 unit = 1mm)
const DEFAULTS = {
  lensWidth: 52,
  bridgeSize: 18,
  templeLength: 140,
  frameThickness: 3.5,
  frameDepth: 6,
  lensHeight: 36,
  templeWidth: 4,
  templeThick: 2,
  endPieceAngle: 8, // degrees outward bend at hinge
};

function createFrameFrontGeometry(
  lensW: number,
  lensH: number,
  bridgeW: number,
  thickness: number,
  depth: number,
  shape: string
): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Total front width
  const totalWidth = lensW * 2 + bridgeW;
  const halfTotal = totalWidth / 2;

  // Create lens openings based on shape
  const lensShape = new THREE.Shape();
  const hw = lensW / 2;
  const hh = lensH / 2;

  if (shape === "round") {
    const radius = Math.min(hw, hh);
    lensShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  } else if (shape === "oval") {
    lensShape.absellipse(0, 0, hw, hh, 0, Math.PI * 2, false, 0);
  } else if (shape === "cat-eye") {
    lensShape.moveTo(-hw, -hh * 0.3);
    lensShape.quadraticCurveTo(-hw, hh * 0.8, -hw * 0.5, hh);
    lensShape.quadraticCurveTo(0, hh * 1.1, hw * 0.6, hh * 0.9);
    lensShape.lineTo(hw, hh * 1.2); // uptick
    lensShape.quadraticCurveTo(hw * 1.1, 0, hw, -hh * 0.5);
    lensShape.quadraticCurveTo(hw * 0.5, -hh, 0, -hh);
    lensShape.quadraticCurveTo(-hw * 0.5, -hh, -hw, -hh * 0.3);
  } else if (shape === "aviator") {
    lensShape.moveTo(-hw, hh * 0.6);
    lensShape.quadraticCurveTo(-hw, hh, -hw * 0.3, hh);
    lensShape.lineTo(hw * 0.3, hh);
    lensShape.quadraticCurveTo(hw, hh, hw, hh * 0.6);
    lensShape.lineTo(hw, -hh * 0.3);
    lensShape.quadraticCurveTo(hw, -hh, hw * 0.5, -hh * 1.1);
    lensShape.quadraticCurveTo(0, -hh * 1.2, -hw * 0.5, -hh * 1.1);
    lensShape.quadraticCurveTo(-hw, -hh, -hw, -hh * 0.3);
    lensShape.lineTo(-hw, hh * 0.6);
  } else {
    // Rectangle (default) with rounded corners
    const r = Math.min(thickness, hw * 0.15, hh * 0.15);
    lensShape.moveTo(-hw + r, -hh);
    lensShape.lineTo(hw - r, -hh);
    lensShape.quadraticCurveTo(hw, -hh, hw, -hh + r);
    lensShape.lineTo(hw, hh - r);
    lensShape.quadraticCurveTo(hw, hh, hw - r, hh);
    lensShape.lineTo(-hw + r, hh);
    lensShape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    lensShape.lineTo(-hw, -hh + r);
    lensShape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  }

  // Create rim by extruding the lens shape outline
  const outerShape = new THREE.Shape();
  const rimPad = thickness;
  const ohw = hw + rimPad;
  const ohh = hh + rimPad;
  const or = Math.min(rimPad * 2, ohw * 0.15, ohh * 0.15);

  outerShape.moveTo(-ohw + or, -ohh);
  outerShape.lineTo(ohw - or, -ohh);
  outerShape.quadraticCurveTo(ohw, -ohh, ohw, -ohh + or);
  outerShape.lineTo(ohw, ohh - or);
  outerShape.quadraticCurveTo(ohw, ohh, ohw - or, ohh);
  outerShape.lineTo(-ohw + or, ohh);
  outerShape.quadraticCurveTo(-ohw, ohh, -ohw, ohh - or);
  outerShape.lineTo(-ohw, -ohh + or);
  outerShape.quadraticCurveTo(-ohw, -ohh, -ohw + or, -ohh);

  // Cut out the lens hole
  outerShape.holes.push(lensShape);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 2,
  };

  const rimGeo = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
  return rimGeo;
}

function createBridgeGeometry(
  bridgeW: number,
  thickness: number,
  depth: number
): THREE.BufferGeometry {
  const bridgeShape = new THREE.Shape();
  const hw = bridgeW / 2;
  const hh = thickness / 2;

  // Arch shape for bridge
  bridgeShape.moveTo(-hw, -hh);
  bridgeShape.lineTo(hw, -hh);
  bridgeShape.lineTo(hw, hh * 0.5);
  bridgeShape.quadraticCurveTo(0, hh * 2, -hw, hh * 0.5);
  bridgeShape.lineTo(-hw, -hh);

  return new THREE.ExtrudeGeometry(bridgeShape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 1,
  });
}

function createTempleGeometry(
  length: number,
  width: number,
  thick: number
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];

  // Straight section (most of the temple)
  const straightLen = length * 0.75;
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, 0, -straightLen));

  // Curved section (behind ear)
  const curveLen = length * 0.25;
  const segments = 8;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 0.5;
    const z = -straightLen - Math.sin(angle) * curveLen * 0.6;
    const y = -Math.sin(angle) * curveLen * 0.4;
    points.push(new THREE.Vector3(0, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);

  // Cross-section shape
  const crossSection = new THREE.Shape();
  const hw = width / 2;
  const hh = thick / 2;
  crossSection.moveTo(-hw, -hh);
  crossSection.lineTo(hw, -hh);
  crossSection.lineTo(hw, hh);
  crossSection.lineTo(-hw, hh);
  crossSection.lineTo(-hw, -hh);

  return new THREE.ExtrudeGeometry(crossSection, {
    extrudePath: curve,
    steps: 20,
    bevelEnabled: false,
  });
}

export const ParametricGlasses3D = ({
  lensWidth = DEFAULTS.lensWidth,
  bridgeSize = DEFAULTS.bridgeSize,
  templeLength = DEFAULTS.templeLength,
  frameShape = "rectangle",
  textureUrl,
  color = "#2d2d2d",
}: ParametricGlasses3DProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const lensH = lensWidth * 0.7; // typical aspect ratio

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.3,
      roughness: 0.6,
    });
  }, [color]);

  // Build geometries
  const { leftRim, rightRim, bridge, leftTemple, rightTemple } = useMemo(() => {
    const rimGeo = createFrameFrontGeometry(
      lensWidth,
      lensH,
      bridgeSize,
      DEFAULTS.frameThickness,
      DEFAULTS.frameDepth,
      frameShape
    );

    const bridgeGeo = createBridgeGeometry(
      bridgeSize,
      DEFAULTS.frameThickness,
      DEFAULTS.frameDepth
    );

    const templeGeo = createTempleGeometry(
      templeLength,
      DEFAULTS.templeWidth,
      DEFAULTS.templeThick
    );

    return {
      leftRim: rimGeo,
      rightRim: rimGeo.clone(),
      bridge: bridgeGeo,
      leftTemple: templeGeo,
      rightTemple: templeGeo.clone(),
    };
  }, [lensWidth, lensH, bridgeSize, templeLength, frameShape]);

  const halfLens = lensWidth / 2;
  const lensOffset = halfLens + bridgeSize / 2 + DEFAULTS.frameThickness;

  return (
    <group ref={groupRef}>
      {/* Left rim */}
      <mesh
        geometry={leftRim}
        material={material}
        position={[-lensOffset, 0, -DEFAULTS.frameDepth / 2]}
      />

      {/* Right rim */}
      <mesh
        geometry={rightRim}
        material={material}
        position={[lensOffset, 0, -DEFAULTS.frameDepth / 2]}
      />

      {/* Bridge */}
      <mesh
        geometry={bridge}
        material={material}
        position={[0, DEFAULTS.frameThickness, -DEFAULTS.frameDepth / 2]}
      />

      {/* Left temple */}
      <mesh
        geometry={leftTemple}
        material={material}
        position={[
          -(lensOffset + halfLens + DEFAULTS.frameThickness),
          0,
          0,
        ]}
        rotation={[0, Math.PI * (DEFAULTS.endPieceAngle / 180), 0]}
      />

      {/* Right temple */}
      <mesh
        geometry={rightTemple}
        material={material}
        position={[
          lensOffset + halfLens + DEFAULTS.frameThickness,
          0,
          0,
        ]}
        rotation={[0, -Math.PI * (DEFAULTS.endPieceAngle / 180), 0]}
      />

      {/* Semi-transparent lenses */}
      <mesh position={[-lensOffset, 0, 0]}>
        <planeGeometry args={[lensWidth, lensH]} />
        <meshStandardMaterial
          color="#88bbdd"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[lensOffset, 0, 0]}>
        <planeGeometry args={[lensWidth, lensH]} />
        <meshStandardMaterial
          color="#88bbdd"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
