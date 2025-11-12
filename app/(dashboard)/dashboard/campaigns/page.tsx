"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { 
  Target, Plus, Loader2, CheckCircle2, Clock, Eye, 
  Pause, DollarSign, Calendar, TrendingUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Campaign {
  id: string
  name: string
  description?: string
  campaign_type?: string
  channels: string[]
  status: string
  total_budget?: number
  budget_allocation?: Record<string, number>
  spent_to_date?: number
  start_date?: string
  end_date?: string
  plan?: Record<string, any>
  metrics?: Record<string, any>
  created_at: string
  execution_id?: string
}

interface Execution {
  id: string
  request_type: string
  status: string
  result?: any
  error_message?: string
  steps_executed?: any[]
  created_at: string
}

export default function CampaignsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [objective, setObjective] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [durationDays, setDurationDays] = useState("30")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadCampaigns = useCallback(async () => {
    try {
      const filter = statusFilter === "all" ? undefined : statusFilter
      const response = await apiClient.listCampaigns(filter) as { campaigns?: Campaign[] }
      setCampaigns(response.campaigns || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load campaigns",
        variant: "destructive",
      })
    }
  }, [statusFilter, toast])

  const loadExecutions = useCallback(async () => {
    try {
      const response = await apiClient.listAgentExecutions(undefined, undefined, undefined, 50, 0) as { executions?: Execution[] }
      const campaignExecutions = (response.executions || []).filter(
        (e: Execution) => e.request_type === "create_campaign"
      )
      setExecutions(campaignExecutions)
    } catch (error: any) {
      // Silently fail - executions are optional
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      await Promise.all([loadCampaigns(), loadExecutions()])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCampaign() {
    if (!objective.trim()) {
      toast({
        title: "Error",
        description: "Campaign objective is required",
        variant: "destructive",
      })
      return
    }

    if (selectedChannels.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one channel",
        variant: "destructive",
      })
      return
    }

    setExecuting(true)
    try {
      // Get active assistant
      const assistants = await apiClient.listAssistants() as { assistants?: any[] }
      const digitalMarketer = assistants.assistants?.find(
        (a: any) => a.assistant_type === "digital_marketer" && a.is_active
      )

      if (!digitalMarketer) {
        toast({
          title: "Error",
          description: "Digital Marketer assistant not found. Please activate it first.",
          variant: "destructive",
        })
        return
      }

      // Get campaigns capability
      const capabilities = await apiClient.getCapabilities(digitalMarketer.id) as { capabilities?: any[] }
      const campaignsCapability = capabilities.capabilities?.find(
        (c: any) => c.capability_type === "campaigns"
      )

      if (!campaignsCapability) {
        toast({
          title: "Error",
          description: "Campaigns capability not set up. Please configure it first.",
          variant: "destructive",
        })
        return
      }

      // Execute agent to create campaign
      await apiClient.executeAgent({
        assistant_id: digitalMarketer.id,
        capability_id: campaignsCapability.id,
        request_type: "create_campaign",
        request_data: {
          objective: objective.trim(),
          description: description.trim() || undefined,
          budget: budget ? Number.parseFloat(budget) : undefined,
          duration_days: Number.parseInt(durationDays, 10) || 30,
          channels: selectedChannels,
          campaign_type: "brand_awareness"
        }
      }) as { execution?: { id: string } }

      toast({
        title: "Success",
        description: "Campaign creation started. The AI will generate a comprehensive campaign plan.",
      })
      
      setShowCreateDialog(false)
      setObjective("")
      setDescription("")
      setBudget("")
      setDurationDays("30")
      setSelectedChannels([])
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData()
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      })
    } finally {
      setExecuting(false)
    }
  }

  async function handleApproveCampaign(campaignId: string) {
    try {
      const result = await apiClient.approveCampaign(campaignId) as { success?: boolean; errors?: string[] }
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Campaign approved and launched to platforms",
        })
        loadCampaigns()
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
    }
  }

  const channels = [
    { id: "google_ads", name: "Google Ads" },
    { id: "meta_ads", name: "Meta Ads" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "outline"
      case "active": return "default"
      case "paused": return "secondary"
      case "completed": return "default"
      case "failed": return "destructive"
      default: return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Executions List */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaign Executions</CardTitle>
            <CardDescription>AI-generated campaigns in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.slice(0, 5).map((execution) => {
                const campaign = campaigns.find(c => c.execution_id === execution.id)
                return (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {execution.status === "running" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : execution.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : execution.status === "failed" ? (
                        <Clock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {campaign?.name || "Campaign Creation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {execution.status} • {new Date(execution.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first marketing campaign and let AI generate a comprehensive strategy
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description || "No description"}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Channels
                    </p>
                    <p className="font-medium">{campaign.channels.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.channels.map(c => c.replace("_", " ")).join(", ")}
                    </p>
                  </div>
                  {campaign.total_budget && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Budget
                      </p>
                      <p className="font-medium">${campaign.total_budget.toLocaleString()}</p>
                    </div>
                  )}
                  {campaign.start_date && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Duration
                      </p>
                      <p className="font-medium text-sm">
                        {new Date(campaign.start_date).toLocaleDateString()} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "Ongoing"}
                      </p>
                    </div>
                  )}
                  {campaign.metrics && Object.keys(campaign.metrics).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Performance
                      </p>
                      <p className="font-medium text-sm">
                        {campaign.metrics.impressions ? `${campaign.metrics.impressions.toLocaleString()} impressions` : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {campaign.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveCampaign(campaign.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve & Launch
                      </Button>
                    </>
                  )}
                  {campaign.status === "active" && (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Describe your campaign objective and the AI will generate a comprehensive strategy with ad copy, budget allocation, and timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="objective" className="text-sm font-medium mb-2 block">
                Campaign Objective *
              </label>
              <Input
                id="objective"
                placeholder="e.g., Product Launch, Brand Awareness, Lead Generation"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Provide details about your campaign goals, target audience, and key messaging..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="text-sm font-medium mb-2 block">
                  Total Budget ($)
                </label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="duration" className="text-sm font-medium mb-2 block">
                  Duration (days)
                </label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="channels" className="text-sm font-medium mb-2 block">Channels *</label>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    type="button"
                    variant={selectedChannels.includes(channel.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedChannels.includes(channel.id)) {
                        setSelectedChannels(selectedChannels.filter(c => c !== channel.id))
                      } else {
                        setSelectedChannels([...selectedChannels, channel.id])
                      }
                    }}
                  >
                    {channel.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={executing || !objective.trim() || selectedChannels.length === 0}>
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
