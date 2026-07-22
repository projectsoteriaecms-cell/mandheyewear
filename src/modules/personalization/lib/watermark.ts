/**
 * Try-on result watermarking.
 *
 * The funnel depends on the on-screen preview being watermarked: the clean
 * full-resolution image only leaves the platform via email/WhatsApp after the
 * visitor gives a contact. Without this, a screenshot of the on-screen result
 * is a free clean copy and the contact gate captures nothing.
 *
 * Design: a faint diagonal tiled mark across the whole image (so cropping any
 * region still carries it) plus a crisp brand badge bottom-right. Kept subtle
 * -- the preview should still delight; shared screenshots become branded
 * advertising rather than a loss.
 */

const TILE_TEXT = "M&H EYEWEAR";
const BADGE_TEXT = "M&H EYEWEAR  •  mandheyewear.com";

/**
 * Returns a watermarked copy of the given image (data URL or same-origin URL).
 * Falls back to the ORIGINAL image on any failure -- a watermarking bug must
 * never cost a customer their result.
 */
export const applyTryOnWatermark = async (imageSrc: string): Promise<string> =>
  renderMark(imageSrc, { tile: true });

/**
 * Badge-only variant for images that LEAVE the platform after contact capture
 * (WhatsApp share, Status posts, email). No diagonal tiling -- the visitor
 * earned the clean look -- but the bottom-right brand badge stays, so every
 * shared image carries mandheyewear.com to whoever sees it. The share is the
 * advertisement; this is what routes its viewers back to the site.
 */
export const applyTryOnBadge = async (imageSrc: string): Promise<string> =>
  renderMark(imageSrc, { tile: false });

const renderMark = async (
  imageSrc: string,
  opts: { tile: boolean },
): Promise<string> => {
  try {
    const img = await loadImage(imageSrc);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageSrc;

    ctx.drawImage(img, 0, 0);

    const base = Math.min(canvas.width, canvas.height);

    // 1. Faint diagonal tile -- survives cropping. Screen-preview only.
    if (opts.tile) {
      const tileFont = Math.max(18, Math.round(base * 0.045));
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${tileFont}px system-ui, sans-serif`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      const stepX = tileFont * 9;
      const stepY = tileFont * 4;
      const span = Math.max(canvas.width, canvas.height);
      for (let y = -span; y <= span; y += stepY) {
        // Offset alternate rows so crops can't slip between marks.
        const rowOffset = (Math.round(y / stepY) % 2) * (stepX / 2);
        for (let x = -span; x <= span; x += stepX) {
          ctx.fillText(TILE_TEXT, x + rowOffset, y);
        }
      }
      ctx.restore();
    }

    // 2. Crisp badge bottom-right on a soft dark pill for legibility.
    const badgeFont = Math.max(14, Math.round(base * 0.028));
    ctx.font = `600 ${badgeFont}px system-ui, sans-serif`;
    const textWidth = ctx.measureText(BADGE_TEXT).width;
    const padX = badgeFont * 0.8;
    const padY = badgeFont * 0.5;
    const badgeW = textWidth + padX * 2;
    const badgeH = badgeFont + padY * 2;
    const bx = canvas.width - badgeW - badgeFont;
    const by = canvas.height - badgeH - badgeFont;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    // roundRect needs Safari 16+; older Safari (which we support -- see the
    // Object.hasOwn polyfill) falls back to a plain rectangle.
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
    } else {
      ctx.rect(bx, by, badgeW, badgeH);
    }
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(BADGE_TEXT, bx + padX, by + badgeH / 2 + 1);

    // JPEG q0.92: visually lossless for photos, far smaller than PNG.
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (err) {
    console.error("[watermark] failed, using clean image:", err);
    return imageSrc;
  }
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
