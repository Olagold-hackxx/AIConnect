"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, CheckCircle2, Loader2, DollarSign, Calendar, 
  Target
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Markdown from "react-markdown"

// Markdown component overrides for better styling
const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 last:mb-0">{children}</p>,
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="mb-1">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>,
}

interface Campaign {
  id: string
  name: string
  description?: string
  campaign_type?: string
  channels: string[]
  status: string
  total_budget?: number
  budget_allocation?: Record<string, number>
  start_date?: string
  end_date?: string
  plan?: {
    strategy?: string
    objective?: string
    target_audience?: string
    budget?: number
    duration_days?: number
    channels?: string[]
    ad_copy?: Record<string, {
      headlines?: string[]
      descriptions?: string[]
      final_url?: string
    }>
  }
  metrics?: Record<string, any>
  created_at: string
}

export default function CampaignReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [params.id])

  async function loadCampaign() {
    try {
      const response = await apiClient.getCampaign(params.id as string) as Campaign
      setCampaign(response)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load campaign",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!campaign) return

    setApproving(true)
    try {
      const result = await apiClient.approveCampaign(campaign.id) as { success?: boolean; errors?: string[]; created_assets?: string[] }
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Campaign approved and launched! Created assets: ${result.created_assets?.join(", ") || "N/A"}`,
        })
        router.push("/dashboard/campaigns")
      } else {
        toast({
          title: "Error",
          description: result.errors?.join(", ") || "Failed to approve campaign",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve campaign",
        variant: "destructive",
      })
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Campaign not found</p>
        </CardContent>
      </Card>
    )
  }

  const plan = campaign.plan || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">Review and approve your AI-generated campaign</p>
          </div>
        </div>
        <Badge variant={campaign.status === "draft" ? "outline" : "default"}>
          {campaign.status}
        </Badge>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p>{campaign.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                <Target className="h-3 w-3" />
                Objective
              </p>
              <p className="font-medium">{plan.objective || campaign.campaign_type || "N/A"}</p>
            </div>
            {campaign.total_budget && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                  <DollarSign className="h-3 w-3" />
                  Total Budget
                </p>
                <p className="font-medium">${campaign.total_budget.toLocaleString()}</p>
              </div>
            )}
            {campaign.start_date && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  Duration
                </p>
                <p className="font-medium text-sm">
                  {new Date(campaign.start_date).toLocaleDateString()} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "Ongoing"}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Channels</p>
              <div className="flex flex-wrap gap-1">
                {campaign.channels.map(channel => (
                  <Badge key={channel} variant="secondary" className="text-xs">
                    {channel.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Strategy */}
      {plan.strategy && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Strategy</CardTitle>
            <CardDescription>AI-generated campaign strategy and approach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown components={markdownComponents}>
                {plan.strategy}
              </Markdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Allocation */}
      {campaign.budget_allocation && Object.keys(campaign.budget_allocation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>Budget distribution across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(campaign.budget_allocation).map(([channel, amount]) => (
                <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{channel.replace("_", " ")}</span>
                  <span className="text-lg font-bold">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Copy */}
      {plan.ad_copy && Object.keys(plan.ad_copy).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ad Copy</CardTitle>
            <CardDescription>Generated ad copy for each platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(plan.ad_copy).map(([platform, adCopy]: [string, any]) => (
              <div key={platform}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{platform.replace("_", " ").toUpperCase()}</h3>
                  <Badge variant="outline">{platform}</Badge>
                </div>
                <Separator className="mb-4" />
                {adCopy.headlines && adCopy.headlines.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Headlines</p>
                    <div className="space-y-2">
                      {adCopy.headlines.map((headline: string, idx: number) => (
                        <div key={`headline-${platform}-${idx}`} className="p-3 bg-muted rounded-lg">
                          <p>{headline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {adCopy.descriptions && adCopy.descriptions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Descriptions</p>
                    <div className="space-y-2">
                      {adCopy.descriptions.map((desc: string, idx: number) => (
                        <div key={`desc-${platform}-${idx}`} className="p-3 bg-muted rounded-lg">
                          <p>{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {adCopy.final_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Landing Page</p>
                    <p className="text-sm text-blue-600">{adCopy.final_url}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approval Actions */}
      {campaign.status === "draft" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Ready to Launch?</CardTitle>
            <CardDescription>
              Review the campaign details above. Once approved, the campaign will be created in Google Ads and Meta Ads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={approving} className="flex-1">
                {approving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve & Launch Campaign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

