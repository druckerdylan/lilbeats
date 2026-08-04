import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050508",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -2,
            color: "#f4f1e9",
            fontFamily: "sans-serif",
          }}
        >
          L<span style={{ color: "#c2142f" }}>B</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
