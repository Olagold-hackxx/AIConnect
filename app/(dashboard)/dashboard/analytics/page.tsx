import { Card } from "@/components/ui/card"
import { TrendingUp, MessageSquare, Clock, CheckCircle } from "lucide-react"

const metrics = [
  {
    label: "Response Time",
    value: "1.2s",
    change: "-0.3s",
    icon: Clock,
    positive: true,
  },
  {
    label: "Success Rate",
    value: "98.5%",
    change: "+2.1%",
    icon: CheckCircle,
    positive: true,
  },
  {
    label: "Total Conversations",
    value: "15,234",
    change: "+1,234",
    icon: MessageSquare,
    positive: true,
  },
  {
    label: "User Satisfaction",
    value: "4.8/5",
    change: "+0.2",
    icon: TrendingUp,
    positive: true,
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track performance and engagement across all your AI personas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="h-5 w-5 text-muted-foreground" />
              <span className={`text-sm font-medium ${metric.positive ? "text-green-600" : "text-red-600"}`}>
                {metric.change}
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="w-full ai-gradient rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </Card>
    </div>
  )
}
