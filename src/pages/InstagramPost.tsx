import { InstagramUVPost } from "@/components/social/InstagramUVPost";

const InstagramPost = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 32,
      }}
    >
      {/* Meta info bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(245,239,232,0.45)",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ color: "#FFB81C", fontWeight: 600 }}>M&amp;H Eyewear</span>
        <span>·</span>
        <span>Instagram Post</span>
        <span>·</span>
        <span>UV Protection Campaign</span>
        <span>·</span>
        <span>1080 × 1080 px</span>
      </div>

      {/* Post preview — scaled to fit viewport */}
      <div
        style={{
          transformOrigin: "top center",
          transform: "scale(0.48)",
          marginBottom: -564,
          boxShadow: "0 32px 120px rgba(255,184,28,0.12), 0 4px 24px rgba(0,0,0,0.6)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <InstagramUVPost />
      </div>

      {/* Instructions */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(245,239,232,0.3)",
          textAlign: "center",
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        Right-click the post and select "Save image as…" or take a screenshot to export.
        <br />
        Designed at 1080×1080 px for Instagram square format.
      </p>
    </div>
  );
};

export default InstagramPost;
