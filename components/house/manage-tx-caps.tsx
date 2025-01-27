"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {ArrowRightLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from '@mysten/sui/transactions';
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import {useRouter} from "next/navigation";
import {fetchAllOwnedReferrals} from "@/api/queries/referrals";
import {z} from "zod";
import {fetchAllHouseAdminCaps} from "@/api/queries/house-cap";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {HouseAdminCapModel, HouseModel} from "@/api/models/openplay-core";
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import {fetchTxCapOwner} from "@/api/queries/house";

interface ManagePositionProps {
    house: HouseModel;
}

const mintCapSchema = z.object({
    destination: z
        .string(),
});

export default function ManageTxCaps(props: ManagePositionProps) {
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    const router = useRouter();
    const [loadingCreate, setLoadingCreate] = useState(false);
    const packageId = process.env.NEXT_PUBLIC_CORE_PACKAGE_ID;
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
    const account = useCurrentAccount();

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
        setHouseAdminCapData(houseAdminCaps.find(cap => cap.house_id === props.house.id) ?? null);
    }, [account]);

    useEffect(() => {
        updateGameCapData();
    }, [updateGameCapData]);
    
    // Tx caps owners
    const [txCapOwner, setTxCapOwners] = useState<Record<string, string>>({});
    useEffect(() => {
        if (!props.house.tx_allow_listed) return;

        const fetchAllTxCapOwners = async () => {
            try {
                const txCapIds = props.house.tx_allow_listed.contents;
                const owners = await Promise.all(
                    txCapIds.map((txCapId: string) => fetchTxCapOwner(txCapId))
                );

                // Create a map of txCapId to owner
                const txCapOwnersMap = txCapIds.reduce((map, txCapId, index) => {
                    map[txCapId] = owners[index] ?? ""; // Map the txCapId to its owner
                    return map;
                }, {} as Record<string, string>);
                setTxCapOwners(txCapOwnersMap);
            } catch (error) {
                console.error("Error fetching owners:", error);
            }
        };

        fetchAllTxCapOwners();
    }, [props.house.tx_allow_listed]);
    

    // Create
    async function handleCreate(values: z.infer<typeof mintCapSchema>) {
        if (!account || !houseAdminCapData) {
            toast({
                variant: "destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        const [tx_cap] = tx.moveCall({
            target: `${packageId}::house::admin_mint_tx_cap`,
            arguments: [
                tx.object(props.house.id),
                tx.object(houseAdminCapData.id)
            ],
        });
        tx.transferObjects([tx_cap], values.destination);

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
                        toast({
                            title: 'Transaction successful',
                            description: 'Your tx cap was successfully minted.',
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
                        Transaction Caps
                    </div>
                </CardHeader>
                {props.house.tx_allow_listed &&
                    <CardContent className={"p-6 border-b"}>
                        <p className={"font-semibold "}>
                            Allow listed
                        </p>
                        <div className={"flex flex-col gap-2"}>
                            {props.house.tx_allow_listed.contents.map((address) => (
                                <div className={"flex flex-col items-start"} key={address}>
                                    <div className={"inline-flex gap-2 items-center"}>
                                        <p>
                                            {address.slice(0, 6)}...{address.slice(-6)}
                                        </p>
                                        <ClientCopyIcon className={"w-4 h-4"} value={address}/>
                                    </div>
                                    <p className={"text-sm text-muted-foreground"}>
                                        {txCapOwner[address] != null && (txCapOwner[address] ? `Owner: ${txCapOwner[address]?.slice(0, 6)}...${txCapOwner[address]?.slice(-6)}` : "Deleted or wrapped")}
                                    </p>
                                </div>
                            ))}
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
                                    <form onSubmit={form.handleSubmit(handleCreate)}>
                                        <p className={"font-semibold "}>
                                            Mint a new tx cap
                                        </p>
                                        <p className={"text-sm text-muted-foreground mb-4"}>
                                            With the tx cap you give permission to transactions in your house.
                                        </p>
                                        <div className={"flex flex-col gap-2"}>
                                            <FormField
                                                control={form.control}
                                                name="destination"
                                                render={({field}) => (
                                                    <FormItem className={"mb-2"}>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={"Destination address"}
                                                                disabled={loadingCreate}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button className={"w-full max-w-sm"} disabled={loadingCreate} type={"submit"}>
                                                <span className={"font-semibold"}>Create</span>
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