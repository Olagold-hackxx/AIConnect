import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { CheckCircle2, Clock, Users, BarChart3, Settings, HeadphonesIcon } from "lucide-react"

export default function AccountManagementPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Account Management"
        description="Comprehensive AI management so you can focus on your business."
      />

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Overview */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">We Handle Everything</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Our dedicated account managers take care of all aspects of your AI deployment, from initial setup to
              ongoing optimization and support.
            </p>
          </div>

          {/* Services Grid */}
          <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Setup & Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Complete AI assistant setup tailored to your business processes, brand voice, and specific requirements.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Team Training</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive training sessions for your team to maximize the value of your AI assistants.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Performance Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring and optimization to ensure peak performance and ROI.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Regular Updates</h3>
              <p className="text-sm text-muted-foreground">
                Proactive updates and improvements based on the latest AI advancements and your feedback.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <HeadphonesIcon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Round-the-clock technical support and strategic guidance from our AI specialists.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quality Assurance</h3>
              <p className="text-sm text-muted-foreground">
                Regular quality checks and refinements to maintain high accuracy and user satisfaction.
              </p>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="mb-20">
            <h2 className="mb-12 text-center text-3xl font-bold">Our Process</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Discovery Call</h3>
                  <p className="text-muted-foreground">
                    We learn about your business, challenges, and goals to design the perfect AI solution.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground">
                  2
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Custom Setup</h3>
                  <p className="text-muted-foreground">
                    Our team configures and integrates your AI assistants with your existing systems.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                  3
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Training & Launch</h3>
                  <p className="text-muted-foreground">
                    We train your team and launch your AI assistants with full support.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  4
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">Ongoing Optimization</h3>
                  <p className="text-muted-foreground">
                    Continuous monitoring, updates, and improvements to maximize your ROI.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Let our team handle your AI deployment from start to finish.
            </p>
            <button className="rounded-lg bg-gradient-to-r from-primary via-accent to-secondary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
