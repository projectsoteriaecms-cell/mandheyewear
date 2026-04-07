/**
 * Glasses overlay positioning using MediaPipe Face Landmarker landmarks.
 *
 * Key landmarks:
 *  - #33  → left eye outer corner
 *  - #263 → right eye outer corner
 *  - #6   → nose bridge (between the eyes)
 *  - #127 → left tragion (ear area)
 *  - #356 → right tragion (ear area)
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

// Smoothing factor for EMA (lower = smoother, more stable)
const SMOOTH_FACTOR = 0.08;
// Extra padding multiplier on ear width for the frame
const TEMPLE_PADDING = 1.55;
// Depth scaling sensitivity (lower = less erratic)
const DEPTH_SCALE_FACTOR = 0.8;
// Max per-frame delta as fraction of canvas dimension (velocity damping)
const MAX_POSITION_DELTA = 0.03;
const MAX_SIZE_DELTA = 0.04;
// Max angle change per frame in radians
const MAX_ANGLE_DELTA = 0.02;
// Number of warmup frames to skip before showing overlay
const WARMUP_FRAMES = 3;

let prevTransform: OverlayTransform | null = null;
let frameCount = 0;

export function resetSmoothing(): void {
  prevTransform = null;
  frameCount = 0;
}

function ema(prev: number, curr: number, alpha: number): number {
  return prev + alpha * (curr - prev);
}

function clampDelta(prev: number, curr: number, maxDelta: number, refSize: number): number {
  const delta = curr - prev;
  const maxAbs = maxDelta * refSize;
  if (Math.abs(delta) > maxAbs) {
    return prev + Math.sign(delta) * maxAbs;
  }
  return curr;
}

/**
 * Extract yaw and pitch from a 4×4 column-major transformation matrix.
 */
export function extractPoseFromMatrix(matrix: number[]): { yaw: number; pitch: number; roll: number } | null {
  if (!matrix || matrix.length < 16) return null;

  // Column-major: m[col*4 + row]
  const m00 = matrix[0], m10 = matrix[1], m20 = matrix[2];
  const m01 = matrix[4], m11 = matrix[5], m21 = matrix[6];
  const m02 = matrix[8], m12 = matrix[9], m22 = matrix[10];

  const pitch = Math.asin(-m20);
  const cosPitch = Math.cos(pitch);

  let yaw: number, roll: number;
  if (Math.abs(cosPitch) > 0.001) {
    yaw = Math.atan2(m10, m00);
    roll = Math.atan2(m21, m22);
  } else {
    yaw = Math.atan2(-m01, m11);
    roll = 0;
  }

  return { yaw, pitch, roll };
}

export function computeGlassesTransform(
  landmarks: { x: number; y: number; z: number }[],
  canvasWidth: number,
  canvasHeight: number,
  imageAspectRatio: number = 0.45,
  transformationMatrix?: number[] | null
): OverlayTransform | null {
  if (!landmarks || landmarks.length < 468) return null;

  // Ear/tragion landmarks for face width (ear-to-ear)
  const leftEar: Point = {
    x: landmarks[127].x * canvasWidth,
    y: landmarks[127].y * canvasHeight,
  };
  const rightEar: Point = {
    x: landmarks[356].x * canvasWidth,
    y: landmarks[356].y * canvasHeight,
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

  // Width from ear-to-ear distance
  const earDistance = Math.sqrt(
    Math.pow(rightEar.x - leftEar.x, 2) +
      Math.pow(rightEar.y - leftEar.y, 2)
  );

  // Angle from eye corners
  const angle = Math.atan2(
    rightEye.y - leftEye.y,
    rightEye.x - leftEye.x
  );

  // Depth-aware scaling
  let depthScale = 1;
  if (transformationMatrix) {
    const pose = extractPoseFromMatrix(transformationMatrix);
    if (pose) {
      // Foreshorten width based on yaw (head turning left/right)
      depthScale = Math.cos(pose.yaw * 0.5);
    }
  } else {
    const avgZ = landmarks[6].z;
    depthScale = 1 + avgZ * DEPTH_SCALE_FACTOR;
  }

  const width = earDistance * TEMPLE_PADDING * depthScale;
  const height = width * imageAspectRatio;

  // Vertical center: mostly eye-top level (where glasses actually sit)
  const eyeTopMidY = (leftEyeTop.y + rightEyeTop.y) / 2;
  const centerX = noseBridge.x;
  const centerY = eyeTopMidY * 0.7 + noseBridge.y * 0.3;

  let raw: OverlayTransform = { centerX, centerY, width, height, angle };

  frameCount++;

  // Apply velocity damping + EMA smoothing
  if (prevTransform) {
    raw = {
      centerX: clampDelta(prevTransform.centerX, raw.centerX, MAX_POSITION_DELTA, canvasWidth),
      centerY: clampDelta(prevTransform.centerY, raw.centerY, MAX_POSITION_DELTA, canvasHeight),
      width: clampDelta(prevTransform.width, raw.width, MAX_SIZE_DELTA, canvasWidth),
      height: clampDelta(prevTransform.height, raw.height, MAX_SIZE_DELTA, canvasHeight),
      angle: clampDelta(prevTransform.angle, raw.angle, MAX_ANGLE_DELTA, 1),
    };

    const smoothed: OverlayTransform = {
      centerX: ema(prevTransform.centerX, raw.centerX, SMOOTH_FACTOR),
      centerY: ema(prevTransform.centerY, raw.centerY, SMOOTH_FACTOR),
      width: ema(prevTransform.width, raw.width, SMOOTH_FACTOR),
      height: ema(prevTransform.height, raw.height, SMOOTH_FACTOR),
      angle: ema(prevTransform.angle, raw.angle, SMOOTH_FACTOR),
    };
    prevTransform = smoothed;

    if (frameCount <= WARMUP_FRAMES) return null;
    return smoothed;
  }

  prevTransform = raw;
  if (frameCount <= WARMUP_FRAMES) return null;
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

  if (mirrorFlip) {
    ctx.scale(-1, 1);
  }

  ctx.scale(1, -1);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}
