'use client'

import React, {useState} from 'react'
import {Plus, ArrowUpCircle, ArrowDownCircle} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {ScrollArea} from "@/components/ui/scroll-area"
import {useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {useBalanceManager} from "@/components/providers/balance-manager-provider";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Transaction} from '@mysten/sui/transactions';
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Progress} from "@/components/ui/progress";
import {formatSuiAmount} from "@/lib/utils";

const transactSchema = z.object({
    amount: z
        .coerce
        .number()
        .min(0),
});

export default function BalanceManagerCard() {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingCreate, setLoadingCreate] = useState<boolean>(false);
    const account = useCurrentAccount();
    const {
        balanceManagers,
        selectedBalanceManager,
        setSelectedBalanceManager,
        refreshBalanceManagers,
    } = useBalanceManager();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;

    const {mutate: disconnect} = useDisconnectWallet();

    const suiClient = useSuiClient();
    const {mutate: signAndExecuteTransaction} = useSignAndExecuteTransaction({
        execute: async ({bytes, signature}) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    // Raw effects are required so the effects can be reported back to the wallet
                    showRawEffects: true,
                    // Select additional data to return
                    showObjectChanges: true,
                },
            }),
    });

    const currentBalanceManager = balanceManagers.find(manager => manager.id === selectedBalanceManager);

    // Initialize the form
    const form = useForm<z.infer<typeof transactSchema>>({
        resolver: zodResolver(transactSchema)
    });

    // Handle successful form submission
    async function submitTransaction(values: z.infer<typeof transactSchema>, action: string) {
        if (!currentBalanceManager) {
            console.error('Balance manager not found');
            return;
        }
        
        if (action !== "Deposit" && action !== "Withdraw") {
            console.error('Invalid action');
            return;
        }
        
        const tx = new Transaction();
        const amountInMist = values.amount * 1e9;
        
        if (action == "Deposit") {
            const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
            tx.moveCall({
                target: `${packageId}::balance_manager::deposit`,
                arguments: [
                    tx.object(currentBalanceManager.id),
                    tx.object(coin)
                ],
            });
        }
        if (action == "Withdraw") {
            const [coin] = tx.moveCall({
                target: `${packageId}::balance_manager::withdraw`,
                arguments: [
                    tx.object(currentBalanceManager.id),
                    tx.pure.u64(amountInMist)
                ],
            });
            tx.transferObjects([coin], account!.address);
        }

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoading(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        console.log('Transaction finished');
                        refreshBalanceManagers();
                        setLoading(false);
                        form.reset();
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

    const createManager = () => {
        if (!account) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();
        const [balance_manager] = tx.moveCall({
            target: `${packageId}::balance_manager::new`,
            arguments: [
            ],
        });
        tx.transferObjects([balance_manager], account.address);

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingCreate(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        console.log('Transaction finished');
                        refreshBalanceManagers();
                        setLoadingCreate(false);
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
        <div className="flex w-[600px]">
            <div className="w-1/3 border-r p-6">
                <h3 className={"font-semibold mb-2"}>
                    Balance Managers
                </h3>
                <ScrollArea className="flex flex-col h-[250px] pr-4">
                    {balanceManagers.map(manager => (
                        <Button
                            key={manager.id}
                            variant={manager.id === selectedBalanceManager ? "secondary" : "ghost"}
                            className="w-full mb-2"
                            onClick={() => setSelectedBalanceManager(manager.id)}
                        >
                            <div className="flex flex-col items-start w-full">
                                <div>{manager.id.slice(0, 5) + "..." + manager.id.slice(-5)}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatSuiAmount(manager.balance.value)}
                                </div>
                            </div>
                        </Button>
                    ))}
                    {loadingCreate && <p>Loading...</p>}
                </ScrollArea>
                <Button onClick={createManager} className="w-full h-auto mt-2" disabled={loadingCreate}>
                    <Plus className="size-4"/>
                    <span className={"text-sm"}>New</span>
                </Button>
            </div>
            <div className="w-2/3 p-4">
                <div className={"flex flex-col h-full"}>
                    {currentBalanceManager ? (
                        <div className={"flex-grow h-auto"}>
                            <h3 className={"font-semibold"}>
                                {currentBalanceManager.id.slice(0, 5) + "..." + currentBalanceManager.id.slice(-5)}
                            </h3>
                            <p className={"text-sm text-muted-foreground mb-4"}>
                                Manage your balance
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <span
                                        className="text-3xl font-semibold">{currentBalanceManager.balance.value / 1e9} SUI</span>
                                </div>
                                <Form {...form}>
                                    <form onSubmit={(e) => {
                                        const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("name");
                                        form.handleSubmit((values) => submitTransaction(values, action ?? ""))(e);
                                    }}>
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({field}) => (
                                                <FormItem className={"mb-4"}>
                                                    <FormControl>
                                                        <Input
                                                            disabled={loading}
                                                            type={"number"} 
                                                            placeholder="Amount"
                                                            step={0.000000001}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex space-x-2">
                                            <Button className="flex-1" name="Deposit" disabled={loading}>
                                                <ArrowUpCircle className="mr-2 h-4 w-4"/> Deposit
                                            </Button>
                                            <Button className="flex-1" name="Withdraw" variant="outline" disabled={loading}>
                                                <ArrowDownCircle className="mr-2 h-4 w-4"/> Withdraw
                                            </Button>
                                        </div>
                                        {loading && <Progress indeterminate={true} className={"h-1 my-4"} />}
                                    </form>
                                </Form>

                            </div>
                        </div>
                    ) : (
                        <div className="h-full px-6 flex items-center justify-center">
                            <p className="text-muted-foreground">Select a balance manager or create a new one</p>
                        </div>
                    )}
                    <p className={"underline text-muted-foreground mb-2 h-fit text-center cursor-pointer mx-auto"}
                       onClick={() => disconnect()}>
                        Disconnect wallet
                    </p>
                </div>
            </div>
        </div>
    )
}

