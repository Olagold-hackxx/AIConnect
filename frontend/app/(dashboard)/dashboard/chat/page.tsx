"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient, Assistant as ApiAssistant } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Send, Bot, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  role: "user" | "assistant"
  content: string
  id?: string
}

// Use API Assistant type, extend with local properties
type Assistant = ApiAssistant & {
  type?: string
  name?: string
}

export default function ChatPage() {
  const { toast } = useToast()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAssistants()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadAssistants() {
    try {
      const response = await apiClient.listAssistants()
      const activeAssistants = (response.assistants || []).filter((a) => a.is_active)
      setAssistants(activeAssistants)
      if (activeAssistants.length > 0 && !selectedAssistant) {
        setSelectedAssistant(activeAssistants[0].id)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load assistants",
        variant: "destructive",
      })
    }
  }

  async function handleSend() {
    if (!input.trim() || !selectedAssistant || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let assistantMessage = ""
      await apiClient.streamChat(
        selectedAssistant,
        input,
        (chunk) => {
          assistantMessage += chunk
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage?.role === "assistant") {
              return [...prev.slice(0, -1), { ...lastMessage, content: assistantMessage }]
            }
            return [...prev, { role: "assistant" as const, content: assistantMessage }]
          })
        },
        sessionId || undefined
      )

      // Update session ID if we got one from the response
      if (!sessionId) {
        // Session ID would come from the response, but for now we'll generate one
        setSessionId(`session-${Date.now()}`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Start a conversation with your AI assistant</p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select an assistant" />
          </SelectTrigger>
          <SelectContent>
            {assistants.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>
                {assistant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a conversation by typing a message below
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-75" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type your message..."
              disabled={!selectedAssistant || isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!selectedAssistant || !input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

