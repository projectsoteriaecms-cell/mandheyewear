/**
 * Glasses overlay positioning using MediaPipe Face Mesh landmarks.
 *
 * Key landmarks:
 *  - #33  → left eye outer corner
 *  - #263 → right eye outer corner
 *  - #6   → nose bridge (between the eyes)
 *  - #234 → left ear/temple area
 *  - #454 → right ear/temple area
 */

interface Point {
  x: number;
  y: number;
}

interface OverlayTransform {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  angle: number;
}

const SCALE_FACTOR = 2.4; // how much wider than eye-to-eye distance
const ASPECT_RATIO = 0.45; // height relative to width for typical glasses

export function computeGlassesTransform(
  landmarks: { x: number; y: number; z: number }[],
  canvasWidth: number,
  canvasHeight: number
): OverlayTransform | null {
  if (!landmarks || landmarks.length < 468) return null;

  const leftEye: Point = {
    x: landmarks[33].x * canvasWidth,
    y: landmarks[33].y * canvasHeight,
  };
  const rightEye: Point = {
    x: landmarks[263].x * canvasWidth,
    y: landmarks[263].y * canvasHeight,
  };
  const noseBridge: Point = {
    x: landmarks[6].x * canvasWidth,
    y: landmarks[6].y * canvasHeight,
  };

  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
  );

  const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

  const width = eyeDistance * SCALE_FACTOR;
  const height = width * ASPECT_RATIO;

  // Center slightly above nose bridge (shift up a tiny bit for natural look)
  const centerX = noseBridge.x;
  const centerY = noseBridge.y - height * 0.05;

  return { centerX, centerY, width, height, angle };
}

export function drawGlassesOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: OverlayTransform
): void {
  const { centerX, centerY, width, height, angle } = transform;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}
