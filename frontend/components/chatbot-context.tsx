"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"

interface ChatbotContextType {
  isOpen: boolean
  openChatbot: () => void
  closeChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  // Auto-open chatbot once after a delay (only once per page load/session)
  useEffect(() => {
    if (!hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasAutoOpened(true)
      }, 2000) // 2 second delay

      return () => clearTimeout(timer)
    }
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
