import dynamic from "next/dynamic"


import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { WaitlistCTA } from "@/components/landing/waitlist-cta"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import Hero3D from "@/components/landing/hero-3d-lazy";
import { ChatbotWidget } from "@/components/landing/chatbot-widget"


export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero3D />
      <AIPersonas3D />
      <FeaturesGrid />
      <WaitlistCTA />
      <Footer />
      <ChatbotWidget />
    </main>
  )
}
