"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ArrowRight } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    companySize: "",
    industry: "",
    website: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store form data (in a real app, this would go to a backend)
    localStorage.setItem("signupData", JSON.stringify(formData))
    // Route to schedule consultation page
    router.push("/schedule-consultation")
  }

  const handleSkipToPayment = () => {
    // Store form data
    localStorage.setItem("signupData", JSON.stringify(formData))
    router.push("/payment")
  }

  return (
    <PageLayout>
      <PageHeader
        title="Get Started with CODIAN"
        description="Tell us about your company to get started with human-enabled AI automation"
      />
      <div className="mx-auto max-w-2xl py-16">
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Company Information</CardTitle>
            <CardDescription>
              Help us understand your business needs so we can provide the best human-powered AI assistant solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-medium">
                  Company Name *
                </label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@company.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label htmlFor="companySize" className="mb-2 block text-sm font-medium">
                  Company Size *
                </label>
                <Input
                  id="companySize"
                  type="text"
                  required
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                />
              </div>

              <div>
                <label htmlFor="industry" className="mb-2 block text-sm font-medium">
                  Industry *
                </label>
                <Input
                  id="industry"
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, E-commerce"
                />
              </div>

              <div>
                <label htmlFor="website" className="mb-2 block text-sm font-medium">
                  Website (Optional)
                </label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button type="submit" size="lg" className="ai-gradient w-full group">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSkipToPayment}
                  className="w-full"
                >
                  Skip & Go to Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
