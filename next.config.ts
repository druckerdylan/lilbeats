import type { NextConfig } from "next";

/*
  Baseline hardening. Vercel already sends HSTS; everything else was absent,
  which left the site framable by any origin (clickjacking) and content-type
  sniffable. frame-ancestors carries the real policy — X-Frame-Options rides
  along for older agents. A full script-src CSP is deliberately NOT set:
  Next inlines its own bootstrap scripts, so a strict CSP needs per-request
  nonces and belongs to a change of its own, not a headers list.
*/
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site uses these APIs — checkout happens on Stripe's page.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  headers: async () => [{ source: "/(.*)", headers: SECURITY_HEADERS }],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
