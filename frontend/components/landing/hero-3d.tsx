"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { Scene } from "@/components/3d/ai-robot"

export function Hero3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    globalThis.addEventListener("mousemove", handleMouseMove)
    return () => globalThis.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="animated-gradient absolute inset-0" />
      <div className="gradient-orb gradient-orb-1 absolute z-10" />
      <div className="gradient-orb gradient-orb-2 absolute z-10" />
      <div className="gradient-orb gradient-orb-3 absolute z-10" />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {mounted && (
          <div
            className="absolute inset-0 opacity-20 transition-opacity duration-700"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(148, 163, 184, 0.1), transparent 40%)`,
            }}
          />
        )}
      </div>

   {/* 3D Background */}
   <div className="absolute inset-0 top-1/3 sm:top-1/3 left-1/2 right-4 sm:right-12 z-10">
        <div className="relative h-[150px] sm:h-[200px] w-full">
            <Canvas
              shadows
              className="rounded-2xl "
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-30">
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">The AI Employee Company</span>
            <span className="sm:hidden">The AI Employee Company</span>
          </div>

          <h1 className="mb-4 sm:mb-6 max-w-4xl text-balance text-3xl sm:text-5xl font-bold leading-tight tracking-tight lg:text-6xl xl:text-7xl">
            Hire an AI Employee That Works{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              24/7 for a Fraction of the Cost
            </span>
          </h1>

          <p className="mb-8 sm:mb-10 max-w-2xl text-pretty text-base sm:text-lg text-muted-foreground lg:text-xl px-2">
            Smarter than a virtual assistant. Faster than a full-time employee. The fastest, easiest way to scale your business without hiring headaches.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="ai-gradient group" asChild>
              <Link href="/contact">
                Get Your Free AI Employee Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-sm bg-transparent" asChild>
              <Link href="/pricing">
                Start Free 7-Day Trial
              </Link>
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 w-full max-w-md sm:max-w-none">
            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-center">Includes Free Audit</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-center">7-Day Free Trial</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500 flex-shrink-0" />
                <span className="text-center">Performance Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
