import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "Blog - Human-Enabled AI Automation, AI Agents, and Business AI Insights | CODIAN",
  description: "Explore articles about human-enabled AI assistants, AI automation, AI agents powered by human support, AI personas, business automation, and more. Learn how to leverage AI automation with human expertise.",
  keywords: "human-enabled AI assistant, AI agent powered by human, AI automation, AI personas, human-enabled AI automation, AI automation blog, business AI automation, AI assistants with human support, AI automation services, AI automation strategy",
}

const blogPosts = [
  {
    id: 1,
    title: "Why Human-Enabled AI Automation Outperforms Pure AI Solutions",
    excerpt: "Discover how AI agents powered by human expertise deliver better results than pure AI automation. Learn why businesses choose human-enabled AI assistants for critical operations.",
    date: "2024-01-15",
    readTime: "5 min read",
    slug: "why-human-enabled-ai-automation",
    keywords: "human-enabled AI automation, AI agent powered by human, AI automation benefits",
  },
  {
    id: 2,
    title: "The Future of Business: AI Personas with Dedicated Human Managers",
    excerpt: "Explore how combining AI personas with dedicated human managers creates a powerful business automation solution. Learn how human-enabled AI assistants transform operations.",
    date: "2024-01-10",
    readTime: "7 min read",
    slug: "ai-personas-human-managers",
    keywords: "AI personas, dedicated human manager, human-enabled AI assistant",
  },
  {
    id: 3,
    title: "Complete Guide to AI Automation: From Setup to Optimization",
    excerpt: "A comprehensive guide to implementing AI automation in your business. Learn about AI automation services, best practices, and how human-enabled AI can accelerate your results.",
    date: "2024-01-05",
    readTime: "10 min read",
    slug: "complete-guide-ai-automation",
    keywords: "AI automation, AI automation services, business AI automation",
  },
  {
    id: 4,
    title: "AI Agents Powered by Human: The Hybrid Approach to Business Automation",
    excerpt: "Understanding the benefits of AI agents powered by human support. See how this human-enabled approach combines efficiency with quality assurance and strategic insight.",
    date: "2024-01-01",
    readTime: "6 min read",
    slug: "ai-agents-powered-by-human",
    keywords: "AI agent powered by human, human-enabled AI automation, AI assistants with human support",
  },
  {
    id: 5,
    title: "How Dedicated Human Managers Make AI Automation More Effective",
    excerpt: "Learn why dedicated human managers are essential for successful AI automation. Discover how human-enabled AI assistants benefit from expert oversight and strategic guidance.",
    date: "2023-12-28",
    readTime: "8 min read",
    slug: "dedicated-human-managers-ai-automation",
    keywords: "dedicated human manager, human-enabled AI automation, AI automation effectiveness",
  },
  {
    id: 6,
    title: "Scaling Your Business with AI Automation and Human Support",
    excerpt: "Discover strategies for scaling operations using AI automation services backed by human expertise. Learn how AI personas and human managers work together for growth.",
    date: "2023-12-25",
    readTime: "9 min read",
    slug: "scaling-business-ai-automation",
    keywords: "AI automation, business scaling, AI personas, human-enabled AI",
  },
]

export default function BlogPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Blog"
        description="Insights on Human-Enabled AI Automation, AI Agents, and Business AI"
      />
      
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* SEO Content Section */}
          <div className="mb-16 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">
              Human-Enabled AI Automation: Your Guide to AI Agents Powered by Human Support
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Welcome to the CODIAN blog, your resource for insights on human-enabled AI automation, AI agents powered 
                by human expertise, and AI automation strategies. We explore how combining AI personas with dedicated human 
                managers creates powerful business automation solutions that deliver real results.
              </p>
              <p className="text-lg leading-relaxed">
                Our articles cover topics including human-enabled AI assistants, AI automation services, AI automation 
                best practices, and how businesses leverage AI automation effectively. Whether you're exploring AI automation 
                for the first time or looking to optimize your existing AI assistants, you'll find valuable insights here.
              </p>
              <p className="text-lg leading-relaxed">
                Learn how AI agents powered by human support outperform pure AI automation, why dedicated human managers are 
                essential for AI automation success, and discover strategies for implementing human-enabled AI automation 
                in your business. Explore the intersection of AI automation technology and human expertise.
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
                        <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
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
                  <CardTitle className="text-lg">Human-Enabled AI Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Learn how human-enabled AI automation combines AI technology with human expertise for better results. 
                    Discover why AI agents powered by human support outperform pure automation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Agents Powered by Human</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Explore the benefits of AI agents powered by human expertise. See how dedicated human managers 
                    enhance AI automation effectiveness and deliver business value.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Personas & Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Discover how AI personas work alongside human support to automate business processes. Learn about 
                    AI automation services and implementation strategies.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dedicated Human Managers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Understand the role of dedicated human managers in AI automation. Learn how human-enabled AI assistants 
                    benefit from expert oversight and strategic guidance.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to Implement Human-Enabled AI Automation?</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience the power of AI agents powered by human support. Get started with CODIAN's human-enabled 
              AI assistants today and transform your business operations.
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
