"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"
import { useChatbot } from "@/components/chatbot-context"

export function AgentCTA() {
  const { openChatbot } = useChatbot()

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Ready to Get Started?</h2>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                Talk to one of our AI specialists to learn how CODIAN can transform your business operations. We'll
                handle everything from setup to ongoing management.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="ai-gradient group" onClick={openChatbot}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with an Agent
                </Button>
                <Button size="lg" variant="outline" className="backdrop-blur-sm bg-transparent">
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule a Call
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Available Monday-Friday, 9am-6pm EST. Average response time: under 2 hours.
              </p>
            </div>

            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-secondary">
                      <span className="text-4xl">👨‍💼</span>
                    </div>
                    <p className="text-lg font-semibold">Your Dedicated Account Manager</p>
                    <p className="mt-2 text-sm text-muted-foreground">Expert support every step of the way</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative gradient blobs */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
