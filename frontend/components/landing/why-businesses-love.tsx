import { CheckCircle2, Clock, DollarSign, Settings, Gift, Shield } from "lucide-react"

export function WhyBusinessesLove() {
  const reasons = [
    {
      icon: CheckCircle2,
      title: "Human-Like Personas",
      description: "Your AI employee speaks like a real team member, adapts to your tone, and never feels robotic.",
      color: "text-[#60A5FA]",
      bgGradient: "from-[#60A5FA]/40 to-[#2563EB]/30",
      borderColor: "border-[#60A5FA]/30",
      shadowColor: "shadow-[#60A5FA]/20"
    },
    {
      icon: Clock,
      title: "Works 24/7, Never Gets Tired",
      description: "No breaks. No sick days. No downtime.",
      color: "text-[#A78BFA]",
      bgGradient: "from-[#A78BFA]/40 to-[#A855F7]/30",
      borderColor: "border-[#A78BFA]/30",
      shadowColor: "shadow-[#A78BFA]/20"
    },
    {
      icon: DollarSign,
      title: "Costs 80–90% Less Than Hiring Humans",
      description: "Stop burning money on payroll, training, and turnover.",
      color: "text-[#F472B6]",
      bgGradient: "from-[#F472B6]/40 to-[#EC4899]/30",
      borderColor: "border-[#F472B6]/30",
      shadowColor: "shadow-[#F472B6]/20"
    },
    {
      icon: Settings,
      title: "Easy Setup — or Let Our Team Do It",
      description: "Choose DIY, managed, or fully dedicated support.",
      color: "text-[#34D399]",
      bgGradient: "from-[#34D399]/40 to-[#10B981]/30",
      borderColor: "border-[#34D399]/30",
      shadowColor: "shadow-[#34D399]/20"
    },
    {
      icon: Gift,
      title: "7-Day Free Trial + Free Business Efficiency Audit",
      description: "Try your AI employee before paying a single dollar.",
      color: "text-[#FB923C]",
      bgGradient: "from-[#FB923C]/40 to-[#F97316]/30",
      borderColor: "border-[#FB923C]/30",
      shadowColor: "shadow-[#FB923C]/20"
    },
    {
      icon: Shield,
      title: "Performance Guarantee",
      description: "If your AI employee doesn't save you time or money in the first 30 days, we optimise it free until it does.",
      color: "text-[#06B6D4]",
      bgGradient: "from-[#06B6D4]/40 to-[#0891B2]/30",
      borderColor: "border-[#06B6D4]/30",
      shadowColor: "shadow-[#06B6D4]/20"
    }
  ]

  return (
    <section className="relative py-16 overflow-hidden" style={{ backgroundColor: '#101010' }}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Why Businesses Love StaffPilot
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            const bgGradientParts = reason.bgGradient.split(' ')
            const bgGradientFrom = bgGradientParts[0]?.replace('from-', '').replace('/40', '') || '[#60A5FA]'
            const bgGradientTo = bgGradientParts[1]?.replace('to-', '').replace('/30', '') || '[#2563EB]'
            const bgColorMap: Record<string, string> = {
              '[#60A5FA]': 'rgba(96, 165, 250, 0.15)',
              '[#2563EB]': 'rgba(37, 99, 235, 0.1)',
              '[#A78BFA]': 'rgba(167, 139, 250, 0.15)',
              '[#A855F7]': 'rgba(168, 85, 247, 0.1)',
              '[#F472B6]': 'rgba(244, 114, 182, 0.15)',
              '[#EC4899]': 'rgba(236, 72, 153, 0.1)',
              '[#34D399]': 'rgba(52, 211, 153, 0.15)',
              '[#10B981]': 'rgba(16, 185, 129, 0.1)',
              '[#FB923C]': 'rgba(251, 146, 60, 0.15)',
              '[#F97316]': 'rgba(249, 115, 22, 0.1)',
              '[#06B6D4]': 'rgba(6, 182, 212, 0.15)',
              '[#0891B2]': 'rgba(8, 145, 178, 0.1)'
            }
            return (
              <div key={reason.title} className={`group relative rounded-2xl p-8 transition-all border-2 ${reason.borderColor} hover:${reason.borderColor.replace('/30', '/60')}`} style={{ background: `linear-gradient(135deg, ${bgColorMap[bgGradientFrom] || 'rgba(96, 165, 250, 0.15)'} 0%, ${bgColorMap[bgGradientTo] || 'rgba(37, 99, 235, 0.1)'} 100%)`, backdropFilter: 'blur(10px)' }}>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${reason.bgGradient} transition-transform group-hover:scale-110 shadow-lg ${reason.shadowColor}`}>
                  <Icon className={`h-7 w-7 ${reason.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{index + 1}. {reason.title}</h3>
                <p className="text-sm text-gray-200 leading-relaxed">{reason.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

