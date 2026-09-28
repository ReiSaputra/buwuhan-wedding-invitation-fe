import { useState, useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingComparison } from "@/components/landing/LandingComparison";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingLiveDemoModal } from "@/components/landing/LandingLiveDemoModal";
import type { TemplateSlug } from "@/templates/template-registry";

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedDemoSlug, setSelectedDemoSlug] =
    useState<TemplateSlug>("royal-floral");

  // Update document title
  useEffect(() => {
    document.title = "buwuh.com";
  }, []);

  const handleOpenDemo = (slug: TemplateSlug = "royal-floral") => {
    setSelectedDemoSlug(slug);
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/20 selection:text-primary font-body antialiased flex flex-col">
      {/* Sticky Blur Navbar */}
      <LandingNavbar onOpenDemo={() => handleOpenDemo("royal-floral")} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <LandingHero onOpenDemo={() => handleOpenDemo("royal-floral")} />

        {/* Live Platform Stats */}
        <LandingStats />

        {/* Feature Deep Dive & Live Simulations */}
        <LandingFeatures />

        {/* 4-Step How It Works */}
        <LandingHowItWorks />

        {/* Feature & Value Comparison Table */}
        <LandingComparison />

        {/* Pricing Plans */}
        <LandingPricing />

        {/* Testimonials & Social Proof */}
        <LandingTestimonials />

        {/* Frequently Asked Questions */}
        <LandingFaq />

        {/* Pre-Footer Luxury CTA */}
        <LandingCta onOpenDemo={() => handleOpenDemo("royal-floral")} />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Interactive Live Demo Modal */}
      <LandingLiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialTemplateSlug={selectedDemoSlug}
      />
    </div>
  );
}
