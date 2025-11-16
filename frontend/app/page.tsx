import { Hero3D } from "@/components/landing/hero-3d"
import { AboutSection } from "@/components/landing/about-section"
import { AIPersonas3D } from "@/components/landing/ai-personas-3d"
import { AgentCTA } from "@/components/landing/agent-cta"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import { ChatbotWidget } from "@/components/landing/chatbot-widget"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero3D />
      <AboutSection />
      <AIPersonas3D />
      <AgentCTA />
      <Footer />
      <ChatbotWidget />
    </main>
  )
}
