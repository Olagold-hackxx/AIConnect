"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"
import { useChatbot } from "@/components/chatbot-context"
import { useEffect, useState } from "react"

// Professional account manager images
const accountManagers = [
 
  {
    id: 1,
    name: "Marcus Johnson",
    role: "Lead Account Manager", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    specialty: "Enterprise Solutions"
  },
  {
    id: 2,
    name: "Emily Rodriguez",
    role: "Account Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    specialty: "Startup Growth"
  },
  {
    id: 3,
    name: "David Kim",
    role: "Senior Account Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    specialty: "Technical Implementation"
  },
  {
    id: 4,
    name: "Lisa Thompson",
    role: "Account Manager",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    specialty: "Customer Success"
  },
  {
    id: 5,
    name: "James Wilson",
    role: "Lead Account Manager",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    specialty: "Strategic Planning"
  }
]

function AccountManagerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % accountManagers.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {accountManagers.map((manager) => (
          <div key={manager.id} className="w-full flex-shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <img
              src={manager.image}
              alt={manager.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-xl font-semibold text-white">{manager.name}</h3>
              <p className="text-sm text-white/80">{manager.role}</p>
              <p className="text-xs text-white/60 mt-1">{manager.specialty}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {accountManagers.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

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
              <AccountManagerCarousel />
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Your Dedicated Account Managers</p>
                <p className="mt-2 text-sm text-muted-foreground">Expert support every step of the way</p>
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
