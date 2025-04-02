"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit"
import { useBalanceManager } from "../providers/balance-manager-provider"
import { useInvisibleWallet } from "../providers/invisible-wallet-provider"
import { buildMintPlayCapTransaction } from "@/app/coin-flip/actions"
import { Transaction } from "@mysten/sui/transactions"
import { executeAndWaitForTransactionBlock } from "@/app/actions"

export default function SessionExpiredCard() {

    const handleBack = () => {
        // Navigation logic would go here
        window.history.back()
    }

    const currentAccount = useCurrentAccount();
    const { currentBalanceManager, currentBalanceManagerCap, refreshData } = useBalanceManager();
    const { walletAddress, updatePlayCaps } = useInvisibleWallet();
    const { mutate: signTransaction } = useSignTransaction();

    const handleRefresh = async () => {
        if (!currentAccount || !walletAddress) {
            console.error('Account not found');
            return;
        }

        if (!currentBalanceManager) {
            console.error('Balance manager not found');
            return;
        }

        if (!currentBalanceManagerCap) {
            console.error('Balance manager cap not found');
            return;
        }

        const bytes = await buildMintPlayCapTransaction(currentAccount.address, currentBalanceManager.id.id, currentBalanceManagerCap.id.id, walletAddress);
        const tx = Transaction.from(bytes);

        // setLoadingRefresh(true);

        signTransaction({
            transaction: tx
        },
            {
                onSuccess: (result) => {
                    // console.log('Transaction executed', result);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
                        // setLoadingRefresh(false);
                        refreshData();
                        updatePlayCaps();
                    }).catch((error) => {
                        console.error('Transaction failed', error);
                    });
                },
                onError: (error) => {
                    console.error('Transaction failed', error);
                }
            }
        );
    }

    return (
        <div className="flex items-center justify-center min-h-full w-full bg-background md:bg-transparent p-0 md:p-6">
            <Card className="w-full h-full md:h-auto md:max-w-md shadow-none md:shadow-lg rounded-none md:rounded-xl border-0 md:border flex flex-col">
                <CardHeader className="pb-4 md:pb-6">
                    <CardTitle className="text-xl font-semibold text-center md:text-left">Session Expired</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center space-y-3 pb-6">
                    <p className="text-muted-foreground text-center md:text-left">Your current session is not authorized to transact with your balance manager.</p>
                    <p className="text-muted-foreground text-center md:text-left">Please refresh your session to continue playing.</p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2 pb-8 md:pb-6">
                    <Button
                        onClick={handleRefresh}
                        className="w-full max-w-sm"
                        size="lg"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Session
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="w-full max-w-sm"
                        size="lg"
                    >
                        {/* <ArrowLeft className="mr-2 h-4 w-4" /> */}
                        Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}