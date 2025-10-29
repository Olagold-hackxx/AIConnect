import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { PricingSection } from "@/components/landing/pricing-section"

export default function PricingPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Simple, Transparent Pricing"
        description="Choose the plan that fits your business needs. All plans include expert AI setup and ongoing support."
      />
      <div className="py-16">
        <PricingSection />
      </div>
    </PageLayout>
  )
}
