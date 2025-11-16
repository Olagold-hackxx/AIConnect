import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { 
  User, 
  Settings, 
  Zap, 
  Brain, 
  Monitor, 
  RefreshCw, 
  HeadphonesIcon,
  CheckCircle2
} from "lucide-react"

export default function ServicesPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Our Human-Enabled AI Automation Services"
        description="AI agents powered by human support - specialized AI assistants managed and deployed by our expert human managers."
      />

      <div className="py-16">
        <AIPersonas3D />

        {/* Service Details */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">What's Included with Human-Enabled AI Automation</h2>
            <p className="text-lg text-muted-foreground">
              Every AI assistant comes with comprehensive setup, ongoing management, and dedicated human support. 
              Our AI agents powered by human expertise ensure your tasks are executed effectively.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Account Manager - Centered in last row */}
            <div className="rounded-xl border border-border/40 bg-card p-6 ">
              <User className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Dedicated Human Manager</h3>
              <p className="text-sm text-muted-foreground">
                Your dedicated human manager ensures your AI assistants execute tasks effectively. They handle everything from 
                initial consultation to ongoing management, optimization, and strategic guidance. This human-enabled approach 
                guarantees quality and alignment with your business goals.
              </p>
            </div> 
            <div className="rounded-xl border border-border/40 bg-card p-6">
              <Settings className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Custom Configuration</h3>
              <p className="text-sm text-muted-foreground">
                We tailor each AI assistant to your specific business needs, workflows, and brand voice.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <Zap className="mb-4 h-8 w-8 text-secondary" />
              <h3 className="mb-2 text-xl font-semibold">Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">
                Our team handles all technical integration with your existing tools and platforms.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <Brain className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">Training & Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Continuous training on your data to improve accuracy and performance over time.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <Monitor className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">24/7 Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Round-the-clock monitoring to ensure optimal performance and quick issue resolution.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <RefreshCw className="mb-4 h-8 w-8 text-secondary" />
              <h3 className="mb-2 text-xl font-semibold">Regular Updates</h3>
              <p className="text-sm text-muted-foreground">
                Automatic updates with the latest AI models and features at no extra cost.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6 md:col-start-1 md:col-end-3 lg:col-start-2 lg:col-end-3">
              <HeadphonesIcon className="mb-4 h-8 w-8 text-accent" />
              <h3 className="mb-2 text-xl font-semibold">Human-Enabled Support</h3>
              <p className="text-sm text-muted-foreground">
                Direct access to our AI automation specialists and human managers for questions, adjustments, and strategic 
                guidance. Our human-enabled AI assistants come with expert human support to ensure optimal performance.
              </p>
            </div>

          
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
