import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter Plan",
    price: "$500",
    period: "one-time setup",
    recurring: "$49/month",
    description: "Perfect for small businesses starting with AI automation",
    features: [
      "Customer Support AI Assistant integration",
      "Basic setup and configuration",
      "Email support",
      "Option to continue for $49/month",
      "Ongoing management included",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional Plan",
    price: "$600",
    period: "per month",
    recurring: null,
    description: "Ideal for growing businesses needing multiple AI assistants",
    features: [
      "Any two AI Assistants",
      "Personal Account Manager",
      "Priority support",
      "Custom integration setup",
      "Option to recruit manager internally",
      "Advanced analytics",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise Plan",
    price: "$1000",
    period: "per month",
    recurring: null,
    description: "Complete AI automation for established businesses",
    features: [
      "All three AI Assistants",
      "Dedicated Account Manager",
      "24/7 premium support",
      "Full custom integration",
      "Option to recruit manager internally",
      "Advanced analytics & reporting",
      "Custom AI training on your data",
    ],
    cta: "Get Started",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Choose the plan that fits your business needs. All plans include full management and support.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-primary bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-primary via-accent to-secondary px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
                {plan.recurring && (
                  <p className="mt-2 text-sm text-muted-foreground">Then {plan.recurring} for ongoing management</p>
                )}
              </div>

              <Button className={`mb-6 w-full ${plan.popular ? "ai-gradient" : ""}`} size="lg">
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
