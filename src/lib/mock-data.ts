import { Beat, FaqItem, Review, Testimonial } from "@/lib/types";
import { unsplash } from "@/lib/unsplash";

export const BEATS: Beat[] = [
  {
    id: "bt-001",
    slug: "nocturne",
    title: "Nocturne",
    artworkUrl: unsplash("1493225457124-a3eb161ffa5f"),
    previewAudioUrl: "/audio/previews/nocturne.mp3",
    fullMp3Url: "/audio/previews/nocturne.mp3",
    wavUrl: "/audio/previews/nocturne.mp3",
    stemsUrl: "/audio/previews/nocturne.mp3",
    bpm: 140,
    key: "F",
    keyMode: "Minor",
    genre: "Dark Trap",
    mood: ["Dark", "Cinematic", "Moody"],
    tags: ["night drive", "travis scott type beat", "atmospheric", "808"],
    description:
      "A slow-burning dark trap instrumental built around a detuned choir pad, glassy bells, and a sub-808 that never lets up. Nocturne was made for records that need space to breathe — verses that sit low and hooks that hit like headlights through fog.",
    durationSeconds: 198,
    basePrice: 29.95,
    plays: 18420,
    favorites: 742,
    featured: true,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-04-02",
  },
  {
    id: "bt-002",
    slug: "concrete-halo",
    title: "Concrete Halo",
    artworkUrl: unsplash("1470225620780-dba8ba36b745"),
    previewAudioUrl: "/audio/previews/concrete-halo.mp3",
    fullMp3Url: "/audio/previews/concrete-halo.mp3",
    wavUrl: "/audio/previews/concrete-halo.mp3",
    stemsUrl: "/audio/previews/concrete-halo.mp3",
    bpm: 128,
    key: "G#",
    keyMode: "Minor",
    genre: "Trap",
    mood: ["Gritty", "Aggressive", "Hard"],
    tags: ["metro boomin type beat", "hard trap", "street", "808"],
    description:
      "Concrete Halo pairs a distorted bass growl with sparse, metallic percussion for a beat that feels like it was recorded in a stairwell. Built for artists who rap like they've got something to prove.",
    durationSeconds: 172,
    basePrice: 27.95,
    plays: 12980,
    favorites: 511,
    featured: true,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-03-18",
  },
  {
    id: "bt-003",
    slug: "amber-skyline",
    title: "Amber Skyline",
    artworkUrl: unsplash("1516280440614-37939bbacd81"),
    previewAudioUrl: "/audio/previews/amber-skyline.mp3",
    fullMp3Url: "/audio/previews/amber-skyline.mp3",
    wavUrl: "/audio/previews/amber-skyline.mp3",
    stemsUrl: "/audio/previews/amber-skyline.mp3",
    bpm: 95,
    key: "D",
    keyMode: "Minor",
    genre: "R&B / Trap Soul",
    mood: ["Smooth", "Luxurious", "Late-night"],
    tags: ["trap soul", "rnb type beat", "smooth", "vocal chops"],
    description:
      "Warm Rhodes chords, filtered vocal chops, and a laid-back half-time groove make Amber Skyline the sound of a penthouse window at 3am. Built for artists blending sung hooks with rap verses.",
    durationSeconds: 211,
    basePrice: 26.95,
    plays: 9840,
    favorites: 388,
    featured: false,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-02-27",
  },
  {
    id: "bt-004",
    slug: "static-prayer",
    title: "Static Prayer",
    artworkUrl: unsplash("1483412033650-1015ddeb83d1"),
    previewAudioUrl: "/audio/previews/static-prayer.mp3",
    fullMp3Url: "/audio/previews/static-prayer.mp3",
    wavUrl: "/audio/previews/static-prayer.mp3",
    stemsUrl: "/audio/previews/static-prayer.mp3",
    bpm: 145,
    key: "C",
    keyMode: "Minor",
    genre: "Drill",
    mood: ["Dark", "Ominous", "Aggressive"],
    tags: ["uk drill", "ny drill type beat", "sliding 808", "dark"],
    description:
      "Sliding 808s, a detuned violin loop, and drill-standard hats built for double-time flows. Static Prayer keeps the low end menacing without losing clarity on the top.",
    durationSeconds: 165,
    basePrice: 27.95,
    plays: 7710,
    favorites: 294,
    featured: false,
    isNew: true,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-06-30",
  },
  {
    id: "bt-005",
    slug: "chrome-saints",
    title: "Chrome Saints",
    artworkUrl: unsplash("1508700115892-45ecd05ae2ad"),
    previewAudioUrl: "/audio/previews/chrome-saints.mp3",
    fullMp3Url: "/audio/previews/chrome-saints.mp3",
    wavUrl: "/audio/previews/chrome-saints.mp3",
    stemsUrl: "/audio/previews/chrome-saints.mp3",
    bpm: 90,
    key: "A",
    keyMode: "Minor",
    genre: "Hip-Hop",
    mood: ["Confident", "Hard", "Anthemic"],
    tags: ["boom bap", "hard hip hop", "anthem", "sample flip"],
    description:
      "A chopped soul sample over rattling drums and a boom-bap swing built for artists who rap with weight behind every bar. Chrome Saints is built for anthems, not filler.",
    durationSeconds: 184,
    basePrice: 24.95,
    plays: 6320,
    favorites: 201,
    featured: false,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-01-14",
  },
  {
    id: "bt-006",
    slug: "midnight-cartier",
    title: "Midnight Cartier",
    artworkUrl: unsplash("1567095761054-7a02e69e5c43"),
    previewAudioUrl: "/audio/previews/midnight-cartier.mp3",
    fullMp3Url: "/audio/previews/midnight-cartier.mp3",
    wavUrl: "/audio/previews/midnight-cartier.mp3",
    stemsUrl: "/audio/previews/midnight-cartier.mp3",
    bpm: 130,
    key: "E",
    keyMode: "Minor",
    genre: "Trap Soul",
    mood: ["Luxurious", "Moody", "Late-night"],
    tags: ["trap soul", "luxury type beat", "moody", "melodic"],
    description:
      "Detuned Rhodes, a moody guitar lead, and a hypnotic 808 pattern built for melodic artists chasing a luxury, after-hours sound. Midnight Cartier rewards a strong top-line.",
    durationSeconds: 205,
    basePrice: 29.95,
    plays: 15230,
    favorites: 602,
    featured: true,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-03-05",
  },
  {
    id: "bt-007",
    slug: "vantablack",
    title: "Vantablack",
    artworkUrl: unsplash("1571019613454-1cb2f99b2d8b"),
    previewAudioUrl: "/audio/previews/vantablack.mp3",
    fullMp3Url: "/audio/previews/vantablack.mp3",
    wavUrl: "/audio/previews/vantablack.mp3",
    stemsUrl: "/audio/previews/vantablack.mp3",
    bpm: 150,
    key: "F#",
    keyMode: "Minor",
    genre: "Dark Trap",
    mood: ["Dark", "Eerie", "Cinematic"],
    tags: ["horrorcore", "dark trap", "eerie", "cinematic"],
    description:
      "Distorted choir stabs, a creeping string ostinato, and a sub that sits under everything like a held breath. Vantablack is built for artists working in the darkest corner of the genre.",
    durationSeconds: 176,
    basePrice: 27.95,
    plays: 5480,
    favorites: 233,
    featured: false,
    isNew: true,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-07-10",
  },
  {
    id: "bt-008",
    slug: "glass-city",
    title: "Glass City",
    artworkUrl: unsplash("1454922915609-78549ad709bb"),
    previewAudioUrl: "/audio/previews/glass-city.mp3",
    fullMp3Url: "/audio/previews/glass-city.mp3",
    wavUrl: "/audio/previews/glass-city.mp3",
    stemsUrl: "/audio/previews/glass-city.mp3",
    bpm: 138,
    key: "A#",
    keyMode: "Minor",
    genre: "Melodic Rap",
    mood: ["Emotional", "Atmospheric", "Cinematic"],
    tags: ["melodic rap", "emotional type beat", "atmospheric", "guitar"],
    description:
      "A reversed guitar swell, airy synth pads, and a melodic 808 line built for records about the cost of getting out. Glass City leaves room for a real vocal performance.",
    durationSeconds: 220,
    basePrice: 29.95,
    plays: 11040,
    favorites: 447,
    featured: false,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-02-08",
  },
  {
    id: "bt-009",
    slug: "8-mile-east",
    title: "8 Mile East",
    artworkUrl: unsplash("1531384441138-2736e62e0919"),
    previewAudioUrl: "/audio/previews/8-mile-east.mp3",
    fullMp3Url: "/audio/previews/8-mile-east.mp3",
    wavUrl: "/audio/previews/8-mile-east.mp3",
    stemsUrl: "/audio/previews/8-mile-east.mp3",
    bpm: 92,
    key: "G",
    keyMode: "Minor",
    genre: "Boom Bap",
    mood: ["Gritty", "Nostalgic", "Raw"],
    tags: ["boom bap", "90s hip hop", "nostalgic", "vinyl"],
    description:
      "Dusty vinyl crackle, a swung hi-hat pattern, and an upright bass loop pulled from a long-forgotten 45. 8 Mile East is for artists who still believe in the boom and the bap.",
    durationSeconds: 188,
    basePrice: 24.95,
    plays: 4210,
    favorites: 176,
    featured: false,
    isNew: false,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2025-12-19",
  },
  {
    id: "bt-010",
    slug: "rose-gold-requiem",
    title: "Rose Gold Requiem",
    artworkUrl: unsplash("1494232410401-ad00d5433cfa"),
    previewAudioUrl: "/audio/previews/rose-gold-requiem.mp3",
    fullMp3Url: "/audio/previews/rose-gold-requiem.mp3",
    wavUrl: "/audio/previews/rose-gold-requiem.mp3",
    stemsUrl: "/audio/previews/rose-gold-requiem.mp3",
    bpm: 142,
    key: "D#",
    keyMode: "Minor",
    genre: "Trap",
    mood: ["Luxurious", "Sad", "Moody"],
    tags: ["sad trap", "luxury type beat", "orchestral", "808"],
    description:
      "A mournful string arrangement collides with hard-hitting 808s for a beat that sounds expensive and feels heavy. Rose Gold Requiem was built for records about winning and losing at the same time.",
    durationSeconds: 193,
    basePrice: 29.95,
    plays: 13650,
    favorites: 559,
    featured: true,
    isNew: true,
    licenseAvailability: ["mp3", "wav", "unlimited", "exclusive"],
    createdAt: "2026-07-22",
  },
];

/*
  Emptied deliberately.

  These three arrays previously held invented reviews, testimonials attributed
  to named people, and a discography of releases presented as shipped work —
  and unlike BEATS they are NOT gated behind `isSupabaseConfigured()`, so they
  rendered on the live site regardless of what the real database contained.
  Fabricated endorsements and production credits on a commercial storefront are
  a trust and legal problem, not a placeholder.

  Repopulate only with real, permissioned content: quotes you actually received
  (with the person's consent to publish), and releases you genuinely worked on.
  Every consumer below handles an empty array by hiding its section.
*/
export const REVIEWS: Review[] = [];

export const TESTIMONIALS: Testimonial[] = [];

export const MIXING_FAQS: FaqItem[] = [
  {
    question: "What files do you need to start mixing my song?",
    answer:
      "Send unmastered, unprocessed vocal stems (WAV or AIFF preferred) along with the instrumental. If you have reference tracks or specific effects already in mind, include those too — the more context, the better the first mix.",
  },
  {
    question: "How many revisions are included?",
    answer:
      "Every package includes two rounds of revisions. Beyond that, additional rounds are $15 each and capped at $30 total — once you have hit that ceiling, revisions keep going at no extra cost until the mix is right.",
  },
  {
    question: "What's your turnaround time?",
    answer:
      "Standard turnaround is 3–5 business days for a single mix and master. Rush delivery (24–48 hours) is available for an additional fee, based on current availability.",
  },
  {
    question: "Do you master for both streaming and vinyl?",
    answer:
      "Yes. Let us know your intended release format when booking — streaming masters are optimized for platform loudness targets, while vinyl masters account for cutting limitations.",
  },
  {
    question: "Can you fix a mix I already started myself?",
    answer:
      "Absolutely. Send your session or stems and a short note on what's not working, and we'll rebuild the balance, tone, and dynamics from there.",
  },
];

export const BEAT_FAQS: FaqItem[] = [
  {
    question: "What do I actually receive after purchase?",
    answer:
      "Depending on the license you choose, you'll instantly receive an untagged MP3, WAV, and/or individual stem files, along with your license agreement — all delivered to your download page and inbox immediately after checkout.",
  },
  {
    question: "Can I use this beat on Spotify, Apple Music, and YouTube?",
    answer:
      "Yes. Every license tier includes commercial distribution rights up to the streaming and unit limits listed in the license comparison table above.",
  },
  {
    question: "What's the difference between a lease and an exclusive license?",
    answer:
      "A lease license is non-exclusive — the beat stays available for other artists to license too. An exclusive license removes the beat from the store entirely and transfers full ownership to you. Reach out using the 'Exclusive License Inquiry' button for pricing.",
  },
  {
    question: "Do I need to credit Lil Beats?",
    answer:
      "It's not required, but a production credit (e.g. \"Prod. Lil Beats\") is always appreciated and helps other artists find the catalog.",
  },
];
