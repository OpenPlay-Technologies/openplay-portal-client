"use client"

import { ArrowLeftRight, CreditCard, History, LogOut, User, Users, Wallet } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatAddress, formatSuiAmount } from "@/lib/utils"
import { DepositModal } from "../sui/deposit-modal"
import { useState } from "react"
import { WithdrawalModal } from "../sui/withdrawal-modal"
import Link from "next/link"
import { ThemeSwitcher } from "../ui/theme-switcher"

export default function AccountSidebar() {

    const mockAddress = "0x8cb6ed24482188103415e7c73698fbd787bd8e78578f524b5cf39c3de9f1accd"

    const [depositOpen, setDepositOpen] = useState(false);
    const [withdrawalOpen, setWithdrawalOpen] = useState(false);

    const [sheetOpen, setSheetOpen] = useState(false);

    // Function to close the sheet from anywhere
    const closeSheet = () => setSheetOpen(false);

    return (
        <>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                        <User strokeWidth={2.5} />
                        <span className="sr-only">Open account menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[80%] sm:w-[400px] overflow-y-auto" side="right">
                    <SheetTitle>My Account</SheetTitle>
                    <SheetDescription className="sr-only">
                        Manage your account settings, view your balance, and review transaction history.
                    </SheetDescription>
                    <div className="flex flex-col h-full">
                        {/* Wallet Information */}
                        <div className="space-y-4 py-4">
                            <div className="px-1">
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Wallet className="h-4 w-4" />
                                    <span className="font-mono">{formatAddress(mockAddress)}</span>
                                </div>
                            </div>

                            <div className="bg-muted rounded-lg p-4 shadow-sm">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">Balance Manager</span>
                                        <span className="text-xs text-muted-foreground">{formatAddress(mockAddress)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-semibold text-foreground">{formatSuiAmount(0.44e9)}</span>
                                        <Button variant="outline" size="sm" onClick={() => { closeSheet(); }}>
                                            <Link
                                                href="/balance-manager">
                                                Switch
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Navigation Links */}
                        <nav className="flex-1 py-4">
                            <ul className="space-y-2">
                                <li>
                                    <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={() => { setDepositOpen(true); closeSheet(); }}>
                                        <CreditCard className="h-5 w-5" />
                                        <span>Deposit</span>
                                    </Button>
                                </li>
                                <li>
                                    <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={() => { setWithdrawalOpen(true); closeSheet(); }}>
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
                                        <History className="h-5 w-5" />
                                        <span>Transaction History</span>
                                    </Button>
                                </li>
                            </ul>
                        </nav>

                        <div>
                            <ThemeSwitcher />
                        </div>

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
            <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
            <WithdrawalModal open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />

        </>
    )
}

