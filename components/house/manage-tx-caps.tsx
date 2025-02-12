"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {ArrowRightLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
import {Transaction} from '@mysten/sui/transactions';
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {fetchAllHouseAdminCaps} from "@/api/queries/house-cap";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {HouseAdminCapModel, HouseModel} from "@/api/models/openplay-core";
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import {buildAllowTxTransaction, buildRevokeTxTransaction} from "@/app/house/[houseId]/actions";
import {executeAndWaitForTransactionBlock} from "@/app/actions";

interface ManagePositionProps {
    house: HouseModel;
}

const mintCapSchema = z.object({
    game_id: z
        .string(),
});

export default function ManageTxCaps(props: ManagePositionProps) {
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    const router = useRouter();
    const [loadingCreate, setLoadingCreate] = useState(false);
    const account = useCurrentAccount();
    const {mutate: signTransaction} = useSignTransaction();

    // Initialize the form
    const form = useForm<z.infer<typeof mintCapSchema>>({
        resolver: zodResolver(mintCapSchema)
    });

    // House caps
    const [houseAdminCapData, setHouseAdminCapData] = useState<HouseAdminCapModel | null>(null);
    const updateGameCapData = useCallback(async () => {
        if (!account?.address) {
            setHouseAdminCapData(null);
            return;
        }
        const houseAdminCaps = await fetchAllHouseAdminCaps(account.address);
        setHouseAdminCapData(houseAdminCaps.find(cap => cap.house_id === props.house.id.id) ?? null);
    }, [account?.address, props.house.id.id]);

    useEffect(() => {
        updateGameCapData();
    }, [updateGameCapData]);

    // Allow
    async function handleAllow(values: z.infer<typeof mintCapSchema>) {
        if (!account || !houseAdminCapData) {
            toast({
                variant: "destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }
        
        const bytes = await buildAllowTxTransaction(account.address, props.house.id.id, houseAdminCapData.id.id, values.game_id);
        const tx = Transaction.from(bytes);

        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                  // console.log('Transaction executed', result);
                    setLoadingCreate(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Game ID successfully added to the allow list.',
                        });
                        form.reset();
                        setLoadingCreate(false);
                        updateBalance();
                        router.refresh();

                    }).catch((error) => {
                        toast({
                            variant: "destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
                    });
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: 'Transaction failed',
                        description: error.message,
                    })
                }
            });
    }

    // Revoke
    async function handleRevoke(gameId: string) {
        if (!account || !houseAdminCapData) {
            toast({
                variant: "destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }

        const bytes = await buildRevokeTxTransaction(account.address, props.house.id.id, houseAdminCapData.id.id, gameId);
        const tx = Transaction.from(bytes);

        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                  // console.log('Transaction executed', result);
                    setLoadingCreate(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Game ID access successfully revoked.',
                        });
                        form.reset();
                        setLoadingCreate(false);
                        updateBalance();
                        router.refresh();

                    }).catch((error) => {
                        toast({
                            variant: "destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
                    });
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: 'Transaction failed',
                        description: error.message,
                    })
                }
            });
    }


    return (
        <div className="w-full pb-4">
            <Card>
                <CardHeader className={"border-b"}>
                    <div className={"font-semibold   inline-flex items-center"}>
                        <ArrowRightLeft className={"w-6 h-6 mr-2"}/>
                        Tx Allowed Games
                    </div>
                </CardHeader>
                {props.house.tx_allow_listed &&
                    <CardContent className={"p-6 border-b"}>
                        <p className={"font-semibold "}>
                            Allow listed
                        </p>
                        <div className={"flex flex-col gap-2"}>
                            {props.house.tx_allow_listed.fields.contents.map((address) => {
                                return (
                                <div className={"flex flex-col items-start"} key={address}>
                                    <div className={"inline-flex gap-2 items-center"}>
                                        <p>
                                            {address.slice(0, 6) + "..." + address.slice(-6)}
                                        </p>
                                        <ClientCopyIcon className={"w-4 h-4"} value={address}/>
                                        <Button onClick={() => handleRevoke(address)}>
                                            Revoke
                                        </Button>
                                    </div>
                                    {/*<p className={"text-sm text-muted-foreground"}>*/}
                                    {/*    the type*/}
                                    {/*</p>*/}
                                </div>
                            )}
                            )}
                        </div>
                    </CardContent>
                }
                {!account && (
                    <CardContent className={"p-6"}>
                        <p>Connect your wallet to manage transaction caps</p>
                    </CardContent>
                )}
                {account && (
                    <>
                        {houseAdminCapData == null ?
                            <CardContent className={"p-6 flex flex-col gap-4"}>
                                <p>You need to be the house admin to manage transaction caps.</p>
                            </CardContent>
                            :
                            <CardContent className={"p-6 border-b"}>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAllow)}>
                                        <p className={"font-semibold "}>
                                            Add Tx Allowed
                                        </p>
                                        <p className={"text-sm text-muted-foreground mb-4"}>
                                            Add a game ID to your house&apos;s alllow list so it can process transactions.
                                        </p>
                                        <div className={"flex flex-col gap-2"}>
                                            <FormField
                                                control={form.control}
                                                name="game_id"
                                                render={({field}) => (
                                                    <FormItem className={"mb-2"}>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={"Game ID"}
                                                                disabled={loadingCreate}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button className={"w-full max-w-sm"} disabled={loadingCreate} type={"submit"}>
                                                <span className={"font-semibold"}>Allow</span>
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        }
                    </>
                )}
            </Card>
        </div>

    );
}