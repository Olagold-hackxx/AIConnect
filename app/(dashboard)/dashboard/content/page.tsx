"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, Capability as ApiCapability, AgentExecution } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { 
  FileText, Plus, Loader2, CheckCircle2, Clock, 
  Facebook, Instagram, Linkedin, Twitter, Music,
  Sparkles, Image, Video
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Use API Capability type, extend with local properties if needed
type Capability = ApiCapability & {
  integrations_connected?: number
  integrations_required?: string[]
}

interface ContentItem {
  id: string
  content_type: string
  platform?: string
  title?: string
  content: string
  publish_status: string
  scheduled_for?: string
  published_at?: string
  hashtags: string[]
  images: string[]
  created_at: string
}

// Use API AgentExecution type
type Execution = AgentExecution

export default function ContentPage() {
  const { toast } = useToast()
  const [capability, setCapability] = useState<Capability | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [request, setRequest] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [includeImages, setIncludeImages] = useState(false)
  const [includeVideo, setIncludeVideo] = useState(false)
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null)
  const [executions, setExecutions] = useState<Execution[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get active assistant
      const assistants = await apiClient.listAssistants()
      const digitalMarketer = assistants.assistants?.find(
        (a: any) => a.assistant_type === "digital_marketer" && a.is_active
      )

      if (!digitalMarketer) {
        toast({
          title: "Assistant Required",
          description: "Please activate the Digital Marketer assistant first",
          variant: "destructive",
        })
        return
      }

      // Get content creation capability
      const capabilities = await apiClient.getCapabilities(digitalMarketer.id)
      const contentCapability = capabilities.capabilities?.find(
        (c: any) => c.capability_type === "content_creation"
      )

      if (contentCapability) {
        setCapability(contentCapability)
        // Load content from completed executions
        try {
          const completedExecutions = await apiClient.listAgentExecutions(
            digitalMarketer.id,
            contentCapability.id,
            "completed",  // status_filter
            50,  // limit
            0   // offset
          )
          // Extract content items from completed executions
          // Note: Content items are stored in the database separately
          // For now, we'll show execution results. In production, query ContentItem table directly
          const contentItems: ContentItem[] = []
          if (completedExecutions.executions) {
            for (const exec of completedExecutions.executions) {
              if (exec.result?.content_items && Array.isArray(exec.result.content_items)) {
                // Map execution result content items to ContentItem format
                for (const item of exec.result.content_items) {
                  contentItems.push({
                    id: item.id || exec.id,
                    content_type: "social_post",
                    platform: item.platform,
                    title: item.platform ? `Post for ${item.platform}` : "Content",
                    content: exec.result?.content || "",
                    publish_status: item.status === "published" ? "published" : "draft",
                    published_at: exec.completed_at,
                    hashtags: [],
                    images: item.images || [],
                    created_at: exec.created_at || new Date().toISOString(),
                  })
                }
              }
            }
          }
          setContent(contentItems)
        } catch (error) {
          console.error("Failed to load content:", error)
          // Continue without content items
        }
        
        // Load all executions for the execution list (not just completed)
        try {
          const allExecutions = await apiClient.listAgentExecutions(
            digitalMarketer.id,
            contentCapability.id,
            undefined,  // no status filter - get all
            50,  // limit
            0   // offset
          )
          setExecutions(allExecutions.executions || [])
        } catch (error) {
          console.error("Failed to load executions:", error)
          // Continue without executions list
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateContent() {
    if (!capability || !request.trim()) return

    setExecuting(true)
    try {
      // Get assistant ID from capability
      const assistants = await apiClient.listAssistants()
      const digitalMarketer = assistants.assistants?.find(
        (a: any) => a.assistant_type === "digital_marketer" && a.is_active
      )

      if (!digitalMarketer) {
        throw new Error("Digital Marketer assistant not found")
      }

      const execution = await apiClient.executeAgent({
        assistant_id: digitalMarketer.id,
        capability_id: capability.id,
        request_type: "create_content",
        request_data: {
          request: request.trim(),
          platforms: selectedPlatforms,
          include_images: includeImages,
          include_video: includeVideo,
        },
      })

      setCurrentExecution(execution.execution || null)
      
      // Poll for execution updates (Celery tasks don't support streaming)
      if (execution.execution?.id) {
        pollExecutionStatus(execution.execution.id)
      }
    } catch (error: any) {
      setExecuting(false)
      toast({
        title: "Error",
        description: error.message || "Failed to create content",
        variant: "destructive",
      })
    }
  }

  async function pollExecutionStatus(executionId: string) {
    const maxAttempts = 300 // 5 minutes max (1 second intervals)
    let attempts = 0
    let pollInterval: NodeJS.Timeout | null = null

    const poll = async () => {
      try {
        attempts++
        const result = await apiClient.getAgentExecution(executionId)
        const execution = result.execution

        if (execution) {
          setCurrentExecution(execution)

          // Check if execution is complete
          if (execution.status === "completed") {
            if (pollInterval) clearInterval(pollInterval)
            setExecuting(false)
            setShowCreateDialog(false)
            setRequest("")
            setSelectedPlatforms([])
            setIncludeImages(false)
            setIncludeVideo(false)
            loadData()
            toast({
              title: "Success",
              description: "Content created successfully!",
            })
            return
          }

          // Check if execution failed
          if (execution.status === "failed") {
            if (pollInterval) clearInterval(pollInterval)
            setExecuting(false)
            toast({
              title: "Error",
              description: execution.error_message || "Content creation failed",
              variant: "destructive",
            })
            return
          }

          // Stop polling after max attempts
          if (attempts >= maxAttempts) {
            if (pollInterval) clearInterval(pollInterval)
            setExecuting(false)
            toast({
              title: "Timeout",
              description: "Content creation is taking longer than expected. Please check back later.",
              variant: "destructive",
            })
            return
          }
        }
      } catch (error: any) {
        console.error("Error polling execution status:", error)
        // Continue polling on error (might be temporary)
      }
    }

    // Poll immediately, then every second
    await poll()
    pollInterval = setInterval(poll, 1000)
  }

  const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    tiktok: Music,
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!capability) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Content Creation capability not set up. Please configure it first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Creation</h1>
          <p className="text-muted-foreground">Create and manage your marketing content</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Execution Status */}
      {currentExecution && currentExecution.status !== "completed" && currentExecution.status !== "failed" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentExecution.status === "running" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
              {currentExecution.status === "running" ? "Agent Working..." : "Queued for Processing"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Status: <span className="capitalize">{currentExecution.status}</span>
                </p>
                {currentExecution.steps_executed && currentExecution.steps_executed.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Steps Completed:</p>
                    {currentExecution.steps_executed.map((step: any, idx: number) => (
                      <div key={`step-${typeof step === 'string' ? step : step.tool || idx}-${idx}`} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{typeof step === 'string' ? step : step.tool || step}</span>
                      </div>
                    ))}
                  </div>
                )}
                {currentExecution.tools_used && currentExecution.tools_used.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Tools Used:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentExecution.tools_used.map((tool: string, idx: number) => (
                        <Badge key={`tool-${tool}-${idx}`} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {currentExecution.result && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <p className="text-sm line-clamp-2">
                      {typeof currentExecution.result === "string" 
                        ? currentExecution.result 
                        : currentExecution.result.content || JSON.stringify(currentExecution.result).substring(0, 200)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution List */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Content Executions</CardTitle>
            <CardDescription>AI-generated content creation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions
                .filter(e => e.request_type === "create_content")
                .slice(0, 10)
                .map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {execution.status === "running" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : execution.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : execution.status === "failed" ? (
                        <Clock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {execution.result?.content?.substring(0, 50) || "Content Creation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {execution.status} • {new Date(execution.created_at).toLocaleString()}
                        </p>
                        {execution.steps_executed && execution.steps_executed.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {execution.steps_executed.filter((s: any) => s.status === "PASSED").length} / {execution.steps_executed.length} tasks completed
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={(() => {
                      if (execution.status === "completed") return "default"
                      if (execution.status === "running") return "secondary"
                      if (execution.status === "failed") return "destructive"
                      return "outline"
                    })()}>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List */}
      <div className="grid gap-4">
        {content.map((item) => {
          const PlatformIcon = item.platform ? platformIcons[item.platform] : FileText
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.platform && <PlatformIcon className="h-5 w-5" />}
                    <div>
                      <CardTitle className="text-lg">{item.title || "Untitled Content"}</CardTitle>
                      <CardDescription>
                        {item.platform ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1) : item.content_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={(() => {
                    if (item.publish_status === "published") return "default"
                    if (item.publish_status === "scheduled") return "secondary"
                    return "outline"
                  })()}>
                    {item.publish_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 line-clamp-3">{item.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {item.hashtags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Hashtags: {item.hashtags.slice(0, 3).join(", ")}</span>
                    </div>
                  )}
                  {item.scheduled_for && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Scheduled: {new Date(item.scheduled_for).toLocaleString()}</span>
                    </div>
                  )}
                  {item.published_at && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Published: {new Date(item.published_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Content Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Tell the AI what content you need. It will research, create, and optimize it for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="content-request" className="text-sm font-medium mb-2 block">Content Request</label>
              <Textarea
                id="content-request"
                placeholder="Example: Create social media posts about AI in healthcare for Facebook and LinkedIn"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="platforms" className="text-sm font-medium mb-2 block">Platforms (Optional)</label>
              <div id="platforms" className="flex flex-wrap gap-2">
                {["facebook", "instagram", "linkedin", "twitter", "tiktok"].map((platform) => {
                  const Icon = platformIcons[platform]
                  return (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedPlatforms.includes(platform)) {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform))
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, platform])
                        }
                      }}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="include-images" className="text-sm font-medium cursor-pointer">
                      Include Images
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generate AI images for your content
                    </p>
                  </div>
                </div>
                <Switch
                  id="include-images"
                  checked={includeImages}
                  onCheckedChange={setIncludeImages}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="include-video" className="text-sm font-medium cursor-pointer">
                      Include Video
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Generate AI video content
                    </p>
                  </div>
                </div>
                <Switch
                  id="include-video"
                  checked={includeVideo}
                  onCheckedChange={setIncludeVideo}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContent} disabled={executing || !request.trim()}>
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create with AI
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

