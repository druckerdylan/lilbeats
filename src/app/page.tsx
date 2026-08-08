import { Hero } from "@/components/home/hero";
import { FeaturedBeats } from "@/components/home/featured-beats";
import { FeaturedServices } from "@/components/home/featured-services";
import { WhyChoose } from "@/components/home/why-choose";
import { Testimonials } from "@/components/home/testimonials";
import { EmailSignup } from "@/components/home/email-signup";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBeats />
      <FeaturedServices />
      <WhyChoose />
      <Testimonials />
      <EmailSignup />
      <FinalCta />
    </>
  );
}
