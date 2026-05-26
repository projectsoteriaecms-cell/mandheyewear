import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { ParametricGlasses3D } from "@/components/try-on/ParametricGlasses3D";
import { Loader2 } from "lucide-react";

interface ProductFrame3DViewerProps {
  lensWidth?: number | null;
  bridgeSize?: number | null;
  templeLength?: number | null;
  frameShape?: string | null;
  color?: string | null;
  className?: string;
}

export const ProductFrame3DViewer = ({
  lensWidth,
  bridgeSize,
  templeLength,
  frameShape,
  color,
}: ProductFrame3DViewerProps) => {
  const lw = lensWidth ?? 52;
  const bs = bridgeSize ?? 18;
  const tl = templeLength ?? 140;
  // Scene units = mm. Total width ~ 2*lw + bs + temples; fit camera accordingly.
  const totalWidth = 2 * lw + bs;

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 10, totalWidth * 2.2], fov: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[80, 120, 100]} intensity={1.1} castShadow />
          <directionalLight position={[-80, 40, -60]} intensity={0.4} />
          <Environment preset="studio" />

          <group position={[0, 0, 0]}>
            <ParametricGlasses3D
              lensWidth={lw}
              bridgeSize={bs}
              templeLength={tl}
              frameShape={frameShape ?? "rectangle"}
              color={color ?? "#1a1a2e"}
            />
          </group>

          <ContactShadows
            position={[0, -lw * 0.55, 0]}
            opacity={0.35}
            scale={totalWidth * 2}
            blur={2.5}
            far={50}
          />

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={totalWidth * 0.9}
            maxDistance={totalWidth * 4}
            autoRotate
            autoRotateSpeed={1.2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export const Frame3DLoadingFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
