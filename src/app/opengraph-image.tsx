import { ImageResponse } from "next/og";
import { BRAND, SITE_NAME } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — ${BRAND.tagline}`;

/**
 * The link preview card. Built as a title frame: letterboxed, near-black,
 * with the red key light pooling behind the wordmark.
 *
 * Deliberately typeset in the system sans rather than the site's Bebas
 * Neue — pulling a webfont in here would make every build depend on a
 * network fetch, and at this size uppercase + tight tracking carries the
 * same weight.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#050508",
          fontFamily: "sans-serif",
        }}
      >
        {/* Key light */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: 300,
            width: 600,
            height: 600,
            borderRadius: 600,
            background:
              "radial-gradient(circle, rgba(194,20,47,0.55) 0%, rgba(194,20,47,0.14) 45%, rgba(5,5,8,0) 70%)",
            display: "flex",
          }}
        />
        {/* Cool fill in the opposite corner, so the red reads hot */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background:
              "radial-gradient(circle, rgba(46,92,138,0.28) 0%, rgba(5,5,8,0) 70%)",
            display: "flex",
          }}
        />

        {/* Letterbox bars */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            background: "#050508",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 44,
            background: "#050508",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 12,
            color: "#c2142f",
            textTransform: "uppercase",
            marginBottom: 30,
          }}
        >
          Lil Beats Productions
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 168,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
            color: "#f4f1e9",
            textTransform: "uppercase",
            // Satori lays these out as flex children, so a literal space
            // between them would collapse — the gap is the word space.
            gap: 26,
          }}
        >
          <span>Lil</span>
          <span style={{ color: "#ff2d47" }}>Beats</span>
        </div>

        <div
          style={{
            display: "flex",
            width: 460,
            height: 1,
            background: "rgba(244,241,233,0.22)",
            marginTop: 40,
            marginBottom: 34,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 1,
            color: "#91909a",
          }}
        >
          {BRAND.tagline}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 74,
            display: "flex",
            fontSize: 17,
            letterSpacing: 7,
            color: "#5f5e66",
            textTransform: "uppercase",
          }}
        >
          Beats · Mixing · Mastering — {BRAND.location}
        </div>
      </div>
    ),
    { ...size }
  );
}
