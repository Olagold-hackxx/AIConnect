import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Let’s Build Your AI-Powered Team"
        description="Want to scale faster, reduce costs, and free up your time? Fill out the form — we’ll respond within minutes."
      />

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Tell Us About Your Business</h2>
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-medium">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    What would you like your AI employee to handle?
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Share your goals, current bottlenecks, and ideal AI role..."
                  />
                </div>

                <Button className="w-full ai-gradient">Submit &amp; Get Recommendations</Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Ways to Get Started</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">hello@staffpilot.ai</p>
                    <p className="text-sm text-muted-foreground">support@staffpilot.ai</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon–Fri, 9am–6pm PST</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Office</h3>
                    <p className="text-sm text-muted-foreground">123 AI Street</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the chat widget in the bottom right corner for instant support.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="mt-12 space-y-4 rounded-xl border border-border/40 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8">
                <h3 className="mb-2 text-xl font-bold">Next Steps</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Choose how you’d like to move forward with your first AI employee.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/schedule-consultation">Book a Free Strategy Call</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/contact">Get a Free AI Employee Demo</Link>
                  </Button>
                  <Button className="w-full ai-gradient" asChild>
                    <Link href="/pricing">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
