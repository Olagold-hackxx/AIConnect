"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Bot, MessageSquare, FileText, Share2, FileText as ContentIcon, Target, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    assistants: 0,
    conversations: 0,
    documents: 0,
    integrations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    async function loadStats() {
      try {
        const [assistants, conversations, documents, integrations] = await Promise.all([
          apiClient.listAssistants().catch(() => ({ assistants: [] })),
          apiClient.listConversations().catch(() => ({ conversations: [], total: 0 })),
          apiClient.listDocuments().catch(() => ({ documents: [], total: 0 })),
          apiClient.listIntegrations().catch(() => ({ integrations: [], total: 0 })),
        ])

        if (!cancelled) {
          setStats({
            assistants: assistants.assistants?.length || 0,
            conversations: conversations.total || 0,
            documents: documents.total || 0,
            integrations: integrations.total || 0,
          })
          setLoading(false)
        }
      } catch (error: any) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: "Failed to load dashboard stats",
            variant: "destructive",
          })
          setLoading(false)
        }
      }
    }

    loadStats()
    
    return () => {
      cancelled = true
    }
  }, [toast])

  const quickActions = [
    {
      title: "Assistants",
      description: "Configure your AI assistants",
      icon: Bot,
      href: "/dashboard/assistants",
      color: "text-blue-500",
    },
    {
      title: "Content Creation",
      description: "Create social posts and content",
      icon: ContentIcon,
      href: "/dashboard/content",
      color: "text-purple-500",
    },
    {
      title: "Campaigns",
      description: "Manage marketing campaigns",
      icon: Target,
      href: "/dashboard/campaigns",
      color: "text-orange-500",
    },
    {
      title: "Analytics",
      description: "View performance reports",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "text-green-500",
    },
    {
      title: "Chat",
      description: "Start a conversation",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "text-green-500",
    },
    {
      title: "Documents",
      description: "Upload and manage documents",
      icon: FileText,
      href: "/dashboard/documents",
      color: "text-purple-500",
    },
    {
      title: "Integrations",
      description: "Connect social media accounts",
      icon: Share2,
      href: "/dashboard/integrations",
      color: "text-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.assistants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.conversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.documents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.integrations}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.href} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button variant="outline" className="w-full">
                      Go to {action.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

