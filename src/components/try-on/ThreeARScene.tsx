import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ParametricGlasses3D } from "./ParametricGlasses3D";

interface FrameAttributes {
  lens_width?: number | null;
  bridge_size?: number | null;
  temple_length?: number | null;
  frame_shape?: string | null;
}

interface ThreeARSceneProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: { x: number; y: number; z: number }[] | null;
  transformationMatrix: number[] | null;
  frameAttributes: FrameAttributes | null;
  frameColor?: string;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Video background plane that mirrors the webcam feed
 */
function VideoBackground({
  videoRef,
  width,
  height,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  width: number;
  height: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

    return () => {
      texture.dispose();
    };
  }, [videoRef]);

  useFrame(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
    if (meshRef.current && textureRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = textureRef.current;
      (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  });

  // Mirror the video on X axis to match webcam mirror
  return (
    <mesh ref={meshRef} position={[0, 0, -500]} scale={[-1, 1, 1]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial side={THREE.FrontSide} />
    </mesh>
  );
}

/**
 * FaceTracked3DFrame - positions the parametric glasses on the face
 * using the MediaPipe transformation matrix
 */
function FaceTracked3DFrame({
  landmarks,
  transformationMatrix,
  frameAttributes,
  frameColor,
  canvasWidth,
  canvasHeight,
}: {
  landmarks: { x: number; y: number; z: number }[] | null;
  transformationMatrix: number[] | null;
  frameAttributes: FrameAttributes | null;
  frameColor: string;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothedPos = useRef(new THREE.Vector3());
  const smoothedRot = useRef(new THREE.Euler());
  const smoothedScale = useRef(1);
  const initialized = useRef(false);
  const lastSeenTime = useRef(0);
  const PERSIST_MS = 300; // Keep glasses visible for 300ms after tracking loss

  useFrame(() => {
    if (!groupRef.current) return;

    if (!landmarks || landmarks.length < 468) {
      // Keep visible during grace period
      if (initialized.current && (performance.now() - lastSeenTime.current) < PERSIST_MS) {
        // Keep last position — don't hide
        return;
      }
      groupRef.current.visible = false;
      return;
    }

    lastSeenTime.current = performance.now();
    groupRef.current.visible = true;

    // Get key landmark positions in NDC (-1 to 1 space)
    // Mirror X to match mirrored video
    const noseBridge = landmarks[6];
    const leftEar = landmarks[127];
    const rightEar = landmarks[356];
    const leftBrow = landmarks[65];
    const rightBrow = landmarks[295];

    // Convert normalized coords to 3D scene coords
    // NDC: x 0-1, y 0-1 → scene: centered at 0
    const sceneX = (1 - noseBridge.x - 0.5) * canvasWidth;
    const browMidY = ((leftBrow.y + rightBrow.y) / 2);
    const sceneY = -(browMidY * 0.6 + noseBridge.y * 0.4 - 0.5) * canvasHeight;
    const sceneZ = noseBridge.z * canvasWidth * 0.5;

    // Ear distance for scale
    const earDist = Math.sqrt(
      Math.pow((1 - leftEar.x - (1 - rightEar.x)), 2) +
      Math.pow((leftEar.y - rightEar.y), 2)
    ) * canvasWidth;

    // Target frame size relative to ear distance
    const lensW = frameAttributes?.lens_width || 52;
    const totalFrameWidth = (lensW * 2 + (frameAttributes?.bridge_size || 18));
    const scaleFactor = (earDist * 1.1) / totalFrameWidth;

    // Extract rotation from transformation matrix
    let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
    if (transformationMatrix && transformationMatrix.length >= 16) {
      // Column-major 4x4 matrix
      const m00 = transformationMatrix[0];
      const m10 = transformationMatrix[1];
      const m20 = transformationMatrix[2];
      const m21 = transformationMatrix[6];
      const m22 = transformationMatrix[10];

      const pitch = Math.asin(-m20);
      const cosPitch = Math.cos(pitch);

      if (Math.abs(cosPitch) > 0.001) {
        targetRotY = Math.atan2(m10, m00); // yaw
        targetRotX = Math.atan2(m21, m22); // pitch
      }

      // Roll from eye angle
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      targetRotZ = -Math.atan2(
        rightEyeOuter.y - leftEyeOuter.y,
        (1 - leftEyeOuter.x) - (1 - rightEyeOuter.x)
      );
    }

    // Smooth everything
    const alpha = initialized.current ? 0.3 : 1.0;
    initialized.current = true;

    smoothedPos.current.lerp(
      new THREE.Vector3(sceneX, sceneY, sceneZ),
      alpha
    );
    smoothedScale.current += (scaleFactor - smoothedScale.current) * alpha;

    // Smooth rotation
    smoothedRot.current.x += (targetRotX - smoothedRot.current.x) * alpha;
    smoothedRot.current.y += (targetRotY - smoothedRot.current.y) * alpha;
    smoothedRot.current.z += (targetRotZ - smoothedRot.current.z) * alpha;

    // Apply transforms
    groupRef.current.position.copy(smoothedPos.current);
    groupRef.current.rotation.set(
      smoothedRot.current.x,
      smoothedRot.current.y,
      smoothedRot.current.z
    );
    groupRef.current.scale.setScalar(smoothedScale.current);
  });

  return (
    <group ref={groupRef} visible={false}>
      <ParametricGlasses3D
        lensWidth={frameAttributes?.lens_width || undefined}
        bridgeSize={frameAttributes?.bridge_size || undefined}
        templeLength={frameAttributes?.temple_length || undefined}
        frameShape={frameAttributes?.frame_shape || undefined}
        color={frameColor}
      />
    </group>
  );
}

/**
 * Camera setup for orthographic projection matching the video dimensions
 */
function CameraSetup({ width, height }: { width: number; height: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.near = 0.1;
      camera.far = 2000;
      camera.position.z = 500;
      camera.updateProjectionMatrix();
    }
  }, [camera, width, height]);

  return null;
}

export const ThreeARScene = ({
  videoRef,
  landmarks,
  transformationMatrix,
  frameAttributes,
  frameColor = "#2d2d2d",
  canvasWidth,
  canvasHeight,
}: ThreeARSceneProps) => {
  return (
    <Canvas
      orthographic
      camera={{
        position: [0, 0, 500],
        near: 0.1,
        far: 2000,
        left: -canvasWidth / 2,
        right: canvasWidth / 2,
        top: canvasHeight / 2,
        bottom: -canvasHeight / 2,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      data-ar-canvas="true"
    >
      <CameraSetup width={canvasWidth} height={canvasHeight} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, 3]} intensity={0.3} />

      {/* Video background */}
      <VideoBackground
        videoRef={videoRef}
        width={canvasWidth}
        height={canvasHeight}
      />

      {/* 3D glasses tracked to face */}
      <FaceTracked3DFrame
        landmarks={landmarks}
        transformationMatrix={transformationMatrix}
        frameAttributes={frameAttributes}
        frameColor={frameColor}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
    </Canvas>
  );
};
