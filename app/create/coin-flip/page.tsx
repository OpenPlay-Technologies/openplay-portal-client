"use client"
import FileUploadBox from "@/components/ui/file-upload-box";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";
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
import "@uploadcare/react-uploader/core.css";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from '@mysten/sui/transactions';
import {fetchRegistry} from "@/api/queries/registry";
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";


const createCoinFlipSchema = z.object({
    name: z
        .string(),
    project_url: z
        .string(),
    image_url: z
        .string(),
    target_balance: z
        .coerce
        .number()
        .min(0),
    max_stake: z
        .coerce
        .number()
        .min(0),
    house_edge_bps: z
        .coerce
        .number()
        .min(0)
        .max(10_000),
    payout_factor_bps: z
        .coerce
        .number()
        .min(0)
        .max(100_000_000),
});


export default function CreateCoinFlip() {

    const suiClient = useSuiClient();
    const account = useCurrentAccount();
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    
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
    const form = useForm<z.infer<typeof createCoinFlipSchema>>({
        resolver: zodResolver(createCoinFlipSchema)
    });

    // Handle successful form submission
    async function onSubmit(values: z.infer<typeof createCoinFlipSchema>) {
        
        if (!account) {
            toast({
                variant:"destructive",
                title: 'Account not found',
                description: 'Please connect your wallet',
            })
            return;
        }

        const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
        const registry = await fetchRegistry();
        
        if (!registry) {
            toast({
                variant:"destructive",
                title: 'Registry not found',
                description: 'Please try again later',
            })
            return;
        }

        const tx = new Transaction();
        const [game, gameCap] = tx.moveCall({
            target: `${packageId}::game::new_coin_flip`,
            arguments: [
                tx.object(registry?.id),
                tx.pure.string(values.name),
                tx.pure.string(values.project_url),
                tx.pure.string(values.image_url),
                tx.pure.u64(values.target_balance),
                tx.pure.u64(values.max_stake),
                tx.pure.u64(values.house_edge_bps),
                tx.pure.u64(values.payout_factor_bps)
            ],
        });
        tx.moveCall({
            target: `${packageId}::game::share`,
            arguments: [
                tx.object(game),
            ],
        });
        tx.transferObjects([gameCap], account.address);


        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: "Transaction successful",
                            description: 'The game has been created successfully',
                        });
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
        <Card className={"flex flex-col p-6 max-h-[90%] overflow-y-scroll"}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Link href={"/create"} className={"w-fit"}>
                        <Button variant={"secondary"} className={"inline-flex gap-2 flex-grow w-fit mb-6"}>
                            <ArrowLeftIcon/>
                            <span>Back</span>
                        </Button>
                    </Link>

                    {/*Text*/}
                    <div className={"mb-4"}>
                        <h1 className={"text-2xl font-semibold"}>
                            Create Coin Flip
                        </h1>
                        <p>
                            A game of coin flip where there are two outcomes: heads and tails. The game
                            also supports a <span className={"italic"}>house bias</span> in which case the house always
                            wins.
                        </p>
                    </div>

                    <div className={"flex flex-row w-full gap-4 mb-6"}>
                        {/*Upload Image*/}
                        <div className={"w-1/2 h-auto"}>
                            {/*<p className={"font-semibold mb-4"}>*/}
                            {/*    Upload Image*/}
                            {/*</p>*/}
                            {/*<FileUploadBox/>*/}
                            <FormField
                                control={form.control}
                                name="image_url"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Image</FormLabel>
                                        <FormControl>
                                            <FileUploadBox {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/*Fill in details*/}
                        <div className={"w-1/2 h-auto min-w-72 flex flex-col gap-4"}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name of the game</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="project_url"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>The URL where the game is hosted</FormLabel>
                                        <FormControl>
                                            <Input placeholder="URL" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payout_factor_bps"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>The factor by which the stake is multiplied by to determine the
                                            payout</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Payout factor" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="house_edge_bps"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>The probability that the house wins</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="House edge" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_stake"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>The maximum amount of stake that can be placed</FormLabel>
                                        <FormControl>
                                            <Input type={"number"} placeholder="Max stake" {...field}
                                            />
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
                                        <FormLabel>The target balance of the house to start the game</FormLabel>
                                        <FormControl>
                                            <Input type={"number"} placeholder="Max stake" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <Button className={"w-full"} type={"submit"}>
                        Create Game
                    </Button>
                </form>
            </Form>
        </Card>
    )
}