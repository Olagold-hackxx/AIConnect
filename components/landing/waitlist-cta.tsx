"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function WaitlistCTA() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle waitlist submission
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail("")
    }, 3000)
  }

  return (
    <section id="waitlist" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Join the Waitlist</h2>
            <p className="mb-8 text-pretty text-lg text-muted-foreground">
              Be among the first to experience the future of AI-powered business automation. Limited spots available for
              early access.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="lg" className="ai-gradient group">
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Thanks! You're on the list.</span>
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>

          {/* Decorative gradient blobs */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
