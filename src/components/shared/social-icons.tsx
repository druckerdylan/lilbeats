import { SVGProps } from "react";

/**
 * lucide-react no longer ships brand/logo glyphs, so the handful of
 * platform icons the site needs (Instagram, YouTube, etc.) are hand-drawn
 * here to match lucide's 24x24 / stroke-based visual language.
 */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.3v5.4l4.8-2.7-4.8-2.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M15 4c.3 2 1.8 3.5 4 3.8" />
    </svg>
  );
}

export function SoundcloudIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14v3" />
      <path d="M6 12v5" />
      <path d="M9 10v7" />
      <path d="M12 8.5v8.5" />
      <path d="M15 17h5.5a3 3 0 0 0 0-6 4 4 0 0 0-7.8-1.2" />
    </svg>
  );
}

export function SpotifyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M7 10.5c3.2-1 7-.6 9.5.8" />
      <path d="M7.5 13.3c2.6-.8 5.7-.5 7.8.7" />
      <path d="M8 16c2-.6 4.4-.4 6 .6" />
    </svg>
  );
}

export function AppleMusicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="16.5" r="2.2" />
      <path d="M11.2 16.5V7l6.3-1.4V13" />
      <circle cx="15.5" cy="13" r="2.2" />
    </svg>
  );
}

export function BeatstarsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5l2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.5-4.3 2.5.9-5-3.7-3.4 5-.6z" />
    </svg>
  );
}
