"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const gameTypes = [
  { id: "all", label: "All Games" },
  { id: "coinflip", label: "Coin Flip" },
  { id: "roulette", label: "Roulette" },
  { id: "slots", label: "Slots" },
]

const orderOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
]

export default function GameSelector() {
  const [selectedGameType, setSelectedGameType] = useState("all")
  const [orderBy, setOrderBy] = useState("popular")

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-auto">
          <div className="flex flex-wrap gap-2" role="tablist">
            {gameTypes.map((type) => (
              <button
                key={type.id}
                role="tab"
                aria-selected={selectedGameType === type.id}
                aria-controls={`tabpanel-${type.id}`}
                onClick={() => setSelectedGameType(type.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  selectedGameType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        <Select value={orderBy} onValueChange={setOrderBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Order by" />
          </SelectTrigger>
          <SelectContent>
            {orderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

