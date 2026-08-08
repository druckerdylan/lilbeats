export const SITE_NAME = "Lil Beats";
/*
  The canonical host. `www` rather than the apex on purpose: the apex 308s to
  `www.lilbeatsofficial.com`, so www is the host that actually answers 200,
  and a canonical URL should never point at a redirect.

  `NEXT_PUBLIC_SITE_URL` must still be set in the Vercel environment — this
  is a safety net, not the configuration. It exists so that a missing env var
  can never make the sitemap, robots.txt, canonical tags, OG cards, or
  transactional email advertise a domain the project does not own; the
  previous fallback was `lilbeats.com`, which belongs to someone else.

  Note the same content is currently reachable on three hosts (apex, www, and
  lilbeats.vercel.app). The canonical tags built off this value are what tell
  search engines which one counts.
*/
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
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  explore: [
    { label: "Beats", href: "/beats" },
    { label: "Mixing & Mastering", href: "/mixing-mastering" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Licensing", href: "/licensing" },
  ],
};
