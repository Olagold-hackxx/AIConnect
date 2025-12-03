"use client"

import dynamic from "next/dynamic"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import { Hero3D } from "@/components/landing/hero-3d"
import { AboutSection } from "@/components/landing/about-section"
import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { AgentCTA } from "@/components/landing/agent-cta"
import { WhyBusinessesLove } from "@/components/landing/why-businesses-love"
import { PlansSection } from "@/components/landing/plans-section"
import { ValueSection } from "@/components/landing/value-section"
import { FAQSection } from "@/components/landing/faq-section"

const ChatbotWidget = dynamic(() => import("@/components/landing/chatbot-widget").then(mod => ({ default: mod.ChatbotWidget })), {
  ssr: false
})

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#101010' }}>
      <Navigation />
      <Hero3D />
      <AboutSection />
      <AIPersonas3D />
      <WhyBusinessesLove />
      <PlansSection />
      <ValueSection />
      <AgentCTA />
      <FAQSection />
      <Footer />
      <ChatbotWidget />
    </main>
  )
}
