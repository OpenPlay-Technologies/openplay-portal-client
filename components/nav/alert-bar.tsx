import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { ReactNode } from "react"

type AlertVariant = "info" | "warning" | "error" | "success"

interface AlertBarProps {
  variant: AlertVariant
  children: ReactNode
  className?: string
}

export default function AlertBar({ variant = "info", children, className = "" }: AlertBarProps) {
  // Define styling based on variant
  const styles = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-950",
      border: "border-blue-100 dark:border-blue-900",
      text: "text-blue-700 dark:text-blue-300",
      icon: "text-blue-500 dark:text-blue-400",
      Icon: Info,
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950",
      border: "border-amber-100 dark:border-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      icon: "text-amber-500 dark:text-amber-400",
      Icon: AlertTriangle,
    },
    error: {
      bg: "bg-red-50 dark:bg-red-950",
      border: "border-red-100 dark:border-red-900",
      text: "text-red-700 dark:text-red-300",
      icon: "text-red-500 dark:text-red-400",
      Icon: AlertCircle,
    },
    success: {
      bg: "bg-green-50 dark:bg-green-950",
      border: "border-green-100 dark:border-green-900",
      text: "text-green-700 dark:text-green-300",
      icon: "text-green-500 dark:text-green-400",
      Icon: CheckCircle,
    },
  }

  const { bg, border, text, icon, Icon } = styles[variant]

  return (
    <div className={`${bg} border-b ${border} px-4 py-2 ${text} h-8 ${className}`}>
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${icon}`} />
          <span className="text-xs font-medium overflow-hidden text-nowrap">{children}</span>
        </div>
      </div>
    </div>
  )
}

