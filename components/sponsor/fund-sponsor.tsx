"use client"

import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
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
import {buildTransferFundsTransaction} from "@/app/gas-station/actions";
import {executeAndWaitForTransactionBlock} from "@/app/actions";
import {useToast} from "@/hooks/use-toast";

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
    const {toast} = useToast();

    const [loading, setLoading] = useState<boolean>(false);

    const {mutate: signTransaction} = useSignTransaction();


    // Initialize the form
    const form = useForm<z.infer<typeof transactSchema>>({
        resolver: zodResolver(transactSchema)
    });

    // Handle successful form submission
    async function submitTransaction(values: z.infer<typeof transactSchema>) {

        if (!account) {
            toast({
                variant:"destructive",
                title: 'Account not found',
                description: 'Please connect your wallet',
            })
            return;
        }

        const bytes = await buildTransferFundsTransaction(account.address, props.sponsorAddress, values.amount);
        
        const tx = Transaction.from(bytes);
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    // console.log('Transaction executed', result);
                    setLoading(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
                      // console.log('Transaction finished');
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