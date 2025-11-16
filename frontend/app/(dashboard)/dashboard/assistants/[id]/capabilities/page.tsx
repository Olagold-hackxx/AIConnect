"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, Assistant as ApiAssistant, Capability as ApiCapability } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { 
  CheckCircle2, Settings, ArrowRight, 
  FileText, Target, BarChart3, ExternalLink,
  Loader2, AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Use API Capability type, extend with local properties if needed
type Capability = ApiCapability & {
  integrations_required?: string[]
  integrations_connected?: number
}

// Use API Assistant type, name can be derived from assistant_type if needed
type Assistant = ApiAssistant & { name?: string }

const capabilityConfig = {
  content_creation: {
    name: "Content Creation",
    description: "Create social media posts, ad copy, and marketing content with AI",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    requiredIntegrations: ["facebook", "instagram", "linkedin", "twitter"],
    optionalIntegrations: ["tiktok"],
    features: [
      "Keyword research and trending hashtags",
      "Platform-specific content generation",
      "AI image generation",
      "Hashtag optimization",
      "Scheduled publishing"
    ]
  },
  campaigns: {
    name: "Campaigns",
    description: "Plan and execute multi-channel marketing campaigns",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    requiredIntegrations: ["google_ads", "meta_ads"],
    optionalIntegrations: ["sendgrid"],
    features: [
      "Multi-channel campaign planning",
      "Ad campaign creation",
      "Email marketing sequences",
      "Budget management",
      "Performance tracking"
    ]
  },
  analytics: {
    name: "Analytics & Reports",
    description: "Track performance and generate AI-powered insights",
    icon: BarChart3,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    requiredIntegrations: ["google_analytics"],
    optionalIntegrations: ["google_ads", "meta_ads"],
    features: [
      "Real-time performance tracking",
      "AI-generated insights",
      "Automated reporting",
      "ROI analysis",
      "Trend predictions"
    ]
  }
}

export default function CapabilitiesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const assistantId = params.id as string
  
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [loading, setLoading] = useState(true)
  const [settingUp, setSettingUp] = useState<string | null>(null)

  useEffect(() => {
    if (assistantId) {
      loadData()
    }
  }, [assistantId])

  async function loadData() {
    try {
      // Get assistant
      const assistants = await apiClient.listAssistants()
      const foundAssistant = assistants.assistants?.find(
        (a) => a.id === assistantId
      )

      if (!foundAssistant) {
        toast({
          title: "Assistant Not Found",
          description: "The requested assistant does not exist",
          variant: "destructive",
        })
        router.push("/dashboard/assistants")
        return
      }

      setAssistant(foundAssistant)

      // Get capabilities
      const capabilitiesData = await apiClient.getCapabilities(assistantId)
      setCapabilities(capabilitiesData.capabilities || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load capabilities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSetupCapability(capabilityType: string) {
    if (!assistantId) return
    
    setSettingUp(capabilityType)
    try {
      // Find existing capability
      let capability = capabilities.find(c => c.capability_type === capabilityType)
      
      if (capability) {
        // Setup existing capability
        await apiClient.setupCapability(capability.id)
      } else {
        // Create new capability
        await apiClient.createCapability(assistantId, capabilityType)
      }

      toast({
        title: "Setup Started",
        description: `${capabilityConfig[capabilityType as keyof typeof capabilityConfig]?.name} setup initiated`,
      })

      // Reload to get updated status
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup capability",
        variant: "destructive",
      })
    } finally {
      setSettingUp(null)
    }
  }

  function getIntegrationStatus(capability: Capability) {
    const required = capability.integrations_required?.length || 0
    const connected = capability.integrations_connected || 0
    return { required, connected, complete: connected >= required }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!assistant) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capabilities</h1>
          <p className="text-muted-foreground">
            Configure capabilities for {assistant.name || assistant.assistant_type}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/assistants")}>
          Back to Assistants
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(capabilityConfig).map(([type, config]) => {
          const capability = capabilities.find(c => c.capability_type === type)
          const Icon = config.icon
          const status = capability ? getIntegrationStatus(capability) : { required: config.requiredIntegrations.length, connected: 0, complete: false }
          const isActive = capability?.status === "active"
          const isConfiguring = capability?.status === "configuring"
          const needsSetup = !capability || capability.status === "not_configured"

          return (
            <Card key={type} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>
                  {isActive && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                  {isConfiguring && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Setting Up
                    </Badge>
                  )}
                </div>
                <CardTitle>{config.name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {config.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Integration Status */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Integrations</p>
                    <span className="text-xs text-muted-foreground">
                      {status.connected}/{status.required} connected
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status.complete ? "bg-green-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${(status.connected / status.required) * 100}%` }}
                    />
                  </div>
                  {!status.complete && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Connect {status.required - status.connected} more integration(s)
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {needsSetup && (
                    <Button
                      className="w-full"
                      onClick={() => handleSetupCapability(type)}
                      disabled={settingUp === type}
                    >
                      {settingUp === type ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Setting Up...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Setup Capability
                        </>
                      )}
                    </Button>
                  )}

                  {isConfiguring && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/integrations?capability=${capability?.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect Integrations
                    </Button>
                  )}

                  {isActive && (
                    <>
                      <Link href={`/dashboard/${type === "content_creation" ? "content" : type}`}>
                        <Button className="w-full">
                          Open {config.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/integrations?capability=${capability?.id}`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Integrations
                      </Button>
                    </>
                  )}

                  {!needsSetup && !isActive && !isConfiguring && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">Setup Required</p>
                          <p className="text-xs text-muted-foreground">
                            Connect required integrations to activate
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

