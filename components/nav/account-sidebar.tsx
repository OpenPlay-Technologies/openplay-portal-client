"use client"

import { ArrowDownToLine, ArrowUpFromLine, ArrowUpRight, Gift, History, LifeBuoy, LogOut, RefreshCw, User, Users } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatAddress, formatSuiAmount } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { ThemeSwitcher } from "../ui/theme-switcher"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { useBalanceManager } from "../providers/balance-manager-provider"
import { useWalletAuth } from "../providers/wallet-auth-context-provider"
import { useRouter } from "next/navigation"
import { useDepositModal } from "../providers/deposit-modal-provider"
import { useWithdrawalModal } from "../providers/withdrawal-modal-provider"
import { useBalance } from "../providers/balance-provider"

export default function AccountSidebar() {

    const currentAccount = useCurrentAccount();
    const { currentBalanceManager, bmLoading } = useBalanceManager();

    const { openDepositModal } = useDepositModal();
    const { openWithdrawalModal } = useWithdrawalModal();

    const { balance } = useBalance();


    const { mutate: disconnect } = useDisconnectWallet();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { onWalletDisconnect } = useWalletAuth();
    const router = useRouter();

    // Function to close the sheet from anywhere
    const closeSheet = () => setSheetOpen(false);

    return (
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
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs text-muted-foreground">Connected Wallet</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* <Wallet className="h-4 w-4" /> */}
                                        <span className="text-sm">
                                            {currentAccount?.address ? formatAddress(currentAccount.address) : "Unknown"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Balance</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* <Bitcoin className="h-4 w-4" /> */}
                                        <span className="text-sm">
                                            {formatSuiAmount(balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {bmLoading ? (
                            <div className="bg-muted rounded-lg p-4 shadow-sm animate-pulse dark:bg-muted">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col space-y-1">
                                            {/* Title placeholder */}
                                            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
                                            {/* Address placeholder */}
                                            <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded mt-0.5" />
                                        </div>
                                        {/* See Details placeholder */}
                                        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        {/* Balance placeholder */}
                                        <div className="h-6 w-28 bg-gray-300 dark:bg-gray-600 rounded" />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {/* Deposit button placeholder */}
                                        <div className="h-8 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
                                        {/* Withdraw button placeholder */}
                                        <div className="h-8 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-muted rounded-lg p-4 shadow-sm">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">Balance Manager</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{currentBalanceManager ? formatAddress(currentBalanceManager.id.id) : ""}</span>
                                        </div>
                                        <Link
                                            href="/balance-manager"
                                            className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
                                            onClick={closeSheet}
                                        >
                                            <span>See More</span>
                                            <ArrowUpRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-2xl font-semibold text-foreground">{formatSuiAmount(currentBalanceManager ? currentBalanceManager.balance : 0)}</span>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant={"accent"} className="flex-1" onClick={() => { openDepositModal(); closeSheet(); }}>
                                            <ArrowDownToLine className="h-4 w-4" />
                                            Deposit
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => { openWithdrawalModal(); closeSheet(); }}>
                                            <ArrowUpFromLine className="h-4 w-4" />
                                            Withdraw
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Navigation Links */}
                    <nav className="flex-1 py-4">
                        <ul className="space-y-2">
                            {/* <li>
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
                                </li> */}
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
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <RefreshCw className="h-5 w-5" />
                                    <span>Free Spins</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <Gift className="h-5 w-5" />
                                    <span>Bonuses</span>
                                </Button>
                            </li>
                            <li>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                    <LifeBuoy className="h-5 w-5" />
                                    <span>Responsible Gaming</span>
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
                        <Button variant="outline" className="w-full justify-start gap-3" onClick={() => { onWalletDisconnect(); disconnect(); closeSheet(); router.push("/"); }}>
                            <LogOut className="h-5 w-5" />
                            <span>Disconnect Wallet</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

