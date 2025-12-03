"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero3D() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-28 pb-16" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Subtle ambient lighting - very minimal to not interfere with image blend */}
      <div className="absolute inset-0 z-0 opacity-30">
        {/* Very subtle purple glow - top right */}
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full"
        />
        {/* Very subtle fuchsia glow - bottom left */}
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-fuchsia-500/10 blur-[80px] rounded-full"
        />
      </div>

      {/* Mobile: Full-width hero image */}
      <div className="lg:hidden absolute inset-0 z-0">
        <div className="relative w-full h-full" style={{ backgroundColor: '#1e1e1e' }}>
          <img
            src="/hero_lady.png"
            alt="Retro pop-art AI employee with headset"
            className="w-full h-full object-cover object-center"
            style={{ 
              backgroundColor: '#1e1e1e',
              imageRendering: 'auto',
              display: 'block',
            }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 h-full w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">
          
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left justify-center space-y-4 lg:space-y-8 relative z-10"
          >
            {/* Badge - Visible on mobile and desktop */}
            <div className="inline-flex  items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
              <Sparkles className="h-4 w-4 text-[#EC4899]" />
              <span>The AI Employee Company</span>
            </div>

            {/* Headline - Left aligned, positioned above CTA on mobile */}
            <h1 className="max-w-3xl text-3xl my-2 lg:my-0 sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white text-left">
              Hire an AI Employee That Works 24/7 for a{' '}
              <span className="text-[#60A5FA] lg:bg-gradient-to-r lg:from-[#60A5FA] lg:via-[#A78BFA] lg:to-[#F472B6] lg:bg-clip-text lg:text-transparent">
                Fraction of the Cost
              </span>
            </h1>

            {/* Subtext - Visible on mobile and desktop */}
            <p className="max-w-xl text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed">
              Smarter than a virtual assistant. Faster than a full-time employee.{" "}
              <span className="sm:hidden"> </span>
              <span className="hidden lg:inline">The fastest, easiest way to scale your business without hiring headaches.</span>
            </p>

            {/* Trust Indicators - Visible on mobile and desktop */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-gray-200">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2563EB] neon-glow-blue" />
                <span>Free Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#A855F7] neon-glow-purple" />
                <span>7-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#EC4899] neon-glow-fuchsia" />
                <span>Performance Guarantee</span>
              </div>
            </div>

            {/* CTA Buttons - Positioned below H1 on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-2 lg:pt-4">
              <Button size="lg" className="text-base px-8 py-4 h-auto bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold neon-glow-blue group w-full sm:w-auto" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-4 h-auto glass-card border-white/20 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Retro Pop-Art Character - Desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center h-full"
            style={{ backgroundColor: '#1e1e1e' }}
          >
            <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
              {/* Retro pop-art character image - seamless blend with background */}
              <div className="relative z-10 w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1e1e1e' }}>
                <img
                  src="/hero_lady.png"
                  alt="Retro pop-art AI employee with headset"
                  className="max-h-[1000px] w-auto"
                  style={{ 
                    backgroundColor: '#1e1e1e',
                    imageRendering: 'auto',
                    display: 'block',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    margin: 0,
                    padding: 0,
                    verticalAlign: 'middle',
                    objectFit: 'contain',
                    mixBlendMode: 'normal',
                    isolation: 'isolate'
                  }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}