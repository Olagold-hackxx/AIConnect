"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-bold">StaffPilot</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden items-center gap-8 md:flex flex-1 justify-center">
            <Link
              href="/services"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>

          {/* Buttons - Right */}
          <div className="hidden items-center gap-4 md:flex flex-shrink-0 ml-auto">
            <Button size="sm" variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/services"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
              </Button>
              <Button size="sm" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue" asChild>
                <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
