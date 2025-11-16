"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Bot, MessageSquare, FileText, Share2, Settings, LogOut, FileText as ContentIcon, Target, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assistants", href: "/dashboard/assistants", icon: Bot },
  { name: "Content", href: "/dashboard/content", icon: ContentIcon },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Target },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Integrations", href: "/dashboard/integrations", icon: Share2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    authService.logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-primary ">CODIAN</span>
        </Link>
      </div>

      <nav className="space-y-1 p-4 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
