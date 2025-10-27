"use client"
import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Text3D, Center } from "@react-three/drei"
import { PersonaCard } from "@/components/landing/persona-card"

const personas = [
  {
    name: "Legal Assistant",
    description: "Contract analysis, compliance checks, legal research",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-100 dark:bg-pink-950",
    icon: "⚖️",
  },
  {
    name: "Community Manager",
    description: "Social engagement, content moderation, community insights",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-100 dark:bg-green-950",
    icon: "👥",
  },
  {
    name: "Executive Assistant",
    description: "Calendar management, email triage, meeting prep",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    icon: "💼",
  },
  {
    name: "Receptionist",
    description: "Call routing, appointment scheduling, visitor management",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    icon: "📞",
  },
  {
    name: "SEO Blog Writer",
    description: "Content creation, keyword optimization, SEO strategy",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-100 dark:bg-purple-950",
    icon: "✍️",
  },
  {
    name: "Lead Generator",
    description: "Prospect research, outreach campaigns, lead qualification",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-100 dark:bg-red-950",
    icon: "🎯",
  },
]

function FloatingText3D({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Center position={position}>
        <Text3D font="/fonts/Inter_Regular.json" size={0.3} height={0.1} curveSegments={12}>
          {text}
          <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
        </Text3D>
      </Center>
    </Float>
  )
}

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
            Specialized AI personas trained for specific roles, ready to integrate into your workflow
          </p>
        </div>

        {/* 3D Scene */}
        <div className="mb-16 h-[400px] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />

              <FloatingText3D text="AI" position={[-2, 1, 0]} />
              <FloatingText3D text="TEAM" position={[2, -1, 0]} />

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
            </Suspense>
          </Canvas>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <PersonaCard key={persona.name} {...persona} />
          ))}
        </div>
      </div>
    </section>
  )
}
