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
    id: "starter",
    name: "Starter Plan",
    price: "$500",
    period: "one-time setup",
    description: "Perfect for businesses starting with AI automation",
    features: [
      "All 3 AI Assistants",
      "Uptime guarantee",
      "Basic setup and configuration",
      "Email support",
      "No ongoing support included",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "$600",
    period: "per month",
    description: "Ideal for businesses needing AI automation with human manager support",
    features: [
      "All 3 AI Assistants",
      "Uptime guarantee",
      "Human manager with great support",
      "Priority support",
      "Custom integration setup",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "$1000",
    period: "per month",
    description: "Complete AI automation with fully dedicated human manager",
    features: [
      "All 3 AI Assistants",
      "Uptime guarantee",
      "Fully dedicated human manager",
      "Option to hire your manager",
      "24/7 premium support",
      "Full custom integration",
      "Advanced analytics & reporting",
      "Custom AI training on your data",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("professional")

  const handleContinue = () => {
    // Store selected plan
    localStorage.setItem("selectedPlan", selectedPlan)
    router.push("/payment")
  }

  return (
    <PageLayout>
      <PageHeader
        title="Choose Your Plan"
        description="Select a plan that fits your business needs"
      />
      <div className="mx-auto max-w-5xl py-16">
        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                selectedPlan === plan.id
                  ? "border-primary bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
                  : ""
              } ${plan.popular ? "border-primary/50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-primary via-accent to-secondary px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader
                className="cursor-pointer"
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="mb-4 flex items-start gap-3">
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={plan.id}
                    className="flex flex-1 cursor-pointer flex-col"
                  >
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
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

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleContinue} className="min-w-[200px]">
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
