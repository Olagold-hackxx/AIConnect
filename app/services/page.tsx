import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { CheckCircle2 } from "lucide-react"

export default function ServicesPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Our AI Services"
        description="Specialized AI assistants managed and deployed by our expert team."
      />

      <div className="py-16">
        <AIPersonas3D />

        {/* Service Details */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">What's Included</h2>
            <p className="text-lg text-muted-foreground">
              Every AI assistant comes with comprehensive setup and ongoing management.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Custom Configuration</h3>
              <p className="text-sm text-muted-foreground">
                We tailor each AI assistant to your specific business needs, workflows, and brand voice.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-secondary" />
              <h3 className="mb-2 text-xl font-semibold">Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">
                Our team handles all technical integration with your existing tools and platforms.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">Training & Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Continuous training on your data to improve accuracy and performance over time.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">24/7 Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Round-the-clock monitoring to ensure optimal performance and quick issue resolution.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-secondary" />
              <h3 className="mb-2 text-xl font-semibold">Regular Updates</h3>
              <p className="text-sm text-muted-foreground">
                Automatic updates with the latest AI models and features at no extra cost.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <CheckCircle2 className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">Dedicated Support</h3>
              <p className="text-sm text-muted-foreground">
                Direct access to our AI specialists for questions, adjustments, and strategic guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
