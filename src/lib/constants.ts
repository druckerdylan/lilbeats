export const SITE_NAME = "Lil Beats";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lilbeats.com";

export const BRAND = {
  tagline: "Dark Production. Clean Mixes. Records That Hit.",
  email: "contact@lilbeats.com",
  supportEmail: "support@lilbeats.com",
  location: "Washington, D.C.",
  hours: "Mon – Fri, 9am – 6pm ET",
  responseTime: "Within 24–48 hours",
};

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/lilbeats",
  youtube: "https://youtube.com/@lilbeats-h1x",
  tiktok: "https://tiktok.com/@lilbeats",
  soundcloud: "https://soundcloud.com/lilbeats",
  beatstars: "https://beatstars.com/lilbeats",
  spotify: "https://open.spotify.com/artist/lilbeats",
  appleMusic: "https://music.apple.com/artist/lilbeats",
};

export const NAV_LINKS = [
  { label: "Beats", href: "/beats" },
  { label: "Mixing & Mastering", href: "/mixing-mastering" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  explore: [
    { label: "Beats", href: "/beats" },
    { label: "Mixing & Mastering", href: "/mixing-mastering" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Licensing", href: "/licensing" },
  ],
};
