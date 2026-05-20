import { HeroSection } from '@/components/blocks/HeroSection'
import { ProblemSection } from '@/components/blocks/ProblemSection'
import { BuyerSteps } from '@/components/blocks/BuyerSteps'
import { VendorSteps } from '@/components/blocks/VendorSteps'
import { AIFeatureSection } from '@/components/blocks/AIFeatureSection'
import { Testimonials } from '@/components/blocks/Testimonials'
import { PricingSection } from '@/components/blocks/PricingSection'
import { FAQSection } from '@/components/blocks/FAQSection'
import { CTASection } from '@/components/blocks/CTASection'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <BuyerSteps />
      <VendorSteps />
      <AIFeatureSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  )
}
