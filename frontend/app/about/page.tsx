import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Globe2, HeartHandshake, Shield, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "About StaffPilot — The AI Employee Company",
  description:
    "StaffPilot is building the future of work by giving every business a high-performing AI employee with a human persona. Learn how our AI employees save time, cut costs, and scale your operations.",
  keywords:
    "StaffPilot, AI employee, AI staffing, AI assistant, AI executive assistant, AI support agent, AI marketer, AI employees for business",
}

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHeader
        title="We’re Building the Future of Work"
        description="Businesses are drowning in tasks and burned by rising costs. StaffPilot gives you a high-performing team member without the high-performing price tag."
      />

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero / Mission */}
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI Employees With a{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Human Touch
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              StaffPilot was built for founders and teams who want the output of a full-time hire — without the payroll,
              overhead, or hiring headaches. Our mission is simple: put a reliable, high-performing AI employee inside
              every business on earth.
            </p>
          </div>

          {/* AI With a Human Touch */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold">AI With a Human Touch</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Sparkles className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Human-Like Personas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every StaffPilot AI employee comes with a human-like persona, conversational intelligence, and
                    professional behaviour. It feels like hiring a real team member — just faster, cheaper, and always
                    on.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="mb-4 h-8 w-8 text-accent" />
                  <CardTitle>Built for Real Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    From marketing and support to research and operations, our AI employees are trained on real business
                    workflows so they can start delivering value in days, not months.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle2 className="mb-4 h-8 w-8 text-secondary" />
                  <CardTitle>Consistent &amp; Scalable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    No sick days. No burnout. No turnover. Your AI employee works 24/7, stays on-brand, and scales with
                    your workload automatically.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-4 h-8 w-8 text-primary" />
                  <CardTitle>Cost-Efficient by Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    StaffPilot is designed to cost 80–90% less than hiring humans for the same work — without
                    compromising on quality, professionalism, or responsiveness.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Built for Western Businesses. Powered Offshore. */}
          <div className="mb-16 grid gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Built for Western Businesses. Powered Offshore.</h2>
              <p className="text-muted-foreground">
                StaffPilot is engineered for Western businesses that demand clear communication, professional standards,
                and reliable delivery — while leveraging global infrastructure for maximum value.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Globe2 className="mt-0.5 h-5 w-5 text-primary" />
                  <span>Exceptional quality and clear, business-ready communication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe2 className="mt-0.5 h-5 w-5 text-primary" />
                  <span>Competitive pricing powered by offshore optimisation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe2 className="mt-0.5 h-5 w-5 text-primary" />
                  <span>High-touch service with fast turnaround times.</span>
                </li>
              </ul>
            </div>

            <Card className="h-full">
              <CardHeader>
                <HeartHandshake className="mb-4 h-8 w-8 text-accent" />
                <CardTitle>The Biggest Hiring Arbitrage Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hiring a marketer, support rep, or assistant now costs thousands per month — before benefits, tools,
                  and training. StaffPilot lets you deploy AI employees that handle the same work for a fraction of the
                  price, with a setup measured in days, not months.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Proof & Success Stories */}
          <div className="mb-16">
            <h2 className="mb-6 text-center text-3xl font-bold">Proof &amp; Success Stories</h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              (*Placeholder — add real results when ready*)
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  “StaffPilot saved us over 40 hours per month instantly.”
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  “Our lead gen doubled in 30 days.”
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  “Support became 24/7 overnight without hiring.”
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA: Free Trial + Free Audit */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">Free 7-Day Trial + Free Audit</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience AI staffing with no risk. See exactly how much time and money an AI employee can save your
              business before you commit.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="ai-gradient" asChild>
                <Link href="/pricing">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Book Free Audit</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
