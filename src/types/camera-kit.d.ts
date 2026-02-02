/**
 * Snapchat Camera Kit Web SDK TypeScript Definitions
 * For @snap/camera-kit package
 */

declare module "@snap/camera-kit" {
  export interface CameraKitBootstrapOptions {
    apiToken: string;
    lensGroups?: string[];
  }

  export interface Lens {
    id: string;
    name: string;
    iconUrl?: string;
    groupId: string;
    vendorData?: Record<string, unknown>;
  }

  export interface LensGroup {
    id: string;
    lenses: Lens[];
  }

  export interface Source {
    setRenderSize(width: number, height: number): void;
  }

  export interface MediaStreamSource extends Source {
    setTransform(transform: Transform): void;
  }

  export interface Transform {
    /** Mirror horizontally */
    mirrorX?: boolean;
    /** Mirror vertically */
    mirrorY?: boolean;
    /** Rotation in degrees */
    rotation?: number;
  }

  export interface RenderTarget {
    canvas: HTMLCanvasElement;
  }

  export interface CameraKitSession {
    lenses: LensRepository;
    source: Source | null;
    
    play(renderTarget?: "live" | RenderTarget): Promise<void>;
    pause(): void;
    destroy(): Promise<void>;
    
    applyLens(lens: Lens): Promise<void>;
    removeLens(): Promise<void>;
    
    setSource(source: Source): Promise<void>;
    setFPSLimit(fps: number): void;
    
    capture(): Promise<Blob>;
  }

  export interface LensRepository {
    repository: {
      lenses: Lens[];
    };
    
    getLensGroups(): Promise<LensGroup[]>;
    getLenses(groupId: string): Promise<Lens[]>;
  }

  export interface CameraKit {
    createSession(options?: { liveRenderTarget?: HTMLCanvasElement }): Promise<CameraKitSession>;
    lensRepository: LensRepository;
  }

  export interface CreateMediaStreamSourceOptions {
    transform?: Transform;
    cameraType?: "front" | "back";
  }

  export function bootstrapCameraKit(options: CameraKitBootstrapOptions): Promise<CameraKit>;
  
  export function createMediaStreamSource(
    mediaStream: MediaStream,
    options?: CreateMediaStreamSourceOptions
  ): Promise<MediaStreamSource>;
}

// Extend Window interface for potential global access
declare global {
  interface Window {
    CameraKit?: typeof import("@snap/camera-kit");
  }
}

export {};
