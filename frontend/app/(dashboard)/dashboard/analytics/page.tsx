"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { 
  BarChart3, Plus, Loader2, TrendingUp, Download,
  MessageSquare, FileText, Sparkles, AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Capability {
  id: string
  capability_type: string
  status: string
  setup_completed: boolean
}

interface AnalyticsReport {
  id: string
  report_type: string
  title: string
  status: string
  summary?: string
  insights?: any[]
  recommendations?: any[]
  metrics?: Record<string, any>
  start_date?: string
  end_date?: string
  created_at: string
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [capability, setCapability] = useState<Capability | null>(null)
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showAskDialog, setShowAskDialog] = useState(false)
  const [reportType, setReportType] = useState("weekly")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const assistants = await apiClient.listAssistants()
      const digitalMarketer = assistants.assistants?.find(
        (a) => a.assistant_type === "digital_marketer" && a.is_active
      )

      if (!digitalMarketer) {
        toast({
          title: "Assistant Required",
          description: "Please activate the Digital Marketer assistant first",
          variant: "destructive",
        })
        return
      }

      const capabilities = await apiClient.getCapabilities(digitalMarketer.id)
      const analyticsCapability = capabilities.capabilities?.find(
        (c) => c.capability_type === "analytics"
      )

      if (analyticsCapability) {
        setCapability(analyticsCapability)
        
        // Load dashboard
        try {
          const dashboardData = await apiClient.getAnalyticsDashboard(analyticsCapability.id)
          setDashboard(dashboardData)
        } catch (e) {
          // Dashboard might not be available yet
        }
        
        // Load reports
        const reportsData = await apiClient.listAnalyticsReports()
        setReports(reportsData.reports || [])
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

  async function handleGenerateReport() {
    if (!capability) return

    setGenerating(true)
    try {
      await apiClient.generateAnalyticsReport(capability.id, {
        report_type: reportType,
        data_sources: ["google_analytics", "google_ads", "meta_ads"],
      })

      toast({
        title: "Report Generation Started",
        description: "The AI is generating your analytics report. It will appear here when ready.",
      })
      
      setShowGenerateDialog(false)
      setTimeout(() => loadData(), 2000) // Refresh after 2 seconds
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  async function handleAskQuestion() {
    if (!capability || !question.trim()) return

    setAnswering(true)
    setAnswer("")
    try {
      const response = await apiClient.askAnalytics(capability.id, question.trim())
      setAnswer(response.answer || response.response || "No answer provided")
    } catch (error: any) {
      setAnswer(`Error: ${error.message}`)
    } finally {
      setAnswering(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!capability) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Analytics capability not set up. Please configure it first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track performance and get AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAskDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Dashboard Overview */}
      {dashboard && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboard.metrics && Object.entries(dashboard.metrics).map(([key, value]: [string, any]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {dashboard?.insights && dashboard.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Automated insights from your analytics data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.insights.map((insight: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm mt-2 font-medium">Recommendation: {insight.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Reports</h2>
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>
                      {report.report_type} • {new Date(report.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {report.summary && (
                  <p className="text-sm mb-4">{report.summary}</p>
                )}
                {report.metrics && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {Object.entries(report.metrics).slice(0, 3).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground">{key}</p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
            </div>
              </CardContent>
          </Card>
        ))}
        </div>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Analytics Report</DialogTitle>
            <DialogDescription>
              The AI will analyze your data and generate a comprehensive report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="campaign_specific">Campaign Specific</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask AI Dialog */}
      <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ask Analytics AI</DialogTitle>
            <DialogDescription>
              Ask questions about your marketing performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Textarea
                placeholder="Example: Which campaign has the best ROI?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>
            {answer && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">{answer}</p>
              </div>
            )}
        </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAskDialog(false)
              setQuestion("")
              setAnswer("")
            }}>
              Close
            </Button>
            <Button onClick={handleAskQuestion} disabled={answering || !question.trim()}>
              {answering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
