import mhLogoGold from "@/assets/mh-logo-gold.png";

export const InstagramUVPost = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: "linear-gradient(145deg, #12121A 0%, #1A1A2E 50%, #0D0D14 100%)",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        color: "#F5EFE8",
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.35,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Background UV sun halo — large radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,184,28,0.12) 0%, rgba(255,184,28,0.04) 45%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Decorative corner lines — top left */}
      <div style={{ position: "absolute", top: 60, left: 60, zIndex: 3 }}>
        <div style={{ width: 48, height: 2, background: "#FFB81C", marginBottom: 6 }} />
        <div style={{ width: 2, height: 48, background: "#FFB81C" }} />
      </div>
      {/* Decorative corner lines — bottom right */}
      <div style={{ position: "absolute", bottom: 60, right: 60, zIndex: 3 }}>
        <div
          style={{ width: 48, height: 2, background: "#FFB81C", marginLeft: "auto", marginBottom: 6 }}
        />
        <div style={{ width: 2, height: 48, background: "#FFB81C", marginLeft: "auto" }} />
      </div>

      {/* Border frame */}
      <div
        style={{
          position: "absolute",
          inset: 40,
          border: "1px solid rgba(255,184,28,0.18)",
          borderRadius: 4,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 88px",
          zIndex: 10,
        }}
      >
        <img src={mhLogoGold} alt="M&H Eyewear" style={{ height: 52, objectFit: "contain" }} />
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#FFB81C",
            textTransform: "uppercase",
          }}
        >
          @mh_eyewear
        </span>
      </div>

      {/* ── UV SUN GRAPHIC ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
          zIndex: 5,
        }}
      >
        {/* Outer pulse ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 380,
            height: 380,
            borderRadius: "50%",
            border: "1px solid rgba(255,184,28,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 310,
            height: 310,
            borderRadius: "50%",
            border: "1px solid rgba(255,184,28,0.22)",
          }}
        />

        {/* Sun rays SVG */}
        <svg
          width={280}
          height={280}
          viewBox="0 0 280 280"
          style={{ display: "block", position: "relative" }}
        >
          {/* Ray lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const innerR = 84;
            const outerR = 128;
            const x1 = 140 + innerR * Math.cos(angle);
            const y1 = 140 + innerR * Math.sin(angle);
            const x2 = 140 + outerR * Math.cos(angle);
            const y2 = 140 + outerR * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? "#FFB81C" : "#CC8800"}
                strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={i % 2 === 0 ? 1 : 0.55}
              />
            );
          })}

          {/* Sun core glow */}
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <stop offset="55%" stopColor="#FFB81C" stopOpacity="1" />
              <stop offset="100%" stopColor="#CC8800" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="shieldGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1E1E38" />
              <stop offset="100%" stopColor="#0D0D14" />
            </radialGradient>
          </defs>

          {/* Sun circle */}
          <circle cx="140" cy="140" r="72" fill="url(#sunGlow)" />

          {/* Shield overlay on sun */}
          <path
            d="M140 88 L172 104 L172 138 C172 162 155 178 140 186 C125 178 108 162 108 138 L108 104 Z"
            fill="url(#shieldGrad)"
            stroke="#FFB81C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Shield checkmark */}
          <polyline
            points="128,138 137,148 154,128"
            fill="none"
            stroke="#FFB81C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* UV text inside sun */}
          <text
            x="140"
            y="122"
            textAnchor="middle"
            fontFamily="'Syne', sans-serif"
            fontWeight="800"
            fontSize="11"
            letterSpacing="3"
            fill="#FFB81C"
          >
            UV400
          </text>
        </svg>
      </div>

      {/* ── HEADLINE ── */}
      <div
        style={{
          position: "absolute",
          bottom: 310,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          padding: "0 88px",
        }}
      >
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.28em",
            color: "#FFB81C",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          Eye Protection Series
        </p>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 86,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "#F5EFE8",
            textTransform: "uppercase",
            margin: "0 0 20px",
          }}
        >
          SHIELD
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #FFB81C 0%, #FFD700 50%, #CC8800 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            YOUR
          </span>
          <br />
          VISION
        </h1>
        <div
          style={{
            width: 64,
            height: 2,
            background: "linear-gradient(90deg, #FFB81C, #FFD700)",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(245,239,232,0.72)",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          UV rays are invisible — the damage isn't.
          <br />
          Our UV400 lenses block 100% of UVA &amp; UVB radiation.
        </p>
      </div>

      {/* ── FACT PILLS ── */}
      <div
        style={{
          position: "absolute",
          bottom: 158,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          padding: "0 88px",
          zIndex: 10,
        }}
      >
        {[
          { icon: "☀️", label: "Blocks UVA & UVB" },
          { icon: "👁️", label: "Reduces Cataract Risk" },
          { icon: "🛡️", label: "All-Day Protection" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,184,28,0.08)",
              border: "1px solid rgba(255,184,28,0.25)",
              borderRadius: 100,
              padding: "10px 22px",
              fontSize: 15,
              fontWeight: 500,
              color: "#F5EFE8",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 17 }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 88px",
          zIndex: 10,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "rgba(245,239,232,0.4)",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            M&amp;H Eyewear
          </p>
          <p
            style={{
              fontSize: 13,
              color: "rgba(245,239,232,0.35)",
              margin: 0,
            }}
          >
            #SeeWithConfidence · #UVProtection · #MHEyewear
          </p>
        </div>

        {/* CTA button */}
        <div
          style={{
            background: "linear-gradient(135deg, #FFB81C 0%, #CC8800 100%)",
            borderRadius: 100,
            padding: "14px 32px",
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#12121A",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Shop Frames →
        </div>
      </div>
    </div>
  );
};
