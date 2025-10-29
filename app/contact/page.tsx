import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"

export default function ContactPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Get in Touch"
        description="Have questions? Our team is here to help you get started with AI."
      />

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
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
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell us about your AI needs..."
                  />
                </div>

                <Button className="w-full ai-gradient">Send Message</Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">hello@codian.ai</p>
                    <p className="text-sm text-muted-foreground">support@codian.ai</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm PST</p>
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
              <div className="mt-12 rounded-xl border border-border/40 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8">
                <h3 className="mb-2 text-xl font-bold">Ready to get started?</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Schedule a free consultation to discuss your AI needs and see how CODIAN can help.
                </p>
                <Button className="w-full ai-gradient">Schedule Consultation</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
