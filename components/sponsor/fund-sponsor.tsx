"use client"

import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import Wallet from "@/components/sui/wallet";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ArrowUpCircle} from "lucide-react";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Transaction} from "@mysten/sui/transactions";
import {useRouter} from "next/navigation";

const transactSchema = z.object({
    amount: z
        .coerce
        .number()
        .min(0),
});

interface FundSponsorProps {
    sponsorAddress: string;
}

export default function FundSponsor(props: FundSponsorProps) {
    const router = useRouter();
    const account = useCurrentAccount();

    const [loading, setLoading] = useState<boolean>(false);

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

    // Initialize the form
    const form = useForm<z.infer<typeof transactSchema>>({
        resolver: zodResolver(transactSchema)
    });

    // Handle successful form submission
    async function submitTransaction(values: z.infer<typeof transactSchema>) {

        const tx = new Transaction();
        const amountInMist = values.amount * 1e9;

        const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
        tx.transferObjects([coin], props.sponsorAddress);

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
                        router.refresh();
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

    return (
        <div>
            {!account && <Wallet/>}
            {account &&
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(submitTransaction)}>
                            <div className={"inline-flex gap-4"}>
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({field}) => (
                                        <FormItem className={"mb-2"}>
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
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            }
        </div>
    )

}