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

  /**
   * Arbitrary values a Lens can read at startup via `global.launchParams`.
   * We use this to open the carousel Lens on a specific frame — see
   * `SetActiveItem.js` in the Lens Studio project, which reads `frameIndex`.
   *
   * Note: launch params are only delivered through a real Camera Kit host.
   * They are NOT available in the Lens Studio preview or via Send For Preview.
   */
  export type LensLaunchParams = Record<string, string | number | string[] | number[]>;

  export interface LensLaunchData {
    userId?: string;
    launchParams?: LensLaunchParams;
  }

  export interface CameraKitSession {
    lenses: LensRepository;
    source: Source | null;

    play(renderTarget?: "live" | RenderTarget): Promise<void>;
    pause(): void;
    destroy(): Promise<void>;

    /**
     * Mirrors the real SDK: `applyLens(lens, launchData?): Promise<boolean>`.
     * The boolean reports whether the Lens actually applied — an earlier
     * one-arg declaration here silently hid both that result and the
     * launchData parameter, so keep this in step with @snap/camera-kit.
     */
    applyLens(lens: Lens, launchData?: LensLaunchData): Promise<boolean>;
    removeLens(): Promise<void>;

    setSource(source: Source): Promise<void>;
    setFPSLimit(fps: number): void;

    /**
     * The SDK exposes rendered output as canvases rather than a capture()
     * promise; `output.capture` is the one intended for saving/sharing.
     */
    output: {
      live: HTMLCanvasElement;
      capture: HTMLCanvasElement;
    };
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
