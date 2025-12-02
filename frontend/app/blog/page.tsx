import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "StaffPilot Blog — Scale Smarter With AI Employees",
  description:
    "Guides, strategies, and insights on using AI employees to grow your business. Learn how to cut costs, scale operations, and build an AI-powered team with StaffPilot.",
  keywords:
    "StaffPilot blog, AI employees, AI staffing, AI assistants, AI for business, AI lead generation, AI customer support, future of work",
}

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Tasks Every Business Should Automate in 2025",
    excerpt:
      "From support to marketing, discover the high-leverage tasks your AI employee should be handling for you this year.",
    date: "2025-01-05",
    readTime: "8 min read",
    slug: "top-10-tasks-to-automate-2025",
    keywords: "AI automation, AI employees, business automation",
  },
  {
    id: 2,
    title: "How AI Employees Cut Costs by 90%",
    excerpt:
      "See the real math behind replacing or augmenting traditional roles with AI employees — and where the biggest savings come from.",
    date: "2024-12-15",
    readTime: "7 min read",
    slug: "how-ai-employees-cut-costs",
    keywords: "AI cost savings, AI vs payroll, StaffPilot pricing",
  },
  {
    id: 3,
    title: "The Future of Work: Why AI Staff Will Replace Remote Assistants",
    excerpt:
      "Remote assistants changed how we work. AI employees are the next leap — always-on, infinitely scalable, and far more affordable.",
    date: "2024-11-20",
    readTime: "9 min read",
    slug: "future-of-work-ai-staff",
    keywords: "future of work, AI staff, remote assistants",
  },
  {
    id: 4,
    title: "AI vs Human Assistants: The Real Cost Comparison",
    excerpt:
      "A side-by-side breakdown of salary, benefits, ramp time, and output between traditional assistants and AI employees.",
    date: "2024-10-01",
    readTime: "6 min read",
    slug: "ai-vs-human-assistants",
    keywords: "AI vs human, assistant comparison, AI ROI",
  },
  {
    id: 5,
    title: "How to Use AI to Generate Leads on Autopilot",
    excerpt:
      "Turn your AI employee into a 24/7 outbound engine that finds, warms, and nurtures leads while you sleep.",
    date: "2024-09-10",
    readTime: "8 min read",
    slug: "ai-lead-generation-autopilot",
    keywords: "AI lead generation, sales automation, BD AI",
  },
  {
    id: 6,
    title: "The Ultimate Guide to Hiring an AI Employee",
    excerpt:
      "Everything you need to know before deploying your first AI employee — from role selection to onboarding and KPIs.",
    date: "2024-08-01",
    readTime: "12 min read",
    slug: "ultimate-guide-hiring-ai-employee",
    keywords: "hire AI employee, StaffPilot guide, AI onboarding",
  },
]

export default function BlogPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Scale Smarter With AI"
        description="Guides, strategies, and insights on using AI employees to grow your business."
      />

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* SEO Content Section */}
          <div className="mb-16 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">StaffPilot Insights: Building Your AI-Powered Team</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Welcome to the StaffPilot blog — your hub for learning how AI employees can take over marketing,
                support, operations, and more so you can focus on growth.
              </p>
              <p className="text-lg leading-relaxed">
                Here, we break down real-world use cases, cost comparisons, and playbooks for deploying AI employees
                inside modern businesses. Whether you’re hiring your first AI employee or scaling a fully AI-supported
                team, you’ll find practical guidance you can apply today.
              </p>
              <p className="text-lg leading-relaxed">
                Explore topics like automating repetitive tasks, building always-on lead generation, turning support
                into a 24/7 function, and designing workflows that combine AI precision with human judgment.
              </p>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="mb-12">
            <h2 className="mb-8 text-3xl font-bold">Latest Articles</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.id} className="flex flex-col transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <CardDescription className="mb-4 flex-1">{post.excerpt}</CardDescription>
                    <Button variant="outline" className="group" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SEO Topics Section */}
          <div className="mb-16">
            <h2 className="mb-8 text-3xl font-bold">Topics We Cover</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Employees &amp; Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Learn how to delegate marketing, support, and operations to AI employees so your team can focus on
                    high-leverage work.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost &amp; ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Deep dives into how AI employees cut costs by up to 90% compared to traditional hires — with real
                    numbers and scenarios.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Gen &amp; Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Playbooks for turning AI into a 24/7 outbound engine that books calls, warms leads, and supports
                    your sales team.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Future of Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Perspectives on how AI staff will reshape hiring, remote work, and what “team” means in the next
                    decade.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Hire Your First AI Employee?</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
              Try a live demo, see your AI employee in action, and start a free 7-day trial to experience the impact on
              your business.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="ai-gradient" asChild>
                <Link href="/contact">Get Your Free AI Employee Demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Start Free 7-Day Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
