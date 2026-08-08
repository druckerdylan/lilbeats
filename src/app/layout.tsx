import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { PageTransition } from "@/components/shared/page-transition";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { NowPlayingBar } from "@/components/beats/now-playing-bar";

const displayFont = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /*
    The same content answers on the apex, on www, and on the vercel.app
    subdomain. Without a canonical that is three copies of every page as far
    as a crawler is concerned, so this pins them all to `SITE_URL`, which
    `metadataBase` resolves the relative path against.

    INHERITED, and that is the catch: any page that does not set its own
    `alternates` self-canonicalises to the homepage. Every indexable page
    with a `metadata` export therefore carries its own path.
  */
  alternates: { canonical: "/" },
  title: {
    default: `${SITE_NAME} — Dark Production. Clean Mixes. Records That Hit.`,
    template: `%s — ${SITE_NAME}`,
  },
  // 146 chars — the previous 228 truncated in every search result.
  description:
    "Dark trap, drill and phonk instrumentals for serious artists. Instant licensing from $15, plus mixing and mastering that translates on any system.",
  keywords: [
    "Lil Beats",
    "beats for sale",
    "type beats",
    "mixing and mastering",
    "buy beats online",
    "trap beats",
    "hip hop instrumentals",
    "music producer",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Dark Production. Clean Mixes. Records That Hit.`,
    description:
      "Original beats and professional mixing & mastering from Lil Beats. Instant delivery, premium sound, records built to hit.",
    // Card art comes from app/opengraph-image.tsx — Next generates and wires
    // it up automatically, for both Open Graph and Twitter.
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Dark Production. Clean Mixes. Records That Hit.`,
    description:
      "Original beats and professional mixing & mastering from Lil Beats. Instant delivery, premium sound, records built to hit.",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      // next-themes re-applies the `dark` class and a `color-scheme` style on
      // mount, which never matches the server HTML exactly. The theme is
      // forced dark anyway, so the difference is cosmetic.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ink text-bone overflow-x-hidden">
        <div className="grain-overlay" aria-hidden="true" />
        <div className="crt-lines" aria-hidden="true" />
        <div className="crt-sweep" aria-hidden="true" />
        <Providers>
          <ScrollProgress />
          <Navbar />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <NowPlayingBar />
        </Providers>
        {/*
          Vercel Web Analytics. Injects nothing outside a Vercel deployment,
          renders no DOM, and is cookieless — visitors are identified by a
          hash of the incoming request that is discarded after 24 hours. It
          is what makes the analytics paragraph in /privacy true; keep the
          two in step if this ever changes.
        */}
        <Analytics />
      </body>
    </html>
  );
}
