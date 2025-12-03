import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PlansSection() {
  const plans = [
    {
      tier: "Tier 1 — Self-Setup",
      description: "Perfect for fast movers and budget-conscious entrepreneurs.",
      features: []
    },
    {
      tier: "Tier 2 — Managed",
      description: "Our team sets everything up and performs weekly optimisations.",
      features: []
    },
    {
      tier: "Tier 3 — Dedicated Human Manager",
      description: "A full-time human expert + your AI employee = unstoppable force.",
      features: []
    }
  ]

  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#101010' }}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Plans That Fit Every Business
          </h2>
          <p className="text-lg text-gray-300">
            All plans include a free 7-day trial.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const colors = [
              { border: 'border-[#60A5FA]/30', bg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)', check: 'text-[#60A5FA]' },
              { border: 'border-[#A78BFA]/30', bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', check: 'text-[#A78BFA]' },
              { border: 'border-[#F472B6]/30', bg: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)', check: 'text-[#F472B6]' }
            ]
            const color = colors[index]
            return (
              <div key={index} className={`group relative rounded-2xl p-8 transition-all border-2 ${color.border} hover:${color.border.replace('/30', '/60')}`} style={{ background: color.bg, backdropFilter: 'blur(10px)' }}>
                <h3 className="mb-3 text-2xl font-bold text-white">{plan.tier}</h3>
                <p className="mb-6 text-gray-200">{plan.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className={`h-4 w-4 ${color.check}`} />
                  <span>Free 7-day trial included</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

