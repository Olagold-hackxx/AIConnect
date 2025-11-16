"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, Assistant as ApiAssistant } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Circle, Settings } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Use API Assistant type, extend with local properties
type Assistant = ApiAssistant & {
  type?: string
  name?: string
  description?: string
}

const assistantConfig = {
  digital_marketer: {
    name: "Rita",
    role: "Digital Marketer",
    description: "Social media management, campaign strategy, ad creation, and performance reporting",
    image: "/ai-assistant-digital-marketer.jpg",
    bgGradient: "from-orange-400 via-yellow-400 to-orange-500",
    textColor: "text-orange-900",
  },
  executive_assistant: {
    name: "Jane",
    role: "Executive Assistant",
    description: "Scheduling, task management, communication, document prep, and research",
    image: "/ai-assistant-executive.jpg",
    bgGradient: "from-orange-400 via-pink-400 to-orange-500",
    textColor: "text-orange-900",
  },
  customer_support: {
    name: "David",
    role: "Customer Support",
    description: "Client inquiries, live chat, ticket management, and support automation",
    image: "/ai-assistant-customer-support.jpg",
    bgGradient: "from-pink-400 via-purple-400 to-pink-500",
    textColor: "text-pink-900",
  },
}

export default function AssistantsPage() {
  const { toast } = useToast()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null)
  const [customInstructions, setCustomInstructions] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")

  useEffect(() => {
    loadAssistants()
  }, [])

  async function loadAssistants() {
    try {
      const response = await apiClient.listAssistants()
      setAssistants(response.assistants || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load assistants"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleActivate(assistantType: string) {
    try {
      await apiClient.activateAssistant(assistantType as any)
      toast({
        title: "Success",
        description: "Assistant activated",
      })
      loadAssistants()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate assistant",
        variant: "destructive",
      })
    }
  }

  async function handleDeactivate(assistantId: string) {
    try {
      await apiClient.deactivateAssistant(assistantId)
      toast({
        title: "Success",
        description: "Assistant deactivated",
      })
      loadAssistants()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate assistant",
        variant: "destructive",
      })
    }
  }

  async function handleUpdate() {
    if (!editingAssistant) return

    try {
      await apiClient.updateAssistant(editingAssistant.id, {
        custom_instructions: customInstructions || undefined,
        system_prompt_override: systemPrompt || undefined,
      })
      toast({
        title: "Success",
        description: "Assistant updated",
      })
      setEditingAssistant(null)
      loadAssistants()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assistant",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistants</h1>
        <p className="text-muted-foreground">Select and configure your AI assistants</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
        {Object.entries(assistantConfig).map(([type, config]) => {
          const assistant = assistants.find(
            (a) => a.assistant_type === type || a.type === type
          )
          const isActive = assistant?.is_active || false

          return (
            <Card
              key={type}
              className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-xl"
            >
              {/* Image Container with Gradient Background */}
              <div className={`relative h-64 overflow-hidden bg-gradient-to-br ${config.bgGradient}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />

                {/* Animated Image */}
                <img
                  src={config.image || "/placeholder.svg"}
                  alt={config.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                />

                {/* Floating Icons Animation */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-4 top-4 h-8 w-8 animate-float-slow rounded-full bg-white/30 blur-sm" />
                  <div className="absolute right-8 top-12 h-6 w-6 animate-float-slower rounded-full bg-white/30 blur-sm" />
                  <div className="absolute bottom-8 left-12 h-10 w-10 animate-float rounded-full bg-white/30 blur-sm" />
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isActive ? (
                    <div className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-white shadow-lg">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-semibold">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-gray-500 px-3 py-1.5 text-white shadow-lg">
                      <Circle className="h-4 w-4" />
                      <span className="text-xs font-semibold">Inactive</span>
                    </div>
                  )}
                </div>

                {/* Name Badge */}
                <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 shadow-lg">
                  <p className={`text-sm font-bold ${config.textColor}`}>{config.name}</p>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                <h3 className="mb-2 text-2xl font-bold">{config.role}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{config.description}</p>

                <div className="space-y-2">
                  {isActive && assistant ? (
                    <>
                      <Link href={`/dashboard/assistants/${assistant.id}/capabilities`}>
                        <Button variant="outline" className="w-full mb-2">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Capabilities
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setEditingAssistant(assistant)
                          setCustomInstructions(assistant.custom_instructions || "")
                          setSystemPrompt(assistant?.system_prompt_override || "")
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Advanced Settings
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeactivate(assistant!.id)}
                      >
                        Deactivate
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleActivate(type)}
                    >
                      Activate {config.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!editingAssistant} onOpenChange={(open) => !open && setEditingAssistant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {editingAssistant?.name}</DialogTitle>
            <DialogDescription>
              Customize your assistant's behavior and instructions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="instructions">Custom Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Add custom instructions for this assistant..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="systemPrompt">System Prompt Override</Label>
              <Textarea
                id="systemPrompt"
                placeholder="Override the default system prompt..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAssistant(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

