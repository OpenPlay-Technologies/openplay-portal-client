import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  title: string
  body?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Loader({ title, body, className, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 p-4 text-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} aria-hidden="true" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {body && <p className="text-sm text-muted-foreground">{body}</p>}
      </div>
    </div>
  )
}