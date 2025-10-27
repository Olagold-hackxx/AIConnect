"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary">
              <span className="text-lg font-bold text-primary-foreground">AI</span>
            </div>
            <span className="text-xl font-bold">AIConnect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#personas"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              AI Personas
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#waitlist"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Join Waitlist
            </a>
            <Button size="sm" className="ai-gradient">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden" aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-border/40 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#personas"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                AI Personas
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#waitlist"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Join Waitlist
              </a>
              <Button size="sm" className="ai-gradient">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
