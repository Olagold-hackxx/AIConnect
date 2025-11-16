"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { authService } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const pricingPlans = [
  {
    id: "starter",
    name: "Starter Plan",
    price: "$500",
    priceInCents: 50000,
    period: "one-time setup",
    description: "Perfect for businesses starting with AI automation",
    features: [
      "All 3 AI Assistants",
      "Uptime guarantee",
      "Basic setup and configuration",
      "Email support",
      "No ongoing support included",
    ],
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "$600",
    priceInCents: 60000,
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
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "$1000",
    priceInCents: 100000,
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
  },
]

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
}

function PaymentForm({ planId, amount }: Readonly<{ planId: string; amount: number }>) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    async function createIntent() {
      try {
        const response = await apiClient.createPaymentIntent(planId, amount) as {
          client_secret: string
          payment_intent_id: string
        }
        setClientSecret(response.client_secret)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment",
          variant: "destructive",
        })
      }
    }
    createIntent()
  }, [planId, amount, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setIsProcessing(false)
      return
    }

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (stripeError) {
        toast({
          title: "Payment Failed",
          description: stripeError.message || "Payment could not be processed",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === "succeeded") {
        // Confirm payment on backend
        try {
          await apiClient.confirmPayment(paymentIntent.id)
          toast({
            title: "Success",
            description: "Payment processed successfully!",
          })
          router.push("/dashboard")
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to confirm payment",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Card Details</Label>
        <div className="mt-1.5 rounded-lg border border-input bg-background p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!stripe || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Complete Payment
            <Check className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By completing payment, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlanId, setSelectedPlanId] = useState("professional")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication
    async function checkAuth() {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsChecking(false)
      
      if (!authenticated) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete your payment",
          variant: "destructive",
        })
        router.push("/login")
      }
    }
    checkAuth()
  }, [router, toast])

  useEffect(() => {
    // Load selected plan from localStorage
    const savedPlan = localStorage.getItem("selectedPlan")
    if (savedPlan) {
      setSelectedPlanId(savedPlan)
    }
  }, [])

  const currentPlan = pricingPlans.find((p) => p.id === selectedPlanId) || pricingPlans[1]

  if (isChecking) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to complete your payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="flex-1" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Complete Your Payment"
        description="Review your plan and enter payment information"
      />
      <div className="mx-auto max-w-7xl py-8">
        <div className="mb-4">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Change plan
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Selected Plan - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
                <CardHeader>
                <CardTitle className="text-lg">Selected Plan</CardTitle>
                <CardDescription>Your chosen subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div>
                  <div className="text-2xl font-bold">{currentPlan.price}</div>
                  <div className="text-sm text-muted-foreground">/{currentPlan.period}</div>
                      </div>
                <div>
                  <h3 className="font-semibold">{currentPlan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p>
                    </div>
                <div className="border-t pt-4">
                  <h4 className="mb-2 text-sm font-semibold">What's included:</h4>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={`${currentPlan.id}-feature-${idx}`} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">{currentPlan.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentPlan.period === "per month" ? "Billed monthly" : "One-time payment"}
                  </p>
                </div>
                </CardContent>
              </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
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
                <Elements stripe={stripePromise}>
                  <PaymentForm planId={currentPlan.id} amount={currentPlan.priceInCents} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
