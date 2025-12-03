import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HeadphonesIcon, Sparkles, Target, Users } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <PageLayout>
      <PageHeader
        title="AI Employees Built for Real Businesses"
        description="Each one comes with a human persona, specialised workflows, and industry-trained capabilities. All roles include a free 7-day trial and setup guidance."
      />

      <div className="py-16">
        {/* Personas / Meet Your AI Team */}
        <AIPersonas3D />

        {/* Core Roles */}
        <div className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Choose the AI Role You Need</h2>
            <p className="text-lg text-gray-300">
              Each one comes with a human persona, specialised workflows, and industry-trained capabilities.
              All roles include a free 7-day trial and setup guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
            </div> 
                <CardTitle>AI Digital Marketer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>Handles day-to-day marketing so you can focus on strategy.</p>
                  <ul className="space-y-1 mt-3">
                    <li>• Social media posting</li>
                    <li>• Content creation</li>
                    <li>• Ad ideas &amp; scripts</li>
                    <li>• SEO content</li>
                    <li>• Email marketing</li>
                  </ul>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/pricing">Deploy AI Marketer (7 day Free Trial)</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                  <HeadphonesIcon className="h-6 w-6 text-secondary" />
            </div>
                <CardTitle>AI Customer Support Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>Delivers friendly, human-like support around the clock.</p>
                  <ul className="space-y-1 mt-3">
                    <li>• 24/7 responses</li>
                    <li>• Human-like conversation</li>
                    <li>• Ticket handling</li>
                    <li>• Order updates &amp; customer nurturing</li>
                    <li>• Complaint resolution</li>
                  </ul>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/pricing">Deploy AI Support Agent (Free Trial)</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
            </div>
                <CardTitle>AI Executive Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>Organised, detail-oriented support for your schedule and ops.</p>
                  <ul className="space-y-1 mt-3">
                    <li>• Calendar management</li>
                    <li>• Email drafting</li>
                    <li>• Research &amp; reminders</li>
                    <li>• Document creation</li>
                    <li>• Task management</li>
                  </ul>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/pricing">Deploy AI Executive Assistant (Free Trial)</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Business Development Rep</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>Confident, professional outreach that keeps your pipeline full.</p>
                  <ul className="space-y-1 mt-3">
                    <li>• Lead generation</li>
                    <li>• Personalised outreach</li>
                    <li>• Follow-ups &amp; pipeline management</li>
                    <li>• Sales call prep</li>
                  </ul>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/pricing">Deploy AI Business Development Rep (Free Trial)</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
            </div>

        {/* Custom AI & Free Audit */}
        <div className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
            </div>
                <CardTitle>Custom AI Employees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>
                    Have a unique need? We'll build a custom AI worker trained specifically for your workflow.
                  </p>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/contact">Build a Custom AI Employee</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
                <CardTitle>Free Business Efficiency Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
                <div className="flex-1">
                  <p>
                    Not sure which AI employee you need? Get a free business audit to identify your best role, biggest savings, and highest-impact workflows.
                  </p>
                  <ul className="space-y-1 mt-3">
                    <li>✓ Efficiency score</li>
                    <li>✓ Savings estimate</li>
                    <li>✓ Role recommendation</li>
                    <li>✓ Workflow suggestions</li>
                  </ul>
                </div>
                <Button className="mt-auto w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                  <Link href="/contact">Book Free Audit</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
