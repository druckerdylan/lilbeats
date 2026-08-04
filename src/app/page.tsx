import { Hero } from "@/components/home/hero";
import { FeaturedBeats } from "@/components/home/featured-beats";
import { FeaturedServices } from "@/components/home/featured-services";
import { WhyChoose } from "@/components/home/why-choose";
import { PortfolioPreview } from "@/components/home/portfolio-preview";
import { Testimonials } from "@/components/home/testimonials";
import { EmailSignup } from "@/components/home/email-signup";
import { SocialSection } from "@/components/home/social-section";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBeats />
      <FeaturedServices />
      <WhyChoose />
      <PortfolioPreview />
      <Testimonials />
      <EmailSignup />
      <SocialSection />
      <FinalCta />
    </>
  );
}
