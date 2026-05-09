import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

const BRAND_BLUE = '#1B3A6B';
const BRAND_GOLD = '#C9A84C';
const WHITE = '#FFFFFF';

const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const translateY = interpolate(frame, [delay, delay + 20], [30, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};

const FeatureCard: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [-60, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${BRAND_GOLD}44`,
        borderLeft: `4px solid ${BRAND_GOLD}`,
        borderRadius: 12,
        padding: '20px 32px',
        marginBottom: 20,
        color: WHITE,
        fontSize: 32,
        fontFamily: 'Georgia, serif',
        letterSpacing: 0.5,
      }}
    >
      {text}
    </div>
  );
};

export const SoteriaAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CTA pulse
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.97, 1.03],
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #0d2247 60%, #07142e 100%)`,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 120px',
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_GOLD}22 0%, transparent 70%)`,
        }}
      />

      {/* Hook: 0 – 2s */}
      <Sequence from={0} durationInFrames={fps * 2}>
        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <FadeIn delay={0}>
            <div
              style={{
                color: BRAND_GOLD,
                fontSize: 28,
                letterSpacing: 6,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Soteria Eye Clinic
            </div>
          </FadeIn>
          <FadeIn delay={8}>
            <div
              style={{
                color: WHITE,
                fontSize: 64,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Your Vision.
              <br />
              Our Priority.
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Features: 2s – 7s */}
      <Sequence from={fps * 2} durationInFrames={fps * 5}>
        <AbsoluteFill
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 120px',
          }}
        >
          <div
            style={{
              color: BRAND_GOLD,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 36,
            }}
          >
            Why Choose Us
          </div>
          <FeatureCard text="Comprehensive Eye Examinations" startFrame={0} />
          <FeatureCard
            text="Advanced Cataract & Laser Surgery"
            startFrame={15}
          />
          <FeatureCard
            text="Expert Glaucoma & Retina Care"
            startFrame={30}
          />
        </AbsoluteFill>
      </Sequence>

      {/* CTA: 7s – 10s */}
      <Sequence from={fps * 7} durationInFrames={fps * 3}>
        <AbsoluteFill
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <FadeIn delay={0}>
            <div
              style={{
                color: WHITE,
                fontSize: 48,
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              Book Your Appointment Today
            </div>
          </FadeIn>
          <FadeIn delay={15}>
            <div
              style={{
                transform: `scale(${pulse})`,
                background: BRAND_GOLD,
                color: BRAND_BLUE,
                fontSize: 32,
                fontWeight: 700,
                padding: '20px 60px',
                borderRadius: 50,
                letterSpacing: 1,
              }}
            >
              soteriaeyeclinic.com
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
