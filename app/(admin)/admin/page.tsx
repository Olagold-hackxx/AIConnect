import { Card } from "@/components/ui/card"
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Total Clients",
    value: "1,247",
    change: "+12.5%",
    icon: Users,
  },
  {
    name: "Monthly Revenue",
    value: "$124,583",
    change: "+18.2%",
    icon: DollarSign,
  },
  {
    name: "System Uptime",
    value: "99.98%",
    change: "+0.02%",
    icon: Activity,
  },
  {
    name: "Growth Rate",
    value: "23.4%",
    change: "+5.1%",
    icon: TrendingUp,
  },
]

const recentClients = [
  { name: "Acme Corp", plan: "Enterprise", status: "active", queries: 45234 },
  { name: "TechStart Inc", plan: "Pro", status: "active", queries: 12456 },
  { name: "Legal Partners", plan: "Pro", status: "active", queries: 8932 },
  { name: "Marketing Hub", plan: "Free", status: "trial", queries: 1234 },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform performance and manage clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg ai-gradient flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Clients</h3>
        <div className="space-y-4">
          {recentClients.map((client) => (
            <div key={client.name} className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.queries.toLocaleString()} queries this month</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">{client.plan}</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    client.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
