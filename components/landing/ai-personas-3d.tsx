"use client"
import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float, Text3D, Center } from "@react-three/drei"
import { PersonaCard } from "@/components/landing/persona-card"
import * as THREE from "three"

const personas = [
  {
    name: "Legal Assistant",
    description: "Contract analysis, compliance checks, legal research",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-100 dark:bg-pink-950",
    icon: "⚖️",
    position: [-4, 2, 0],
    color3d: "#ec4899",
    text: "LEGAL",
  },
  {
    name: "Community Manager",
    description: "Social engagement, content moderation, community insights",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-100 dark:bg-green-950",
    icon: "👥",
    position: [-2, 3, 0],
    color3d: "#10b981",
    text: "COMMUNITY",
  },
  {
    name: "Executive Assistant",
    description: "Calendar management, email triage, meeting prep",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    icon: "💼",
    position: [2, 3, 0],
    color3d: "#f59e0b",
    text: "EXECUTIVE",
  },
  {
    name: "Receptionist",
    description: "Call routing, appointment scheduling, visitor management",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    icon: "📞",
    position: [4, 2, 0],
    color3d: "#3b82f6",
    text: "RECEPTION",
  },
  {
    name: "SEO Blog Writer",
    description: "Content creation, keyword optimization, SEO strategy",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-100 dark:bg-purple-950",
    icon: "✍️",
    position: [4, -2, 0],
    color3d: "#8b5cf6",
    text: "WRITER",
  },
  {
    name: "Lead Generator",
    description: "Prospect research, outreach campaigns, lead qualification",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-100 dark:bg-red-950",
    icon: "🎯",
    position: [-4, -2, 0],
    color3d: "#ef4444",
    text: "LEADS",
  },
]

function AnimatedPersonaText({ persona, index }: { persona: any; index: number }) {
  const textRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1
      textRef.current.position.y = persona.position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2
      textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05)
    }
  })

  return (
    <Float speed={1 + index * 0.1} rotationIntensity={0.1} floatIntensity={0.2}>
      <Center position={persona.position as [number, number, number]}>
        <Text3D 
          ref={textRef}
          font="/fonts/Inter_Regular.json" 
          size={0.4} 
          height={0.1} 
          curveSegments={12}
        >
          {persona.text}
          <meshStandardMaterial 
            color={persona.color3d} 
            metalness={0.8} 
            roughness={0.2}
            emissive={persona.color3d}
            emissiveIntensity={0.2}
          />
        </Text3D>
      </Center>
    </Float>
  )
}

function CentralAIHub() {
  const textRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = state.clock.elapsedTime * 0.3
      textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
  })

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
      <Center position={[0, 0, 0]}>
        <Text3D 
          ref={textRef}
          font="/fonts/Inter_Regular.json" 
          size={1.2} 
          height={0.3} 
          curveSegments={16}
        >
          AI
          <meshStandardMaterial 
            color="#8b5cf6" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Center>
    </Float>
  )
}

function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null!)
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // Create lines from center to each persona
  const points: THREE.Vector3[] = []
  personas.forEach(persona => {
    points.push(new THREE.Vector3(0, 0, 0)) // Center
    points.push(new THREE.Vector3(...persona.position)) // Persona position
  })
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#8b5cf6" opacity={0.4} transparent />
    </lineSegments>
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
        <div className="mb-16 h-[500px] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.2} />
              <pointLight position={[-10, -10, -10]} intensity={0.6} />
              <pointLight position={[0, 10, 0]} intensity={0.8} />

              {/* Central AI Hub */}
              <CentralAIHub />

              {/* Connection Lines */}
              <ConnectionLines />

              {/* Animated Persona Text */}
              {personas.map((persona, index) => (
                <AnimatedPersonaText key={persona.name} persona={persona} index={index} />
              ))}

              <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                autoRotate 
                autoRotateSpeed={0.5}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
              />
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
