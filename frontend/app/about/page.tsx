import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Users, Zap, Shield, TrendingUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "About CODIAN - Human-Enabled AI Automation & AI Agents Powered by Human Support",
  description: "Learn about CODIAN's human-enabled AI assistants, AI automation services, and dedicated human managers. Discover how our AI agents powered by human expertise transform business operations with AI personas and human support.",
  keywords: "human-enabled AI assistant, AI agent powered by human, AI automation, AI personas, human-enabled AI automation, dedicated human manager, AI assistants with human support, business AI automation, AI automation services",
}

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHeader
        title="About CODIAN"
        description="Human-Enabled AI Automation for Modern Businesses"
      />
      
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Human-Enabled AI Automation That{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Delivers Real Results
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              CODIAN combines the power of AI automation with experienced human support to create AI agents powered by human expertise. 
              Our human-enabled AI assistants ensure your tasks are executed effectively, delivering measurable business outcomes through 
              our unique approach of AI personas working alongside dedicated human managers.
            </p>
          </div>

          {/* What Makes Us Different */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold">
              What Makes Our Human-Enabled AI Different
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dedicated Human Managers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every client gets a dedicated human manager who ensures your AI assistants execute tasks effectively. 
                    Our human-enabled approach means real people oversee and optimize your AI automation, providing expert 
                    guidance and support throughout your journey.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
                    <Brain className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>AI Agents Powered by Human</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI automation platform combines intelligent AI personas with human oversight. This human-enabled 
                    AI assistant model ensures accuracy, quality, and strategic alignment — something pure AI automation 
                    cannot deliver alone.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5">
                    <Zap className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Complete AI Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We handle everything — setup, integration, deployment, and ongoing management. Our AI automation 
                    services include all three AI assistants with guaranteed uptime, so you can focus on growth while 
                    we manage your AI infrastructure.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-16 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 sm:p-12">
            <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                CODIAN was founded on a simple belief: AI automation works best when combined with human expertise. 
                While AI technology has advanced tremendously, businesses need more than automated systems — they need 
                AI agents powered by human insight and strategic thinking.
              </p>
              <p className="text-lg leading-relaxed">
                We recognized that pure AI automation, while powerful, often falls short when it comes to understanding 
                context, handling edge cases, and adapting to unique business needs. That's why we created a human-enabled 
                AI automation platform that pairs intelligent AI personas with dedicated human managers.
              </p>
              <p className="text-lg leading-relaxed">
                Today, CODIAN helps businesses leverage AI automation effectively through our unique human-enabled approach. 
                Our AI assistants don't just execute tasks — they're guided by experienced human managers who ensure quality, 
                strategic alignment, and real business results. This combination of AI automation and human support sets us 
                apart in the market.
              </p>
            </div>
          </div>

          {/* Our Approach */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold">
              The CODIAN Approach: Human-Enabled AI Automation
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">AI Automation + Human Expertise</h3>
                <p className="text-muted-foreground">
                  Our human-enabled AI assistants combine the efficiency of AI automation with the strategic thinking of 
                  human managers. This AI agent powered by human model ensures your tasks are executed effectively, with 
                  quality assurance and business alignment built-in.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">AI personas handle repetitive tasks efficiently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">Human managers oversee quality and strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">Continuous optimization based on real business needs</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Guaranteed Results</h3>
                <p className="text-muted-foreground">
                  Our human-enabled AI automation comes with guaranteed uptime and dedicated support. Every client receives 
                  expert human guidance to ensure their AI assistants deliver measurable business value.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-muted-foreground">All 3 AI assistants included with uptime guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-muted-foreground">Dedicated human manager available (Enterprise plan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-muted-foreground">Option to hire your dedicated manager</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Shield className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Reliability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We guarantee uptime and consistent performance. Our human-enabled AI automation is built for 
                    reliability, with human oversight ensuring nothing falls through the cracks.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="mb-4 h-8 w-8 text-accent" />
                  <CardTitle>Business Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI agents powered by human support focus on delivering real business value. We measure 
                    success by your outcomes, not just technical metrics.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="mb-4 h-8 w-8 text-secondary" />
                  <CardTitle>Human Partnership</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We believe in the power of human-enabled AI. Our dedicated managers work as your partners, 
                    ensuring your AI automation aligns with your business goals and executes effectively.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Experience Human-Enabled AI Automation?</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
              Join businesses that trust CODIAN's AI agents powered by human support. Get started with our 
              human-enabled AI assistants today.
            </p>
            <Button size="lg" className="ai-gradient" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
