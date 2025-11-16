"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/shared/page-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, ArrowRight } from "lucide-react"

export default function ScheduleConsultationPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store consultation data
    const consultationData = {
      date: selectedDate,
      time: selectedTime,
      notes,
    }
    localStorage.setItem("consultationData", JSON.stringify(consultationData))
    // Navigate to pricing page to select a plan
    router.push("/pricing")
  }

  return (
    <PageLayout>
      <PageHeader
        title="Schedule Your Consultation"
        description="Book a call with our AI automation experts and dedicated account managers"
      />
      <div className="mx-auto max-w-2xl py-16">
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Select Date & Time</CardTitle>
            <CardDescription>
              Our human-enabled AI automation specialists are available Monday-Friday, 9am-6pm EST
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Preferred Date *
                </label>
                <Input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium">
                  <Clock className="mr-2 inline h-4 w-4" />
                  Preferred Time *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-md border p-3 text-sm transition-colors ${
                        selectedTime === time
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="ai-gradient w-full group">
                  Confirm Consultation
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  You'll receive a confirmation email with meeting details and next steps
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-6">
          <h3 className="mb-2 text-lg font-semibold">What to Expect</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Discussion of your business needs and AI automation goals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Overview of our human-enabled AI assistants and dedicated manager support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Custom solution recommendation tailored to your business</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>Q&A with our AI automation specialists</span>
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  )
}
