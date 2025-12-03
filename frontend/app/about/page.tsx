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
     
      
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero / Mission */}
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              We're Building the Future of Work
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-300">
              Businesses are drowning in tasks, overwhelmed by hiring, and burned by rising costs.
              Our mission is simple: give every business a high-performing team member without the high-performing price tag.
            </p>
          </div>

          {/* AI With a Human Touch */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">AI With a Human Touch</h2>
            <p className="mb-8 text-center text-lg text-gray-300 max-w-3xl mx-auto">
              Every StaffPilot AI employee is equipped with:
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <Sparkles className="mb-4 h-8 w-8 text-[#2563EB]" />
                  <CardTitle className="text-white">A human-like persona</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Conversational intelligence
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <TrendingUp className="mb-4 h-8 w-8 text-[#A855F7]" />
                  <CardTitle className="text-white">Business workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Professional behaviour
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CheckCircle2 className="mb-4 h-8 w-8 text-[#EC4899]" />
                  <CardTitle className="text-white">24/7 Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    It feels like hiring a real team member — only cheaper, faster, and infinitely scalable.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <Shield className="mb-4 h-8 w-8 text-[#2563EB]" />
                  <CardTitle className="text-white">Cost-Efficient</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Save 80–90% compared to traditional hiring
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

       

         

          {/* CTA: Free Trial + Free Audit */}
          <div className="rounded-2xl glass-card border-white/10 bg-gradient-to-br from-[#2563EB]/10 via-[#A855F7]/10 to-[#EC4899]/10 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-3xl font-bold text-white">Free 7-Day Trial + Free Audit</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-gray-300">
              Experience AI staffing with no risk.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-card border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/contact">Book Free Audit</Link>
            </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
