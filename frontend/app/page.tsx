"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

// Lazy load heavy components
const Hero3D = dynamic(() => import("@/components/landing/hero-3d").then(mod => ({ default: mod.Hero3D })), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>
})

const AboutSection = dynamic(() => import("@/components/landing/about-section").then(mod => ({ default: mod.AboutSection })), {
  loading: () => <div className="h-96" />
})

const AIPersonas3D = dynamic(() => import("@/components/landing/ai-personas-3d").then(mod => ({ default: mod.AIPersonas3D })), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading 3D models...</div></div>
})

const AgentCTA = dynamic(() => import("@/components/landing/agent-cta").then(mod => ({ default: mod.AgentCTA })), {
  loading: () => <div className="h-64" />
})

const ChatbotWidget = dynamic(() => import("@/components/landing/chatbot-widget").then(mod => ({ default: mod.ChatbotWidget })), {
  ssr: false
})

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={<div className="h-screen" />}>
        <Hero3D />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <AIPersonas3D />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <AgentCTA />
      </Suspense>
      <Footer />
      <ChatbotWidget />
    </main>
  )
}
