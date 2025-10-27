import { Card } from "@/components/ui/card"
import { Zap, Shield, Puzzle, BarChart3, Globe, Sparkles } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Integration",
    description: "Single API integration gives you access to all AI personas",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with SOC 2, GDPR, HIPAA",
  },
  {
    icon: Puzzle,
    title: "Seamless Workflow",
    description: "Integrates with your existing tools and platforms",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance, usage, and ROI across all AI personas",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Support for 50+ languages with native-level fluency",
  },
  {
    icon: Sparkles,
    title: "Continuous Learning",
    description: "AI models improve over time based on your feedback",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Built for Modern Teams</h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Everything you need to deploy AI assistants at scale
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-border/50 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
