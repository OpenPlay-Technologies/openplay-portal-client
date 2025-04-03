"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { cn, formatSuiAmount } from "@/lib/utils";
import { useSignTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { useInvisibleWallet } from "../providers/invisible-wallet-provider";
import { useBalanceManager } from "../providers/balance-manager-provider";
import { BALANCE_MANAGER_TYPE } from "@/api/core-constants";
import {
    buildDepositToExistingBalanceManagerTransaction,
    buildDepositToNewBalanceManagerTransaction,
    executeAndWaitForTransactionBlock,
} from "@/app/actions";
import { Transaction } from "@mysten/sui/transactions";
import { Loader } from "../ui/loader";
import { useBalance } from "../providers/balance-provider";

interface DepositModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
    // Local state declarations
    const [amount, setAmount] = useState<number | undefined>();
    const [inputValue, setInputValue] = useState("");
    const [customAmount, setCustomAmount] = useState<number | undefined>();
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [inputError, setInputError] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signing, setSigning] = useState(false);

    // Hooks and context
    const isMobile = useMobile();
    const { mutate: signTransaction } = useSignTransaction();
    const {
        setSelectedBalanceManagerId,
        refreshData,
        currentBalanceManager,
        currentBalanceManagerCap,
    } = useBalanceManager();
    const account = useCurrentAccount();
    const {
        updatePlayCaps: updateInvisWalletPlayCaps,
        walletAddress: invisWalletAddress,
    } = useInvisibleWallet();
    const {updateBalance, balance} = useBalance();

    // Preset deposit amounts in SUI
    const presetAmounts = [1e9, 5e9, 10e9, 25e9, 50e9, 100e9];

    // Reset component state when the modal opens/closes
    useEffect(() => {
        setAmount(undefined);
        setCustomAmount(undefined);
        setInputValue("");
        setIsSuccess(false);
        setErrorMsg(undefined);
        setIsSubmitting(false);
        setSigning(false);
        setInputError(undefined);
    }, [open]);

    // Close handler for successful deposit
    const handleClose = () => {
        if (isSuccess) {
            setIsSuccess(false);
            onOpenChange(false);
        }
    };

    // Deposit submission handler
    async function handleDeposit() {
        setInputError(undefined);
        setLoading(true);
        setIsSubmitting(false);
        setSigning(false);
        setErrorMsg(undefined);
        setIsSuccess(false);

        try {
            if (!account || !invisWalletAddress) {
                console.error("Account not found");
                setLoading(false);
                return;
            }

            const depositAmount = customAmount ?? amount ?? 0;
            if (!depositAmount) {
                console.error("No amount specified");
                setLoading(false);
                return;
            }

            if (depositAmount > balance) {
                setInputError("Insufficient balance");
                setLoading(false);
                return;
            }


            let bytes;
            if (currentBalanceManager && currentBalanceManagerCap) {
                bytes = await buildDepositToExistingBalanceManagerTransaction(
                    account.address,
                    currentBalanceManager.id.id,
                    currentBalanceManagerCap.id.id,
                    depositAmount,
                    invisWalletAddress
                );
            } else {
                bytes = await buildDepositToNewBalanceManagerTransaction(
                    account.address,
                    depositAmount,
                    invisWalletAddress
                );
            }

            if (!bytes) {
                console.error("Transaction bytes not found");
                setLoading(false);
                return;
            }

            const tx = Transaction.from(bytes);
            setSigning(true);

            signTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        setSigning(false);
                        setIsSubmitting(true);
                        executeAndWaitForTransactionBlock(result.bytes, result.signature)
                            .then((resp) => {
                                // TODO: fix bug where the transaction is still seen as successful even if the amount is too high and the transaction fails
                                setIsSubmitting(false);
                                setIsSuccess(true);
                                setLoading(false);
                                refreshData();
                                updateInvisWalletPlayCaps();
                                updateBalance();
                                console.log(resp.objectChanges);

                                const createdBm = resp.objectChanges?.find(
                                    (change) =>
                                        change.type === "created" &&
                                        change.objectType === BALANCE_MANAGER_TYPE &&
                                        change.objectId
                                );
                                if (createdBm && createdBm.type === "created") {
                                    console.log(createdBm.objectId);
                                    setSelectedBalanceManagerId(createdBm.objectId);
                                }
                            })
                            .catch((error) => {
                                setIsSubmitting(false);
                                setSigning(false);
                                console.error("Transaction failed", error);
                                setErrorMsg(error.message);
                                setLoading(false);
                            });
                    },
                    onError: (error) => {
                        setIsSubmitting(false);
                        setSigning(false);
                        console.error("Error signing transaction:", error);
                        setErrorMsg(error.message);
                        setLoading(false);
                    },
                }
            );
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

    // Input change handler for custom amount
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setAmount(undefined);
        const parsed = parseFloat(value);
        setCustomAmount(!isNaN(parsed) ? parsed * 1e9 : undefined);
    };

    // Content for the deposit form or success message
    const DepositContent = (
        <>
            {!isSuccess ? (
                <>
                    <div className="space-y-4 py-4">
                        <p className="text-sm">Wallet Balance: {formatSuiAmount(balance)}</p>
                        <div className="grid grid-cols-3 gap-2">
                            {presetAmounts.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={amount === preset ? "default" : "outline"}
                                    onClick={() => {
                                        setAmount(preset);
                                        setCustomAmount(undefined);
                                    }}
                                    className="w-full"
                                    disabled={preset > balance}
                                >
                                    {formatSuiAmount(preset, 0)}
                                </Button>
                            ))}
                            <div className="col-span-3 mt-2">
                                <Label htmlFor="custom-amount">Custom amount</Label>
                                <div className="flex items-center mt-1">
                                    <Input
                                        id="custom-amount"
                                        value={inputValue}
                                        onChange={handleChange}
                                        placeholder="Enter amount"
                                        className={cn("flex-1", inputError && "border-red-500")}
                                    />
                                    <span className="ml-2">SUI</span>
                                </div>
                                {inputError && <p className="text-red-500 text-sm mt-2">{inputError}</p>}
                            </div>
                        </div>

                        {signing && (
                            <Loader title="Signing Transaction" body="Please approve the deposit in your wallet." />
                        )}

                        {isSubmitting && (
                            <Loader title="Processing Deposit" body="Please wait while we process your deposit on the SUI network." />
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

                    <div className="flex justify-end">
                        <Button onClick={handleDeposit} disabled={(!amount && !customAmount) || loading}>
                            Deposit
                        </Button>
                    </div>
                </>
            ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-xl font-medium">Deposit Successful!</h3>
                    <p className="text-center text-muted-foreground">
                        Your funds have been added to your balance.
                    </p>
                    <Button onClick={handleClose} className="mt-4">
                        Close
                    </Button>
                </div>
            )}
        </>
    );

    // Render either a Drawer for mobile or a Dialog for larger screens
    return isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Deposit SUI</DrawerTitle>
                    <DrawerDescription>
                        <span>Add funds to your balance manager.</span>
                    </DrawerDescription>
                    <Alert className="mt-4 bg-muted">
                        <AlertDescription>
                            You remain in full control of these funds. They cannot be recovered if you lose access to your wallet.
                        </AlertDescription>
                    </Alert>
                </DrawerHeader>
                <div className="px-4">{DepositContent}</div>
                <DrawerFooter className="pt-2" />
            </DrawerContent>
        </Drawer>
    ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Deposit SUI</DialogTitle>
                    <DialogDescription>
                        <span>Add funds to your balance manager.</span>
                    </DialogDescription>
                    <Alert className="mt-4 bg-muted">
                        <AlertDescription>
                            You remain in full control of these funds. They cannot be recovered if you lose access to your wallet.
                        </AlertDescription>
                    </Alert>
                </DialogHeader>
                {DepositContent}
                <DialogFooter className="pt-2" />
            </DialogContent>
        </Dialog>
    );
}
