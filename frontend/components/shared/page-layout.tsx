import type React from "react"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"
import { ChatbotWidget } from "@/components/landing/chatbot-widget"

type PageLayoutProps = {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  )
}
