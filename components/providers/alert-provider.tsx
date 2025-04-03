"use client";
import { createContext, useCallback, useContext, useState } from "react"
import type { ReactNode } from "react"

export type AlertVariant = "info" | "warning" | "error" | "success"

export interface Alert {
    id: string
    variant: AlertVariant
    content: ReactNode
}

interface AlertContextType {
    alerts: Alert[];
    showAlert: (variant: AlertVariant, content: ReactNode, duration?: number) => void;
    alertHeight: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

let alertId = 0

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const initialAlerts: Alert[] = [];
    const network = process.env.NEXT_PUBLIC_NETWORK ?? "localnet";

    if (network !== "mainnet") {
        initialAlerts.push({
            id: String(alertId++),
            variant: "info",
            content: <span>This is a {network} environment.</span>,
        });
    }

    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

    const showAlert = useCallback(
        (variant: AlertVariant, content: ReactNode, duration = 3000) => {
            const id = String(alertId++)
            const newAlert: Alert = { id, variant, content }
            setAlerts((prev) => [...prev, newAlert])

            setTimeout(() => {
                setAlerts((prev) => prev.filter((a) => a.id !== id))
            }, duration)
        },
        []
    )

    return (
        <AlertContext.Provider value={{ alerts, showAlert, alertHeight: alerts.length * 32 }}>
            {children}
        </AlertContext.Provider>
    )
}

export const useAlert = (): AlertContextType => {
    const ctx = useContext(AlertContext)
    if (!ctx) throw new Error("useAlert must be used within an AlertProvider")
    return ctx
}
