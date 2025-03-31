"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Plus, Wallet, ArrowDownToLine, PlusCircle, ArrowUpFromLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface BalanceManager {
  id: string
  address: string
  balance: number
  selected: boolean
}

export default function BalanceManagerPage() {
  const [balanceManagers, setBalanceManagers] = useState<BalanceManager[]>([
    // Comment out this sample data to test the onboarding flow
    {
      id: "1",
      address: "0x1234...5678",
      balance: 1250.75,
      selected: true,
    },
    {
      id: "2",
      address: "0x8765...4321",
      balance: 450.25,
      selected: false,
    },
  ])

  const [newAddress, setNewAddress] = useState("")

  const handleSelectManager = (id: string) => {
    setBalanceManagers(
      balanceManagers.map((manager) => ({
        ...manager,
        selected: manager.id === id,
      })),
    )
  }

  const handleCreateManager = () => {
    if (!newAddress) return

    const newManager: BalanceManager = {
      id: `${balanceManagers.length + 1}`,
      address: newAddress,
      balance: 0,
      selected: balanceManagers.length === 0, // Select if it's the first one
    }

    setBalanceManagers([
      ...balanceManagers.map((manager) => ({
        ...manager,
        selected: balanceManagers.length === 0 ? false : manager.selected,
      })),
      newManager,
    ])
    setNewAddress("")
  }

  const selectedManager = balanceManagers.find((manager) => manager.selected)

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">Balance Manager</h1>
      <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-12">
      Effortlessly manage your on-chain funds for a seamless gaming experience.
      </p>

      {balanceManagers.length > 0 ? (
        <div className="grid gap-8 md:gap-12">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Current Balance Manager</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Your currently selected balance manager for games
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedManager && (
                <div className="rounded-lg border bg-muted/30">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                          <Wallet className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-base md:text-lg">{selectedManager.address}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">Active Balance Manager</p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto">
                        <div className="font-bold text-xl md:text-2xl text-center md:text-right">
                          {selectedManager.balance.toFixed(2)} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t bg-muted/10 p-3 md:p-4 flex flex-col sm:flex-row gap-2 md:gap-3 justify-end">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowDownToLine className="h-4 w-4" />
                      Deposit
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowUpFromLine className="h-4 w-4" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Your Balance Managers</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Select a balance manager to use for your games
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:gap-6">
                    {balanceManagers.map((manager) => (
                      <div
                        key={manager.id}
                        className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6 border rounded-lg ${
                          manager.selected ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 md:p-3 rounded-full">
                            <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div>
                            <p className="font-medium text-base md:text-lg">{manager.address}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {manager.balance.toFixed(2)} ETH
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          {manager.selected ? (
                            <Button variant="outline" className="flex-1 md:flex-none" disabled>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Selected
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1 md:flex-none"
                              onClick={() => handleSelectManager(manager.id)}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start pt-4 md:pt-6">
                  <div
                    key="new-balance-manager"
                    className="flex flex-col w-full md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6 border-2 border-dashed rounded-lg hover:bg-muted/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 md:p-3 rounded-full">
                        <PlusCircle className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-base md:text-lg text-muted-foreground">
                          New Balance Manager
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Create a fresh balance manager
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">About Balance Managers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">What is a Balance Manager?</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      A Balance Manager is an on-chain object that holds your balance for gaming. Each manager has a
                      unique address and maintains its own balance.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">How They Work With Games</h3>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Place bets and wagers from your balance</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Receive winnings directly to your manager</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Track gaming history and transactions</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Isolate gaming funds from your main wallet</span>
                      </li>
                    </ul>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      You can switch between balance managers at any time, but only the selected manager will be used for new games.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl">Welcome to Balance Managers</CardTitle>
            <CardDescription className="text-sm md:text-base">
              You don&apos;t have any balance managers yet. Let&apos;s create your first one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 md:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <div className="md:col-span-2">
                <div className="bg-muted/30 p-4 md:p-8 rounded-lg h-full">
                  <h3 className="text-lg md:text-xl font-medium mb-4 md:mb-6">What is a Balance Manager?</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-8 leading-relaxed">
                    A Balance Manager is an on-chain object that holds your balance for gaming. Each balance manager has
                    a unique address and maintains its own balance, allowing you to separate and manage your gaming funds.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-8">
                    <div className="p-4 md:p-6 border rounded-lg bg-background">
                      <h4 className="font-medium text-base md:text-lg mb-2 md:mb-3">Secure Gaming</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Keep your gaming funds separate from your main wallet for added security.
                      </p>
                    </div>
                    <div className="p-4 md:p-6 border rounded-lg bg-background">
                      <h4 className="font-medium text-base md:text-lg mb-2 md:mb-3">Multiple Balances</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Create different managers for different games or betting strategies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-muted/30 p-4 md:p-8 rounded-lg h-full">
                  <h4 className="font-medium text-base md:text-lg mb-2 md:mb-3">Easy Switching</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                    Switch between balance managers anytime based on your gaming needs.
                  </p>
                  <Alert className="mb-4 md:mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>Only the selected manager will be used for new games.</AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 md:pt-8">
              <h3 className="text-lg md:text-xl font-medium mb-4 md:mb-6">Create Your First Balance Manager</h3>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2 w-full md:w-auto">
                  <Button onClick={handleCreateManager} size="lg" className="flex-1 md:flex-none">
                    <Plus className="mr-2 h-5 w-5" /> Create Manager
                  </Button>
                  <Button
                    onClick={() => newAddress && handleCreateManager()}
                    variant="outline"
                    size="lg"
                    disabled={!newAddress}
                    className="flex-1 md:flex-none"
                  >
                    <ArrowDownToLine className="mr-2 h-5 w-5" /> Create & Deposit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
