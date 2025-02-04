'use client'

import React, {useEffect, useState} from 'react'
import {ArrowDownCircle, ArrowUpCircle, Plus} from 'lucide-react'
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
import {cn, formatSuiAmount} from "@/lib/utils";
import {useKeypair} from "@/components/providers/keypair-provider";
import {Card} from "@/components/ui/card";

const transactSchema = z.object({
    amount: z
        .coerce
        .number()
        .min(0),
});

export default function BalanceManagerCard() {
    const [loading, setLoading] = useState<boolean>(false);
    const [newState, setNewState] = useState<boolean>(false);
    const account = useCurrentAccount();
    const {
        selectedBalanceManagerId,
        setSelectedBalanceManagerId,
        refreshBalanceManagers,
        refreshBalanceManagerCaps,
        balanceManagerData,
        refreshPlayCaps,
        currentBalanceManager,
        currentBalanceManagerCap,
    } = useBalanceManager();
    const {
        updatePlayCaps: updateKpPlayCaps,
        activePlayCap: kpActivePlayCap,
        keypair
    } = useKeypair();
    const corePackageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;
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

    useEffect(() => {
        if (Object.entries(balanceManagerData).length == 0) {
            setNewState(true);
        }
    }, [balanceManagerData]);

    // Initialize the form
    const form = useForm<z.infer<typeof transactSchema>>({
        resolver: zodResolver(transactSchema)
    });

    // Handle successful form submission
    async function submitTransaction(values: z.infer<typeof transactSchema>, action: string) {

        if (action !== "Deposit" && action !== "Withdraw") {
            console.error('Invalid action');
            return;
        }

        if (!account || !keypair) {
            console.error('Account not found');
            return;
        }

        const tx = new Transaction();
        const amountInMist = values.amount * 1e9;

        if (action == "Deposit") {
            if (!newState && currentBalanceManager && currentBalanceManagerCap) {
                console.log("deposit on existing bm");
                const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
                tx.moveCall({
                    target: `${corePackageId}::balance_manager::deposit`,
                    arguments: [
                        tx.object(currentBalanceManager.id),
                        tx.object(currentBalanceManagerCap.id),
                        tx.object(coin)
                    ],
                });
                // We also add a play_cap during a deposit to avoid double tx costs
                const [play_cap] = tx.moveCall({
                    target: `${corePackageId}::balance_manager::mint_play_cap`,
                    arguments: [
                        tx.object(currentBalanceManager.id),
                        tx.object(currentBalanceManagerCap.id),
                    ],
                });
                tx.transferObjects([play_cap], keypair.toSuiAddress());
            } else {
                console.log("deposit on new bm");

                const [balance_manager, balance_manager_cap] = tx.moveCall({
                    target: `${corePackageId}::balance_manager::new`,
                    arguments: [],
                });
                const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
                tx.moveCall({
                    target: `${corePackageId}::balance_manager::deposit`,
                    arguments: [
                        tx.object(balance_manager),
                        tx.object(balance_manager_cap),
                        tx.object(coin)
                    ],
                });
                // We also add a play_cap during a deposit to avoid double tx costs
                const [play_cap] = tx.moveCall({
                    target: `${corePackageId}::balance_manager::mint_play_cap`,
                    arguments: [
                        tx.object(balance_manager),
                        tx.object(balance_manager_cap),
                    ],
                });
                tx.transferObjects([play_cap], keypair.toSuiAddress());

                tx.moveCall({
                    target: `${corePackageId}::balance_manager::share`,
                    arguments: [
                        tx.object(balance_manager)
                    ],
                });
                tx.transferObjects([balance_manager_cap], account.address);
            }

        }
        if (action == "Withdraw") {
            if (!currentBalanceManager || !currentBalanceManagerCap) {
                console.error('Balance manager not found');
                return;
            }
            const [coin] = tx.moveCall({
                target: `${corePackageId}::balance_manager::withdraw`,
                arguments: [
                    tx.object(currentBalanceManager.id),
                    tx.object(currentBalanceManagerCap.id),
                    tx.pure.u64(amountInMist)
                ],
            });
            tx.transferObjects([coin], account.address);
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
                        refreshBalanceManagerCaps();
                        refreshPlayCaps();
                        updateKpPlayCaps();
                        setLoading(false);
                        const createdBm = result.objectChanges?.find(
                            (change) =>
                                change.type == "created" &&
                                change.objectType == corePackageId + "::balance_manager::BalanceManager" &&
                                change.objectId
                        );
                        if (createdBm) {
                            if (createdBm.type == "created") {
                                setNewState(false);
                                setSelectedBalanceManagerId(createdBm.objectId);
                            }
                        }
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



    return (
        <Card className={"p-6 flex flex-col gap-4"}>
            <h2 className={"font-semibold"}>{Object.entries(balanceManagerData).length > 0 ? "Select your balance manager" : "Create a balance manager"}</h2>
            <div className={cn("flex flex-row justify-between h-[200px] my-4", Object.entries(balanceManagerData).length > 0 ? "w-[600px]" : "w-[300px]")}>
                {Object.entries(balanceManagerData).length > 0 && 
                <div className="w-1/3 flex flex-col border-r pr-4 h-full">
                    <div className="flex flex-col justify-between h-full">
                        <ScrollArea className="flex flex-col">
                            {Object.entries(balanceManagerData).map(([id, manager]) => (
                                <Button
                                    key={id}
                                    variant={id === selectedBalanceManagerId && !newState ? "secondary" : "ghost"}
                                    className="w-full mb-2"
                                    onClick={() => {
                                        setSelectedBalanceManagerId(id); 
                                        setNewState(false);
                                    }}
                                >
                                    <div className="flex flex-col items-start w-full">
                                        <div>{id.slice(0, 5) + "..." + id.slice(-5)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatSuiAmount(manager.balance.value)}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </ScrollArea>
                        <Button onClick={() => setNewState(true)} className="w-full h-auto"
                                variant={"outline"}>
                            <Plus className="size-4"/>
                            <span className={"text-sm"}>New</span>
                        </Button>
                    </div>
                </div>
                }
                <div className={cn("", Object.entries(balanceManagerData).length > 0 ? "w-2/3 pl-4" : "w-full")}>
                    <div className={"flex flex-col h-full"}>
                        <div className={"flex-grow h-auto"}>
                            <h3 className={"font-semibold"}>
                                {currentBalanceManager && !newState ?
                                    currentBalanceManager.id.slice(0, 5) + "..." + currentBalanceManager.id.slice(-5)
                                    :
                                    (Object.entries(balanceManagerData).length > 0 ? "Create a new balance manager" : "Make your first deposit")}
                            </h3>
                            <p className={"text-sm text-muted-foreground mb-4"}>
                                {(Object.entries(balanceManagerData).length > 0 ? "Manage your balance" : "You always still in control of your funds.")}
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <span
                                        className="text-3xl font-semibold">{formatSuiAmount(newState ? 0 : currentBalanceManager?.balance.value ?? 0)}</span>
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
                                            {selectedBalanceManagerId && !newState &&
                                                <Button className="flex-1" name="Withdraw" variant="outline"
                                                        disabled={loading}>
                                                    <ArrowDownCircle className="mr-2 h-4 w-4"/> Withdraw
                                                </Button>}
                                        </div>
                                    </form>
                                </Form>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/*<div className={"flex flex-row gap-4"}>*/}
            {/*    <div className={"flex flex-col"}>*/}
            {/*        <span>Current Session:</span>*/}
            {/*        {kpActivePlayCap ? <span className={"text-green-600"}>Active</span> :*/}
            {/*            <span className={"text-red-600"}>Inactive</span>}*/}
            {/*    </div>*/}
            {/*    {!kpActivePlayCap &&*/}
            {/*        <Button className={"w-fit h-fit"} onClick={handleRefresh}>*/}
            {/*            Refresh Session*/}
            {/*        </Button>*/}
            {/*    }*/}
            {/*</div>*/}
            <p className={"h-fit text-center cursor-pointer mx-auto text-muted-foreground underline w-fit"}
               onClick={() => disconnect()}>
                Disconnect Wallet ({account?.address.slice(0, 5) + "..." + account?.address.slice(-5)})
            </p>
        </Card>
    )
}

