"use client"

import Link from "next/link"

const personas = [
  {
    role: "Digital Marketer",
    name: "Rita",
    description: "Social media management, campaign strategy, ad creation, and performance reporting",
    image:  "/ai-assistant-digital-marketer.jpg",
    bgGradient: "from-orange-400 via-yellow-400 to-orange-500",
    textColor: "text-orange-900",
  },
  {
    role: "Executive Assistant",
    name: "Jane",
    description: "Scheduling, task management, communication, document prep, and research",
    image: "/ai-assistant-executive.jpg",
    bgGradient: "from-orange-400 via-pink-400 to-orange-500",
    textColor: "text-orange-900",
  },
  {
    role: "Customer Support",
    name: "David",
    description: "Client inquiries, live chat, ticket management, and support automation",
    image: "/ai-assistant-customer-support.jpg",
    bgGradient: "from-pink-500 via-fuchsia-500 to-pink-600",
    textColor: "text-pink-900",
  },
]

export function AIPersonas3D() {
  return (
    <section id="personas" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              AI Team
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Three specialized AI assistants, fully managed by CODIAN and tailored to your business needs
          </p>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
          {personas.map((persona, index) => (
            <Link
              key={persona.name}
              href="/services"
              className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Image Container with Gradient Background */}
              <div className={`relative h-80 overflow-hidden bg-gradient-to-br ${persona.bgGradient}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />

                {/* Animated Image */}
                <img
                  src={persona.image || "/placeholder.svg"}
                  alt={persona.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                />

                {/* Floating Icons Animation */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-4 top-4 h-8 w-8 animate-float-slow rounded-full bg-white/30 blur-sm" />
                  <div className="absolute right-8 top-12 h-6 w-6 animate-float-slower rounded-full bg-white/30 blur-sm" />
                  <div className="absolute bottom-8 left-12 h-10 w-10 animate-float rounded-full bg-white/30 blur-sm" />
                </div>

                {/* Role Badge */}
                <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 shadow-lg">
                  <p className={`text-sm font-bold ${persona.textColor}`}>{persona.name}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-3 text-2xl font-bold">{persona.role}</h3>
                <p className="text-pretty text-muted-foreground">{persona.description}</p>

                {/* Hover Indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Learn more</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(10px);
          }
        }

        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
