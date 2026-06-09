# /remotion-video

## Overview
Create professional video ads using Remotion, a React-based video framework. This skill handles composition setup, animation patterns, text overlays, and rendering.

## Project Location
All Remotion files live in `src/remotion/` within this project:
- `src/remotion/Root.tsx` — registers all compositions
- `src/remotion/compositions/` — individual video compositions
- `remotion.config.ts` — Remotion configuration

## Capabilities
- Create new Remotion compositions from a text description
- Add animated text overlays, transitions, and effects
- Configure video duration, resolution, and frame rate
- Preview in Remotion Studio
- Render to MP4

## Workflow
1. User describes the video they want
2. Create a new composition file in `src/remotion/compositions/`
3. Build the React component with Remotion primitives
4. Register it in `src/remotion/Root.tsx`
5. Preview: `npx remotion studio src/remotion/index.ts`
6. Render: `npx remotion render <CompositionId> out.mp4`

## Key Patterns
- Use `useCurrentFrame()` and `useVideoConfig()` hooks
- Use `interpolate()` for animations
- Use `spring()` for natural motion
- Use `<AbsoluteFill>` for layering
- Use `<Sequence>` for timing sections
- Register compositions in `src/remotion/Root.tsx`

## Rendering
- Preview: `npx remotion studio src/remotion/index.ts`
- Render: `npx remotion render <CompositionId> out.mp4`
- Vertical video: add `--width 1080 --height 1920`
- Custom output: `npx remotion render <CompositionId> out/<name>.mp4`

## Example Composition Structure
```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      <div style={{ opacity, color: '#e67e22', fontSize: 60 }}>
        Your Text Here
      </div>
    </AbsoluteFill>
  );
};
```

## Registration in Root.tsx
```tsx
<Composition
  id="MyVideo"
  component={MyVideo}
  durationInFrames={30 * 30}  // 30 seconds at 30fps
  fps={30}
  width={1920}
  height={1080}
/>
```
