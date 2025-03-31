"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative flex h-9 items-center rounded-lg bg-muted p-1">
        {/* System Theme */}
        <button
          onClick={() => setTheme("system")}
          className={cn(
            "relative flex h-7 w-20 items-center justify-center rounded-md text-sm transition-colors",
            theme === "system" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Monitor className="mr-1 h-4 w-4" />
          <span>System</span>
        </button>

        {/* Light Theme */}
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "relative flex h-7 w-20 items-center justify-center rounded-md text-sm transition-colors",
            theme === "light" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sun className="mr-1 h-4 w-4" />
          <span>Light</span>
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "relative flex h-7 w-20 items-center justify-center rounded-md text-sm transition-colors",
            theme === "dark" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Moon className="mr-1 h-4 w-4" />
          <span>Dark</span>
        </button>
      </div>
    </div>
  )
}

