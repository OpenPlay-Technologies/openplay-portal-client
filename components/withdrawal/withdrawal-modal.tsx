"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { CheckCircle2, Wallet } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { cn, formatAddress, formatSuiAmount } from "@/lib/utils"

// New imports to implement real withdrawal logic (similar to deposit modal)
import { useSignTransaction, useCurrentAccount } from "@mysten/dapp-kit"
import { useInvisibleWallet } from "../providers/invisible-wallet-provider"
import { useBalanceManager } from "../providers/balance-manager-provider"
import { Transaction } from "@mysten/sui/transactions"
import { buildWithdrawFromBalanceManagerTransaction, executeAndWaitForTransactionBlock } from "@/app/actions"
import { Loader } from "../ui/loader"
import { useBalance } from "../providers/balance-provider"

interface WithdrawalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
    // Local state declarations
    const [percentage, setPercentage] = useState<number>(50)
    const [isSuccess, setIsSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [signing, setSigning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | undefined>()
    const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);

    // Hooks from deposit modal logic
    const isMobile = useMobile()
    const { mutate: signTransaction } = useSignTransaction()
    const account = useCurrentAccount()
    const { walletAddress: invisWalletAddress, updatePlayCaps: updateInvisWalletPlayCaps } = useInvisibleWallet()
    const { currentBalanceManager, currentBalanceManagerCap, refreshData } = useBalanceManager();
    const {updateBalance} = useBalance();

    // Compute withdrawal amount based on slider percentage
    // const withdrawalAmount = currentBalanceManager ? Math.round(currentBalanceManager.balance * percentage / 100) : 0

    // Reset transient states when modal opens/closes
    useEffect(() => {
        setTimeout(() => {
            setIsSuccess(false)
            setErrorMsg(undefined)
            setLoading(false)
            setSigning(false)
            setIsSubmitting(false)
            setPercentage(50)
        }, 500)
    }, [open])

    // Withdrawal submission handler with real transaction logic
    async function handleWithdrawal() {
        setLoading(true)
        setIsSubmitting(false)
        setSigning(false)
        setErrorMsg(undefined)
        setIsSuccess(false)

        try {
            // Check if necessary wallet and account info exist
            if (!account || !invisWalletAddress) {
                throw new Error("No wallet connected")
            }

            if (!withdrawalAmount) {
                throw new Error("Withdrawal amount cannot be zero");;
            }

            if (!currentBalanceManager || !currentBalanceManagerCap) {
                throw new Error("No balance manager or cap found");
            }
            const bytes = await buildWithdrawFromBalanceManagerTransaction(account.address, currentBalanceManager.id.id, currentBalanceManagerCap.id.id, withdrawalAmount);

            if (!bytes) {
                throw new Error("Failed to build transaction bytes");
            }

            const tx = Transaction.from(bytes)
            setSigning(true)

            signTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        setSigning(false)
                        setIsSubmitting(true)
                        executeAndWaitForTransactionBlock(result.bytes, result.signature)
                            .then(() => {
                                setIsSubmitting(false)
                                setIsSuccess(true)
                                updateBalance();
                                refreshData();
                                updateInvisWalletPlayCaps();
                            })
                            .catch((error) => {
                                setIsSubmitting(false)
                                setSigning(false)
                                setLoading(false)
                                setIsSuccess(false)
                                console.error("Transaction failed", error)
                                setErrorMsg(error.message)
                            })
                    },
                    onError: (error) => {
                        setIsSubmitting(false)
                        setSigning(false)
                        setLoading(false)
                        setIsSuccess(false)
                        console.error("Error signing transaction:", error)
                        setErrorMsg(error.message)
                    },
                }
            )
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : "An unknown error occurred"
            setErrorMsg(errorMsg)
            console.error("Error during withdrawal:", errorMsg)

            setLoading(false);
            setSigning(false);
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    }

    useEffect(() => {
        if (!isSuccess && currentBalanceManager) {
            const withdrawalAmount = Math.round(currentBalanceManager.balance * percentage / 100);
            setWithdrawalAmount(withdrawalAmount)
        }
    }, [percentage, isSuccess, currentBalanceManager])

    // Handle closing the modal once the withdrawal is successful
    const handleClose = () => {
        onOpenChange(false);
    }

    // Handle slider percentage changes
    const handlePercentageChange = (value: number[]) => {
        setPercentage(value[0])
    }

    // Preset percentage buttons handler
    const setPresetPercentage = (value: number) => {
        setPercentage(value)
    }

    // Content for withdrawal form or success message
    const WithdrawalContent = (
        <>
            {!isSuccess ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="p-4 rounded-lg border bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">Withdrawal Amount</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold">{formatSuiAmount(withdrawalAmount)}</div>
                                    <div className="text-xs text-muted-foreground">{percentage}% of balance</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Amount to withdraw</Label>
                            <Slider
                                defaultValue={[100]}
                                max={100}
                                step={1}
                                value={[percentage]}
                                onValueChange={handlePercentageChange}
                                className="my-6"
                            />
                            <div className="flex flex-wrap gap-2">
                                {[25, 50, 75, 100].map((value) => (
                                    <Button
                                        key={value}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPresetPercentage(value)}
                                        className={cn("flex-1 min-w-[60px]", percentage === value && "border-primary bg-primary/10")}
                                    >
                                        {value}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Alerts for transaction progress/errors */}
                        {signing && (
                            <Loader title="Signing Transaction" body="Please approve the withdrawal in your wallet." className="mt-4" />
                        )}

                        {isSubmitting && (
                            <Loader title="Processing Withdrawal" body="Please wait while we process your withdrawal on the SUI network." className="mt-4" />
                        )}

                        {errorMsg && (
                            <Alert variant="destructive">
                                <AlertTitle>Something went wrong</AlertTitle>
                                <AlertDescription>
                                    {errorMsg}
                                    <br />
                                    Please try again or contact support.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Button onClick={handleWithdrawal} disabled={loading || percentage === 0} className="w-full">
                        Withdraw {formatSuiAmount(withdrawalAmount)}
                    </Button>
                </div>
            ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-xl font-medium">Withdrawal Successful!</h3>
                    <p className="text-center text-muted-foreground">
                        {formatSuiAmount(withdrawalAmount)} has been sent to your wallet.
                    </p>
                    <Button onClick={handleClose} className="mt-4">
                        Close
                    </Button>
                </div>
            )}
        </>
    )

    // Render as a Drawer on mobile and Dialog on larger screens
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Withdraw Funds</DrawerTitle>
                        <DrawerDescription>Withdraw funds from your balance manager to your wallet.</DrawerDescription>
                        <Alert className="bg-muted/50">
                            <AlertDescription>
                                Funds are automatically withdrawn to your connected wallet: {account ? formatAddress(account.address) : "Unknown"}
                            </AlertDescription>
                        </Alert>
                    </DrawerHeader>
                    <div className="px-4 py-4">{WithdrawalContent}</div>
                    <DrawerFooter className="pt-2" />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                        Withdraw funds from your balance manager to your wallet.
                    </DialogDescription>
                    <Alert className="bg-muted/50">
                        <AlertDescription>
                            Funds are automatically withdrawn to your connected wallet: {account ? formatAddress(account.address) : "Unknown"}
                        </AlertDescription>
                    </Alert>
                </DialogHeader>
                {WithdrawalContent}
                <DialogFooter className="pt-2" />
            </DialogContent>
        </Dialog>
    )
}
