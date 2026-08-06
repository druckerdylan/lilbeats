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

/*
  Only accounts confirmed to be the producer's. The generated site shipped with
  instagram/tiktok/soundcloud/spotify/appleMusic pointing at `/lilbeats`
  handles that belong to other people — live, clickable, and sending visitors
  to strangers. Removed rather than guessed; add them back as they are known.
*/
export const SOCIAL_LINKS = {
  youtube: "https://youtube.com/@lilbeats-h1x",
  beatstars: "https://www.beatstars.com/lilbeatsofficial",
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
