"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, CreditCard, Lock } from "lucide-react"

const pricingPlans = [
  {
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

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1]) // Default to Professional
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  // Try to load signup data if available
  useEffect(() => {
    const signupData = localStorage.getItem("signupData")
    if (signupData) {
      // Could use this to pre-fill or display company info
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would process payment
    alert("Payment processing would happen here. Redirecting to success page...")
  }

  return (
    <PageLayout>
      <PageHeader
        title="Choose Your Plan"
        description="Select a plan to get started with human-enabled AI automation"
      />
      <div className="mx-auto max-w-6xl py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pricing Plans */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Select a Plan</h3>
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  selectedPlan.name === plan.name
                    ? "border-primary bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
                    : ""
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/ {plan.period}</span>
                      </div>
                    </div>
                    {plan.popular && (
                      <span className="rounded-full bg-gradient-to-r from-primary via-accent to-secondary px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Payment Information</CardTitle>
                <CardDescription>
                  Secure payment processed with industry-standard encryption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="cardName" className="mb-2 block text-sm font-medium">
                      Cardholder Name *
                    </label>
                    <Input
                      id="cardName"
                      type="text"
                      required
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="mb-2 block text-sm font-medium">
                      Card Number *
                    </label>
                    <Input
                      id="cardNumber"
                      type="text"
                      required
                      maxLength={19}
                      value={cardData.number}
                      onChange={(e) => {
                        const value = e.target.value.replaceAll(/\s/g, "")
                        const formatted = value.match(/.{1,4}/g)?.join(" ") || value
                        setCardData({ ...cardData, number: formatted })
                      }}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="mb-2 block text-sm font-medium">
                        Expiry Date *
                      </label>
                      <Input
                        id="expiry"
                        type="text"
                        required
                        maxLength={5}
                        value={cardData.expiry}
                      onChange={(e) => {
                        const value = e.target.value.replaceAll(/\D/g, "")
                        const formatted = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
                        setCardData({ ...cardData, expiry: formatted })
                      }}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="mb-2 block text-sm font-medium">
                        CVV *
                      </label>
                      <Input
                        id="cvv"
                        type="text"
                        required
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) =>
                          setCardData({ ...cardData, cvv: e.target.value.replaceAll(/\D/g, "") })
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-2xl font-bold">{selectedPlan.price}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedPlan.period === "per month" ? "Billed monthly" : "One-time payment"}
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="ai-gradient w-full group">
                    <Lock className="mr-2 h-4 w-4" />
                    Complete Payment
                    <Check className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By completing payment, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
