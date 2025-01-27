import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSuiAmount(amount: number) {
  return (amount / 1e9).toFixed(2) + " SUI"
}


export function formatBps(bps: number) {
  return (bps / 100).toFixed(2) + "%"
}