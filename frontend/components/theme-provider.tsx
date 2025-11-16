"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useMemo } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  readonly children: React.ReactNode
  readonly defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

const THEME_STORAGE_KEY = "codian-theme"

export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage immediately to prevent flash
    if (globalThis.window !== undefined) {
      const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (stored === "dark" || stored === "light") {
        // Apply theme immediately before React hydration
        const root = globalThis.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(stored)
        return stored
      }
    }
    return defaultTheme
  })

  useEffect(() => {
    // Apply theme on mount and when it changes
    const root = globalThis.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    
    // Save to localStorage
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
