import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: -1,
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
