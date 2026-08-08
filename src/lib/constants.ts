export const SITE_NAME = "Lil Beats";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lilbeatsofficial.com";

export const BRAND = {
  tagline: "Dark Production. Clean Mixes. Records That Hit.",
  /*
    The real, monitored inbox. Every mailto on the site, the reply-to on every
    outbound email, and the destination for contact-form and mixing-request
    notifications all resolve to this one constant — so it is the only place
    the address is written down.

    The previous contact@lilbeats.com and support@lilbeats.com were on a domain
    nobody here owns: mail sent to them went nowhere, silently.
  */
  email: "lilbeats070@gmail.com",
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
