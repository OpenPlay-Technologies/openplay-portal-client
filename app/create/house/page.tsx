"use client"
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React from "react";
import {Card} from "@/components/ui/card";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
import {Transaction} from '@mysten/sui/transactions';
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import { Switch } from "@/components/ui/switch";
import {ToastAction} from "@/components/ui/toast";
import {useRouter} from "next/navigation";
import {HOUSE_TYPE} from "@/api/core-constants";
import {BuildCreateHouseTransaction} from "@/app/create/house/actions";
import {executeAndWaitForTransactionBlock} from "@/app/actions";


const createHouseSchema = z.object({
    private: z
        .boolean()
        .default(true),
    target_balance: z
        .coerce
        .number()
        .min(0),
    house_fee_bps: z
        .coerce
        .number()
        .min(0),
    referral_fee_bps: z
        .coerce
        .number()
        .min(0),
});


export default function CreateHouse() {
    const router = useRouter();
    const account = useCurrentAccount();
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    const {mutate: signTransaction} = useSignTransaction();
    

    // Initialize the form
    const form = useForm<z.infer<typeof createHouseSchema>>({
        resolver: zodResolver(createHouseSchema)
    });

    // Handle successful form submission
    async function onSubmit(values: z.infer<typeof createHouseSchema>) {

        if (!account) {
            toast({
                variant:"destructive",
                title: 'Account not found',
                description: 'Please connect your wallet',
            })
            return;
        }

        const bytes = await BuildCreateHouseTransaction(account.address, values.private, values.target_balance, values.house_fee_bps, values.referral_fee_bps);
        const tx = Transaction.from(bytes);
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    // console.log('Transaction executed', result);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(resp => {
                        const createdHouse = resp.objectChanges?.find(
                            (change) =>
                                change.type == "created" &&
                                change.objectType == HOUSE_TYPE &&
                                change.objectId
                        );
                        if (createdHouse) {
                            if (createdHouse.type == "created") {
                                const houseId = createdHouse.objectId;
                                toast({
                                    title: "Transaction successful",
                                    description: 'The house has been created successfully',
                                    action: 
                                        <ToastAction altText="Visit" onClick={() => router.push(`/house/${houseId}`)}>
                                        Visit
                                        </ToastAction>,
                                });
                            }
                        }
                        else {
                            toast({
                                title: "Transaction successful",
                                description: 'The house has been created successfully',
                            });
                        }
                        form.reset();
                        updateBalance();
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        });
                        updateBalance();
                    });
                },
                onError: (error) => {
                    toast({
                        variant:"destructive",
                        title: 'Transaction failed',
                        description: error.message,
                    })
                }
            });
    }


    return (
        <Card className={"flex flex-col p-6 max-h-[90%] min-h-fit"}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/*<Link href={"/create"} className={"w-fit"}>*/}
                    {/*    <Button variant={"secondary"} className={"inline-flex gap-2 flex-grow w-fit mb-6"}>*/}
                    {/*        <ArrowLeftIcon/>*/}
                    {/*        <span>Back</span>*/}
                    {/*    </Button>*/}
                    {/*</Link>*/}

                    {/*Text*/}
                    <div className={"mb-4"}>
                        <h1 className={"text-2xl font-semibold"}>
                            Create House
                        </h1>
                        <p>
                            A house on the openplay platform.
                        </p>
                    </div>

                    <div className={"w-full h-auto min-w-72 flex flex-col gap-4"}>
                        <FormField
                            control={form.control}
                            name="private"
                            render={({field}) => (
                                <FormItem className={"inline-flex justify-between items-center"}>
                                    <div className={"flex flex-col w-[80%]"}>
                                        <FormLabel>Private House</FormLabel>
                                        <p className={"text-muted-foreground text-sm mt-1"}>
                                            If the house is private, only the admin can participate in the house.</p>
                                    </div>
                                    <FormControl>
                                        <div>
                                            <Switch
                                                checked={field.value ?? true}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="target_balance"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>The target balance of the house (in SUI)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type={"number"} 
                                            placeholder="Target balance"
                                            {...field}
                                            value={String(field.value / 1e9) ?? ""} // Convert bps back to percentage for display
                                            onChange={(e) => {
                                                field.onChange(Number(e.target.value) * 1e9); // Convert percentage to bps
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="house_fee_bps"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>The fee on all bets that is taken by the house (in %)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type={"number"}
                                            step="0.01"
                                            min={0}
                                            placeholder="Game fee"
                                            {...field}
                                            value={String(field.value / 100) ?? ""} // Convert bps back to percentage for display
                                            onChange={(e) => {
                                                const percentage = parseFloat(e.target.value);
                                                field.onChange(Math.round(percentage * 100)); // Convert percentage to bps
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="referral_fee_bps"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>The fee on all bets that can be taken by the referrers (in %)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type={"number"}
                                            step="0.01"
                                            min={0}
                                            placeholder="Referral fee"
                                            {...field}
                                            value={String(field.value / 100) ?? ""} // Convert bps back to percentage for display
                                            onChange={(e) => {
                                                const percentage = parseFloat(e.target.value);
                                                field.onChange(Math.round(percentage * 100)); // Convert percentage to bps
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button className={"w-full my-4"} type={"submit"}>
                        Create House
                    </Button>
                </form>
            </Form>
        </Card>
    )
}