"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"
import { useChatbot } from "@/components/chatbot-context"
import { useEffect, useState } from "react"

// Professional account manager images - predominantly Black with diverse representation
const accountManagers = [
  {
    id: 1,
    name: "Marcus Johnson",
    role: "Lead Account Manager",
    image: "/account-manager-marcus.jpg",
    specialty: "Enterprise Solutions",
  },
  {
    id: 2,
    name: "Amara Williams",
    role: "Senior Account Manager",
    image: "/account-manager-amara.jpg",
    specialty: "Customer Success",
  },
  {
    id: 3,
    name: "Jabari Mitchell",
    role: "Account Manager",
    image: "/account-manager-jabari.jpg",
    specialty: "Technical Implementation",
  },
  {
    id: 4,
    name: "Keisha Anderson",
    role: "Senior Account Manager",
    image: "/account-manager-keisha.jpg",
    specialty: "Enterprise Solutions",
  },
  {
    id: 5,
    name: "David Okafor",
    role: "Lead Account Manager",
    image: "/account-manager-david.jpg",
    specialty: "Strategic Planning",
  },
  {
    id: 6,
    name: "Sarah Chen",
    role: "Account Manager",
    image: "/account-manager-sarah.jpg",
    specialty: "Startup Growth",
  },
  {
    id: 7,
    name: "Michael Thompson",
    role: "Account Manager",
    image: "/account-manager-michael.jpg",
    specialty: "Customer Success",
  },
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
    <div className="relative w-full h-80 overflow-hidden rounded-2xl bg-muted">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {accountManagers.map((manager) => (
          <div key={manager.id} className="w-full flex-shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <img
              src={manager.image}
              alt={manager.name}
              className="w-full h-full object-contain object-center"
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
        {accountManagers.map((manager, idx) => (
          <button
            key={manager.id}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(idx)}
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
