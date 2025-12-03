import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ValueSection() {
  const comparisons = [
    { role: "Hiring a marketer?", cost: "$4,000–$7,000/month" },
    { role: "Hiring customer support?", cost: "$2,000–$3,500/month" },
    { role: "Hiring an executive assistant?", cost: "$2,500–$5,000/month" }
  ]

  return (
    <section className="relative py-12 overflow-hidden" style={{ backgroundColor: '#101010' }}>
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            The Value Is Unreal
          </h2>
          
          {/* Compact Comparison Table */}
          <div className="p-6 rounded-xl mb-6 border-2 border-[#60A5FA]/30" style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)', backdropFilter: 'blur(10px)' }}>
            <div className="space-y-3 text-sm">
              {comparisons.map((item) => (
                <div key={item.role} className="flex items-center justify-between py-2 border-b border-[#60A5FA]/20 last:border-0">
                  <span className="text-gray-200">{item.role}</span>
                  <span className="text-white font-semibold">{item.cost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compact StaffPilot Value */}
          <div className="p-6 rounded-xl mb-6 border-2 border-[#F472B6]/30" style={{ background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)', backdropFilter: 'blur(10px)' }}>
            <p className="text-xl sm:text-2xl font-bold text-white mb-2">
              StaffPilot starts at <span className="bg-gradient-to-r from-[#2563EB] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">$59/month</span>
            </p>
            <p className="text-sm text-gray-300 mb-3">
              — with a free audit that shows your exact cost savings.
            </p>
            <p className="text-sm text-gray-400">
              The biggest hiring arbitrage opportunity in the world right now.
            </p>
          </div>

          {/* Compact CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="default" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white neon-glow-blue group" asChild>
              <Link href="/signup">
                Get Free Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="default" variant="outline" className="glass-card border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/signup">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

