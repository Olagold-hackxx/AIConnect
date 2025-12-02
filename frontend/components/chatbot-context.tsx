"use client"

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react"

interface ChatbotContextType {
  isOpen: boolean
  openChatbot: () => void
  closeChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  // Gently auto-open the chatbot once per session after a short delay
  useEffect(() => {
    if (hasAutoOpened) return

    // Only run in the browser
    if (typeof window === "undefined") return

    const alreadyOpened = window.sessionStorage.getItem("chatbot-auto-opened")
    if (alreadyOpened) {
      setHasAutoOpened(true)
      return
    }

    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasAutoOpened(true)
      window.sessionStorage.setItem("chatbot-auto-opened", "true")
    }, 8000) // open once after ~8 seconds

    return () => clearTimeout(timer)
  }, [hasAutoOpened])

  const value = useMemo(
    () => ({
      isOpen,
      openChatbot: () => setIsOpen(true),
      closeChatbot: () => setIsOpen(false),
    }),
    [isOpen]
  )

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}
