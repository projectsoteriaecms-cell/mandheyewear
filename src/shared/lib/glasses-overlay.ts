/**
 * Glasses overlay positioning using MediaPipe Face Mesh landmarks.
 *
 * Key landmarks:
 *  - #33  → left eye outer corner
 *  - #263 → right eye outer corner
 *  - #6   → nose bridge (between the eyes)
 *  - #234 → left temple area
 *  - #454 → right temple area
 *  - #159 → left eye top
 *  - #386 → right eye top
 */

interface Point {
  x: number;
  y: number;
}

export interface OverlayTransform {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  angle: number;
}

// Smoothing factor for EMA (0 = no update, 1 = no smoothing)
const SMOOTH_FACTOR = 0.3;
// Extra padding multiplier on temple width for the frame
const TEMPLE_PADDING = 1.15;
// Depth scaling sensitivity
const DEPTH_SCALE_FACTOR = 2.0;

let prevTransform: OverlayTransform | null = null;

export function resetSmoothing(): void {
  prevTransform = null;
}

function ema(prev: number, curr: number, alpha: number): number {
  return prev + alpha * (curr - prev);
}

export function computeGlassesTransform(
  landmarks: { x: number; y: number; z: number }[],
  canvasWidth: number,
  canvasHeight: number,
  imageAspectRatio: number = 0.45
): OverlayTransform | null {
  if (!landmarks || landmarks.length < 468) return null;

  // Temple landmarks for face width
  const leftTemple: Point = {
    x: landmarks[234].x * canvasWidth,
    y: landmarks[234].y * canvasHeight,
  };
  const rightTemple: Point = {
    x: landmarks[454].x * canvasWidth,
    y: landmarks[454].y * canvasHeight,
  };

  // Eye landmarks for angle
  const leftEye: Point = {
    x: landmarks[33].x * canvasWidth,
    y: landmarks[33].y * canvasHeight,
  };
  const rightEye: Point = {
    x: landmarks[263].x * canvasWidth,
    y: landmarks[263].y * canvasHeight,
  };

  // Eye top landmarks for vertical centering
  const leftEyeTop: Point = {
    x: landmarks[159].x * canvasWidth,
    y: landmarks[159].y * canvasHeight,
  };
  const rightEyeTop: Point = {
    x: landmarks[386].x * canvasWidth,
    y: landmarks[386].y * canvasHeight,
  };

  // Nose bridge
  const noseBridge: Point = {
    x: landmarks[6].x * canvasWidth,
    y: landmarks[6].y * canvasHeight,
  };

  // Width from temple-to-temple distance
  const templeDistance = Math.sqrt(
    Math.pow(rightTemple.x - leftTemple.x, 2) +
      Math.pow(rightTemple.y - leftTemple.y, 2)
  );

  // Angle from eye corners
  const angle = Math.atan2(
    rightEye.y - leftEye.y,
    rightEye.x - leftEye.x
  );

  // Depth-aware scaling using nose bridge Z
  const avgZ = landmarks[6].z;
  const depthScale = 1 + avgZ * DEPTH_SCALE_FACTOR;

  const width = templeDistance * TEMPLE_PADDING * depthScale;
  const height = width * imageAspectRatio;

  // Vertical center: blend eye-top midpoint with nose bridge
  const eyeTopMidY = (leftEyeTop.y + rightEyeTop.y) / 2;
  const centerX = noseBridge.x;
  const centerY = eyeTopMidY * 0.4 + noseBridge.y * 0.6;

  const raw: OverlayTransform = { centerX, centerY, width, height, angle };

  // Apply EMA smoothing
  if (prevTransform) {
    const smoothed: OverlayTransform = {
      centerX: ema(prevTransform.centerX, raw.centerX, SMOOTH_FACTOR),
      centerY: ema(prevTransform.centerY, raw.centerY, SMOOTH_FACTOR),
      width: ema(prevTransform.width, raw.width, SMOOTH_FACTOR),
      height: ema(prevTransform.height, raw.height, SMOOTH_FACTOR),
      angle: ema(prevTransform.angle, raw.angle, SMOOTH_FACTOR),
    };
    prevTransform = smoothed;
    return smoothed;
  }

  prevTransform = raw;
  return raw;
}

export interface DrawOptions {
  /** Flip the overlay image horizontally to match mirrored webcam (default: true) */
  mirrorFlip?: boolean;
}

export function drawGlassesOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  transform: OverlayTransform,
  options: DrawOptions = {}
): void {
  const { centerX, centerY, width, height, angle } = transform;
  const { mirrorFlip = true } = options;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);

  // Flip horizontally so the frame faces the same direction as the mirrored selfie
  if (mirrorFlip) {
    ctx.scale(-1, 1);
  }

  ctx.scale(1, -1);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}
