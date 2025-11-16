"use client"

import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

interface PersonaCardProps {
  name: string
  description: string
  color: string
  bgColor: string
  icon: string
}

export function PersonaCard({ name, description, color, bgColor, icon }: PersonaCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div
          className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} text-3xl transition-transform duration-300 ${isHovered ? "scale-110" : ""}`}
        >
          {icon}
        </div>

        <h3 className="mb-2 text-xl font-bold">{name}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>

        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <span>Learn more</span>
          <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
        </div>
      </div>

      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
      />
    </Card>
  )
}
