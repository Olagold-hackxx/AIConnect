"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const pricingPlans = [
  {
    id: "self-setup",
    name: "Tier 1 — Self-Setup",
    price: "$59–$149",
    period: "month",
    description: "For DIY founders and fast executors.",
    features: [
      "Full AI employee",
      "Templates & workflows",
      "Personas included",
      "Unlimited tasks",
      "Email support",
      "7-day free trial included",
    ],
    popular: false,
  },
  {
    id: "managed",
    name: "Tier 2 — Managed",
    price: "$299–$599",
    period: "month",
    description: "We set up, optimise, and improve everything weekly.",
    features: [
      "Everything in Self-Setup",
      "Human account manager",
      "Weekly improvements",
      "Monthly analytics reports",
      "Priority support",
      "Personalised optimisation",
      "7-day free trial included",
    ],
    popular: true,
  },
  {
    id: "dedicated",
    name: "Tier 3 — Dedicated Manager",
    price: "$1,500–$4,000",
    period: "month",
    description: "Your own human expert + AI employee. Full-time support and pro-level automation.",
    features: [
      "Everything in Managed",
      "Dedicated expert",
      "Unlimited custom automations",
      "White-glove onboarding",
      "Full operational support",
      "Priority implementation",
      "7-day free trial included",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("managed")

  const handleContinue = () => {
    localStorage.setItem("selectedPlan", selectedPlan)
    router.push("/payment")
  }

  return (
    <PageLayout>
      <PageHeader
        title="The Most Affordable Workforce Upgrade on Earth"
        description="Every plan includes a free 7-day trial and performance guarantee."
      />
      <div className="mx-auto max-w-5xl py-16">
        <div className="mb-10 rounded-2xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
          <p className="mb-2">
            Hiring a marketer? $4,000–$7,000 per month. Customer support? $2,000–$3,500 per month. Executive assistant?
            $2,500–$5,000 per month.
          </p>
          <p>
            StaffPilot starts at <span className="font-semibold text-foreground">$59/month</span> — with a free audit
            that shows your exact cost savings.
          </p>
        </div>

        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                selectedPlan === plan.id
                  ? "border-primary bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
                  : "border-border"
              } ${plan.popular ? "border-primary/60" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-primary via-accent to-secondary px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="cursor-pointer" onClick={() => setSelectedPlan(plan.id)}>
                <div className="mb-4 flex items-start gap-3">
                  <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                  <Label htmlFor={plan.id} className="flex flex-1 cursor-pointer flex-col">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                    </div>
                  </Label>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <Button size="lg" onClick={handleContinue} className="min-w-[220px] ai-gradient">
            Start Free 7-Day Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="max-w-xl text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Performance Guarantee:</span> If you don’t see measurable
            improvements within 30 days, we optimise your AI setup for free until you do.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
