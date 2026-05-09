import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── BRAND COLORS ────────────────────────────────────────────────
const C = {
  bg:            "#F2F5E8",
  glow:          "#C8E87A",
  logoBg:        "#0D1F14",
  logoText:      "#C8E87A",
  limePill:      "#A8D44A",
  bluePill:      "#C0D8EC",
  darkPill:      "#1A1A2E",
  creamPill:     "#EDE8DC",
  darkGreenPill: "#2A4A30",
  tealPill:      "#1A3A4A",
  maroonPill:    "#3A1A1A",
  mintPill:      "#88DDB8",
  pinkPill:      "#E89AB8",
  lightBluePill: "#A8C8E0",
  greenPill:     "#88CC44",
  dark:          "#1A1A1A",
  white:         "#FFFFFF",
  pink:          "#E87898",
  lime:          "#C8E87A",
  grey:          "#888888",
  salmon:        "#E8785A",
};

// ─── LOGO POSITION ───────────────────────────────────────────────
// Card is 120×180px. Left=700 puts visual center at x=760.
// Spec arrow origin: x=820, y=380 — the true card center (left=760 + 60).
// We split into card-left and arrow-center to be precise.
const CARD_LEFT   = 700;
const CARD_TOP    = 290;
const ARROW_CX    = 820;  // 760 (card left per spec) + 60 (half width)
const ARROW_CY    = 380;  // 290 (card top) + 90 (half height)

// ─── SERVICE PILLS (17 total, index 0–16) ────────────────────────
const SERVICES = [
  // Row 0
  { label: "Growth Strategy",      bg: C.limePill,      tx: C.dark,   hasThumb: true,  thumbBg: "#5A8A3A", row: 0, col: 0 },
  { label: "Brand Architecture",   bg: C.bluePill,      tx: C.dark,   hasThumb: false, thumbBg: "",        row: 0, col: 1 },
  { label: "AI Systems",           bg: C.darkPill,      tx: C.pink,   hasThumb: false, thumbBg: "",        row: 0, col: 2 },
  // Row 1
  { label: "Campaign Engine",      bg: C.creamPill,     tx: C.dark,   hasThumb: true,  thumbBg: "#6A7A5A", row: 1, col: 0 },
  { label: "Motion Graphics",      bg: C.creamPill,     tx: C.dark,   hasThumb: true,  thumbBg: "#C85A2A", row: 1, col: 1 },
  { label: "Market Expansion",     bg: C.darkGreenPill, tx: C.lime,   hasThumb: false, thumbBg: "",        row: 1, col: 2 },
  // Row 2
  { label: "Web & UI Design",      bg: C.limePill,      tx: C.dark,   hasThumb: false, thumbBg: "",        row: 2, col: 0 },
  { label: "Partnership Pipeline", bg: C.darkGreenPill, tx: C.lime,   hasThumb: false, thumbBg: "",        row: 2, col: 1 },
  { label: "Content Production",   bg: C.bluePill,      tx: C.dark,   hasThumb: false, thumbBg: "",        row: 2, col: 2 },
  // Row 3
  { label: "Email Campaigns",      bg: C.tealPill,      tx: C.white,  hasThumb: true,  thumbBg: "#2A5A7A", row: 3, col: 0 },
  { label: "Brand Strategy",       bg: C.creamPill,     tx: C.dark,   hasThumb: false, thumbBg: "",        row: 3, col: 1 },
  { label: "3D & Visual Design",   bg: C.darkGreenPill, tx: C.salmon, hasThumb: true,  thumbBg: "#7A4A2A", row: 3, col: 2 },
  // Row 4
  { label: "Copywriting",          bg: C.creamPill,     tx: C.dark,   hasThumb: false, thumbBg: "",        row: 4, col: 0 },
  { label: "AI Consulting",        bg: C.maroonPill,    tx: C.pink,   hasThumb: false, thumbBg: "",        row: 4, col: 1 },
  { label: "GTM Playbooks",        bg: C.limePill,      tx: C.dark,   hasThumb: false, thumbBg: "",        row: 4, col: 2 },
  // Row 5
  { label: "AI Enhanced Creative", bg: C.bluePill,      tx: C.dark,   hasThumb: true,  thumbBg: "#4A7A6A", row: 5, col: 0 },
  { label: "...and more",          bg: C.creamPill,     tx: C.grey,   hasThumb: false, thumbBg: "",        row: 5, col: 1 },
];

// ─── TEAM AVATARS (9 total, index 0–8) ───────────────────────────
const TEAMS = [
  { label: "Founders",   pillBg: C.creamPill,     pillTx: C.dark,  avatarBg: "#8A5A3A", initials: "F", x: 960,  y: 80  },
  { label: "Marketing",  pillBg: C.mintPill,      pillTx: C.dark,  avatarBg: "#5A3A2A", initials: "M", x: 1130, y: 60  },
  { label: "Strategy",   pillBg: C.darkGreenPill, pillTx: C.white, avatarBg: "#C8A888", initials: "S", x: 1340, y: 80  },
  { label: "Brand",      pillBg: C.pinkPill,      pillTx: C.dark,  avatarBg: "#6A7A8A", initials: "B", x: 920,  y: 290 },
  { label: "Product",    pillBg: C.pinkPill,      pillTx: C.dark,  avatarBg: "#8A7A6A", initials: "P", x: 1110, y: 270 },
  { label: "Growth",     pillBg: C.lightBluePill, pillTx: C.dark,  avatarBg: "#6A8A5A", initials: "G", x: 1320, y: 290 },
  { label: "Operations", pillBg: C.lightBluePill, pillTx: C.dark,  avatarBg: "#7A6A5A", initials: "O", x: 960,  y: 490 },
  { label: "Events",     pillBg: C.greenPill,     pillTx: C.dark,  avatarBg: "#8A9A7A", initials: "E", x: 1150, y: 510 },
  { label: "Campaigns",  pillBg: C.darkGreenPill, pillTx: C.white, avatarBg: "#4A7A5A", initials: "C", x: 1350, y: 490 },
];

// ─── BACKGROUND ──────────────────────────────────────────────────
const Background: React.FC<{ fadeOut: number }> = ({ fadeOut }) => (
  <AbsoluteFill style={{ background: C.bg, opacity: 1 - fadeOut * 0.3 }}>
    <div style={{
      position: "absolute",
      left: ARROW_CX - 300, top: ARROW_CY - 300,
      width: 600, height: 600,
      borderRadius: "50%",
      background: `radial-gradient(ellipse, ${C.glow}66 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute",
      left: -80, top: -80,
      width: 400, height: 400,
      borderRadius: "50%",
      background: `radial-gradient(ellipse, ${C.glow}33 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute",
      right: -100, top: 200,
      width: 500, height: 500,
      borderRadius: "50%",
      background: `radial-gradient(ellipse, ${C.glow}22 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />
  </AbsoluteFill>
);

// ─── SERVICE PILL ─────────────────────────────────────────────────
const ServicePill: React.FC<{
  svc: typeof SERVICES[0];
  idx: number;
  globalFade: number;
}> = ({ svc, idx, globalFade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = 8 + idx * 4;
  const prog = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 16, stiffness: 130, mass: 0.8 },
  });

  const opacity = interpolate(prog, [0, 1], [0, 1]) * (1 - globalFade);
  const tx      = interpolate(prog, [0, 1], [-30, 0]);
  const scale   = interpolate(prog, [0, 1], [0.88, 1]);

  const colOffsets = [0, 208, 400];
  const x = 38 + colOffsets[svc.col];
  const y = 108 + svc.row * 72;

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      opacity,
      transform: `translateX(${tx}px) scale(${scale})`,
      transformOrigin: "left center",
    }}>
      <div style={{
        backgroundColor: svc.bg,
        color: svc.tx,
        borderRadius: 40,
        padding: svc.hasThumb ? "8px 18px 8px 8px" : "11px 22px",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Segoe UI', 'Inter', 'Arial', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        letterSpacing: 0.2,
      }}>
        {svc.hasThumb && (
          <div style={{
            width: 36, height: 36,
            borderRadius: "50%",
            backgroundColor: svc.thumbBg,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: C.white,
            fontWeight: 700,
          }}>
            {svc.label[0]}
          </div>
        )}
        {svc.label}
      </div>
    </div>
  );
};

// ─── DCH LOGO CARD ────────────────────────────────────────────────
const DCHLogoCard: React.FC<{ phase4Progress: number }> = ({ phase4Progress }) => {
  const scale = interpolate(phase4Progress, [0, 1], [1, 1.15]);
  // Phase 4: card drifts toward horizontal center (960 - 60 = 900)
  const left  = interpolate(phase4Progress, [0, 1], [CARD_LEFT, 900]);
  const top   = interpolate(phase4Progress, [0, 1], [CARD_TOP, 450]);

  return (
    <div style={{
      position: "absolute",
      left, top,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}>
      <div style={{
        width: 120,
        height: 180,
        backgroundColor: C.logoBg,
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          color: C.logoText,
          fontSize: 36,
          fontWeight: 900,
          fontFamily: "'Segoe UI', 'Inter', 'Arial', sans-serif",
          letterSpacing: -1.5,
          lineHeight: 1,
        }}>
          DCH
        </div>
        <div style={{
          width: 40, height: 2,
          backgroundColor: C.logoText,
          opacity: 0.3,
          marginTop: 8,
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
};

// ─── ARROW (logo center → avatar center) ─────────────────────────
const Arrow: React.FC<{
  x2: number; y2: number;
  delay: number;
  globalFade: number;
}> = ({ x2, y2, delay, globalFade }) => {
  const frame = useCurrentFrame();

  const prog = interpolate(
    frame, [delay, delay + 18], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = prog * 0.6 * (1 - globalFade);
  const endX = ARROW_CX + (x2 - ARROW_CX) * prog;
  const endY = ARROW_CY + (y2 - ARROW_CY) * prog;

  return (
    <svg style={{
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "100%",
      pointerEvents: "none",
      overflow: "visible",
    }}>
      <defs>
        <marker
          id={`ah-${delay}`}
          markerWidth="8" markerHeight="8"
          refX="6" refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill={C.glow} />
        </marker>
      </defs>
      <line
        x1={ARROW_CX} y1={ARROW_CY}
        x2={endX}      y2={endY}
        stroke={C.glow}
        strokeWidth={2.5}
        opacity={opacity}
        markerEnd={`url(#ah-${delay})`}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── TEAM AVATAR ──────────────────────────────────────────────────
const TeamAvatar: React.FC<{
  team: typeof TEAMS[0];
  idx: number;
  globalFade: number;
}> = ({ team, idx, globalFade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = 90 + idx * 8;
  const prog = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
  });

  const opacity = interpolate(prog, [0, 1], [0, 1]) * (1 - globalFade);
  const scale   = interpolate(prog, [0, 1], [0.5, 1]);

  return (
    <div style={{
      position: "absolute",
      left: team.x, top: team.y,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <div style={{
        width: 72, height: 72,
        borderRadius: "50%",
        backgroundColor: team.avatarBg,
        border: `3px solid ${C.white}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        fontWeight: 700,
        color: C.white,
        fontFamily: "'Segoe UI', 'Inter', 'Arial', sans-serif",
        position: "relative",
        zIndex: 2,
      }}>
        {team.initials}
      </div>
      <div style={{
        backgroundColor: team.pillBg,
        color: team.pillTx,
        padding: "6px 16px",
        borderRadius: 24,
        fontFamily: "'Segoe UI', 'Inter', 'Arial', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        marginTop: -12,
        position: "relative",
        zIndex: 1,
      }}>
        {team.label}
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────
export const DCHMotionGraphics: React.FC<{
  titleText: string;
  tagline: string;
}> = () => {
  const frame = useCurrentFrame();

  // Phase 4 global fade: frame 240–300
  const globalFade = interpolate(
    frame, [240, 300], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Logo scale-up: frame 250–310
  const phase4Progress = interpolate(
    frame, [250, 310], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <Background fadeOut={globalFade} />

      {SERVICES.map((svc, i) => (
        <ServicePill key={svc.label} svc={svc} idx={i} globalFade={globalFade} />
      ))}

      {TEAMS.map((team, i) => (
        <Arrow
          key={`arrow-${team.label}`}
          x2={team.x + 36}
          y2={team.y + 36}
          delay={85 + i * 8}
          globalFade={globalFade}
        />
      ))}

      {TEAMS.map((team, i) => (
        <TeamAvatar key={team.label} team={team} idx={i} globalFade={globalFade} />
      ))}

      <DCHLogoCard phase4Progress={phase4Progress} />
    </AbsoluteFill>
  );
};
