"use client"

import { ArrowLeftRight, Clock, CreditCard, History, LogOut, User, Users, Wallet } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatAddress, formatSuiAmount } from "@/lib/utils"

export default function AccountSidebar() {

    const mockAddress = "0x8cb6ed24482188103415e7c73698fbd787bd8e78578f524b5cf39c3de9f1accd"


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <User strokeWidth={2.5}/>
                    <span className="sr-only">Open account menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[80%] sm:w-[400px] overflow-y-auto" side="right">
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <div className="flex flex-col h-full">
                    {/* Wallet Information */}
                    <div className="space-y-4 py-4">
                        <div className="px-1">
                            <h2 className="text-lg font-semibold">Wallet</h2>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                <span className="font-mono">{formatAddress(mockAddress)}</span>
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Balance</span>
                                <span className="font-medium">{formatSuiAmount(0.44e9)}</span>
                            </div>

                            {/* Balance Manager */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Balance Manager</span>
                                    <span className="text-sm font-medium">{formatAddress(mockAddress)}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-3"
                                >
                                    Switch Balance Manager
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Navigation Links */}
                    <nav className="flex-1 py-4">
                        <ul className="space-y-2">
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Deposit</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <ArrowLeftRight className="h-5 w-5" />
                                    <span>Withdraw</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <Users className="h-5 w-5" />
                                    <span>Referrals</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <Clock className="h-5 w-5" />
                                    <span>Gameplay History</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <History className="h-5 w-5" />
                                    <span>Transaction History</span>
                                </Button>
                            </li>
                        </ul>
                    </nav>

                    <Separator />

                    {/* Logout Button */}
                    <div className="py-4">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <LogOut className="h-5 w-5" />
                            <span>Disconnect Wallet</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

