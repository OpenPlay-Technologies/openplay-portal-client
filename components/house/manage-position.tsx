"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {UserPenIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Transaction} from '@mysten/sui/transactions';
import {fetchAllParticipations} from "@/api/queries/participation";
import {getCurrentEpoch} from "@/api/queries/epoch";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {formatSuiAmount} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {useBalance} from "@/components/providers/balance-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useRouter} from "next/navigation";
import {fetchAllHouseAdminCaps} from "@/api/queries/house-cap";
import Link from "next/link";
import {HouseAdminCapModel, HouseModel, ParticipationModel} from "@/api/models/openplay-core";

interface ManagePositionProps {
    house: HouseModel;
}

const stakeSchema = z.object({
    amount: z
        .coerce
        .number()
        .min(0),
});

export default function ManagePosition(props: ManagePositionProps) {
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    const router = useRouter();
    const [loadingStake, setLoadingStake] = useState<boolean>(false);
    const [loadingUnstake, setLoadingUnstake] = useState<boolean>(false);
    const [loadingClaim, setLoadingClaim] = useState<boolean>(false);
    const [epoch, setEpoch] = useState<number | null>(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
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

    // House caps
    const [houseAdminCapData, setHouseAdminCapData] = useState<HouseAdminCapModel[]>([]);
    const updateGameCapData = useCallback(async () => {
        if (!account?.address) {
            setHouseAdminCapData([]);
            return;
        }
        const houseAdminCaps = await fetchAllHouseAdminCaps(account.address);
        setHouseAdminCapData(houseAdminCaps);
    }, [account]);
    useEffect(() => {
        updateGameCapData();
    }, [updateGameCapData]);

    // Fetch the current epoch
    useEffect(() => {
        const fetchEpoch = async () => {
            // Fetch the current epoch
            const epoch = await getCurrentEpoch();
            setEpoch(epoch);
        }
        fetchEpoch();
    }, []);

    // Initialize the form
    const form = useForm<z.infer<typeof stakeSchema>>({
        resolver: zodResolver(stakeSchema)
    });

    const [participationData, setParticipationData] = useState<ParticipationModel[] | null>([]);
    const [selectedParticipation, setSelectedParticipation] = useState<ParticipationModel | null>(null);
    const updateParticipationData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const participations = await fetchAllParticipations(account.address);
        setParticipationData(participations.filter(p => p.house_id == props.house.id).sort(
            (a, b) =>
                Number((b.active_stake + b.inactive_stake + b.claimable_balance) -
                (a.active_stake + a.inactive_stake + a.claimable_balance))
        ));
        if (selectedParticipation == null && participations.length > 0) {
            setSelectedParticipation(participations[0]);
        }
        else {
            const selected = participations.find(p => p.id == selectedParticipation?.id);
            setSelectedParticipation(selected ?? null);
        }
    }, [account, selectedParticipation]);

    useEffect(() => {
        updateParticipationData();
    }, [updateParticipationData]);

    async function handleUnstake() {

        if (!account || !selectedParticipation) {
            toast({
                variant: "destructive",
                title: 'Unstake failed',
                description: 'Participation not found',
            });
            return;
        }

        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::house::update_participation`,
            arguments: [
                tx.object(props.house.id),
                tx.object(selectedParticipation.id),
            ],
        });
        tx.moveCall({
            target: `${packageId}::house::unstake`,
            arguments: [
                tx.object(props.house.id),
                tx.object(selectedParticipation.id),
            ],
        });

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingUnstake(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Your stake has been successfully unstaked.',
                        });
                        setLoadingUnstake(false);
                        form.reset();
                        updateParticipationData();
                        updateBalance();
                        router.refresh();
                    }).catch((error) => {
                        toast({
                            variant: "destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        });
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

    async function handleStake(values: z.infer<typeof stakeSchema>) {

        if (!account) {
            toast({
                variant: "destructive",
                title: 'Account not found',
                description: 'Please connect your wallet to stake.',
            })
            return;
        }

        const tx = new Transaction();
        
        let participationObj;
        if (!selectedParticipation) {
            // Private house needs to use the admin_new_participation instead
            if (props.house.private) {
                const adminCap = houseAdminCapData.find(cap => cap.house_id == props.house.id);
                if (!adminCap) {
                    toast({
                        variant: "destructive",
                        title: 'Participation failed',
                        description: 'House admin cap not found',
                    });
                    return;
                }
                
                const [participation] = tx.moveCall({
                    target: `${packageId}::house::admin_new_participation`,
                    arguments: [
                        tx.object(props.house.id),
                        tx.object(adminCap.id)
                    ],
                });
                participationObj = tx.object(participation);
            }
            else {
                const [participation] = tx.moveCall({
                    target: `${packageId}::house::new_participation`,
                    arguments: [
                        tx.object(props.house.id)
                    ],
                });
                participationObj = tx.object(participation);
            }
        } else {
            participationObj = tx.object(selectedParticipation.id);
            tx.moveCall({
                target: `${packageId}::house::update_participation`,
                arguments: [
                    tx.object(props.house.id),
                    participationObj,
                ],
            });
        }

        const [coin] = tx.splitCoins(tx.gas, [values.amount * 1e9]);
        tx.moveCall({
            target: `${packageId}::house::stake`,
            arguments: [
                tx.object(props.house.id),
                participationObj,
                tx.object(coin)
            ],
        });

        if (!selectedParticipation) {
            tx.transferObjects([participationObj], account.address);
        }

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingStake(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Your stake has been successfully added.',
                        });
                        setLoadingStake(false);
                        form.reset();
                        updateParticipationData();
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

    // Update the participation
    async function handleUpdate() {
        if (!account || !selectedParticipation) {
            toast({
                variant: "destructive",
                title: 'Account not found',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        tx.moveCall({
            target: `${packageId}::house::update_participation`,
            arguments: [
                tx.object(selectedParticipation.house_id),
                tx.object(selectedParticipation.id),
            ],
        });

        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingUpdate(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Your participation has been successfully updated.',
                        });
                        setLoadingUpdate(false);
                        updateParticipationData();
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

    // Claim
    async function handleClaim() {
        if (!account || !selectedParticipation) {
            toast({
                variant: "destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        tx.moveCall({
            target: `${packageId}::house::update_participation`,
            arguments: [
                tx.object(props.house.id),
                tx.object(selectedParticipation.id),
            ],
        });
        const [coin] = tx.moveCall({
            target: `${packageId}::house::claim_all`,
            arguments: [
                tx.object(selectedParticipation.house_id),
                tx.object(selectedParticipation.id),
            ],
        });
        tx.transferObjects([coin], account.address);

        if (selectedParticipation.active_stake == BigInt(0) && selectedParticipation.inactive_stake == BigInt(0)) {
            tx.moveCall({
                target: `${packageId}::participation::destroy_empty`,
                arguments: [
                    tx.object(selectedParticipation.id),
                ],
            });
        }


        signAndExecuteTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    console.log('Transaction executed', result);
                    setLoadingClaim(true);
                    suiClient.waitForTransaction({
                        digest: result.digest
                    }).then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Your funds have been successfully claimed.',
                        });
                        setLoadingClaim(false);
                        updateParticipationData();
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
            {props.house.private && !houseAdminCapData.find(cap => cap.house_id == props.house.id) && !selectedParticipation ?
            <div>
                <Card>
                    <CardHeader className={"border-b"}>
                        <div className={"font-semibold   inline-flex items-center"}>
                            <UserPenIcon className={"w-6 h-6 mr-2"}/>
                            Your Position
                        </div>
                    </CardHeader>
                    <CardContent className={"p-6 flex flex-col gap-4"}>
                        <p>This is a private house. You need to be the owner to manage your position.</p>
                        <Link href={"/create/house"}>
                            
                        
                        <Button>
                            Create your own house
                        </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
                :
                <Card>
                <CardHeader className={"border-b"}>
                    <div className={"font-semibold   inline-flex items-center"}>
                        <UserPenIcon className={"w-6 h-6 mr-2"}/>
                        Your Position
                    </div>
                </CardHeader>
                {!account && (
                    <CardContent className={"p-6"}>
                        <p>Connect your wallet to manage your position.</p>
                    </CardContent>
                )}
                {account && (
                    <>
                        {(participationData?.length ?? 0) > 1 && <CardContent className={"p-6 border-b"}>
                            <p className={"font-semibold "}>
                                Select participation ({participationData?.length ?? 0} participations found)
                            </p>
                            <p className={"text-sm text-muted-foreground my-2"}>
                                Each participation can be managed individually. It is advised to have only one
                                participation per game.
                            </p>
                            <p className={"text-sm mb-4"}>
                                Current participation: {selectedParticipation?.id}
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Change participation
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Participations</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuGroup>
                                        {participationData?.map((participation) => (
                                            <DropdownMenuItem key={participation.id} onClick={() => {
                                                setSelectedParticipation(participation)
                                            }}>
                                                <div className={"inline-flex justify-between flex-grow"}>
                                                    <span>
                                                        {participation.id.slice(0, 6)}...{participation.id.slice(-6)}
                                                    </span>
                                                    <span className={"font-semibold"}>
                                                        {formatSuiAmount(Number(participation.active_stake + participation.claimable_balance + participation.inactive_stake))}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>}
                        <CardContent className={"p-6 border-b"}>
                            <p className={"font-semibold mb-2"}>
                                Current position
                            </p>
                            <div className={"grid grid-cols-2 gap-2"}>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Active stake
                                    </p>
                                    <div className={"inline-flex gap-2 items-center align-bottom"}>
                                        {formatSuiAmount(Number(selectedParticipation?.active_stake ?? 0))}
                                        {(selectedParticipation?.unstake_requested ?? false) &&
                                            <span className={"text-destructive text-sm"}>(Unstaking)</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Inactive stake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(Number(selectedParticipation?.inactive_stake ?? 0))}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Claimable balance
                                    </p>
                                    <div className={"inline-flex gap-4 items-center align-bottom"}>
                                        <span
                                            className={(selectedParticipation?.claimable_balance ?? 0) > 0 ? "text-green-700" : ""}>
                                            {formatSuiAmount(Number(selectedParticipation?.claimable_balance ?? 0))}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Last updated epoch
                                    </p>
                                    <p className={" "}>
                                        {selectedParticipation?.last_updated_epoch ?? "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardContent className={"p-6 border-b"}>
                            <p className={"font-semibold "}>
                                Update
                            </p>
                            <p className={"text-sm text-muted-foreground my-2"}>
                                Your participations need to be updated every epoch to see the latest details.
                                By updating your participation, the profits or losses from each epoch are added to your
                                active stake.
                            </p>
                            <p className={"text-sm text-muted-foreground my-2"}>
                                Participations are automatically updated when you take an action such as staking,
                                unstaking, or claiming.
                            </p>
                            <p className={"text-sm mb-4"}>
                                Current epoch: {epoch}
                            </p>
                            <Button className={"w-fit"} variant={"outline"} disabled={loadingUpdate}
                                    onClick={handleUpdate}>
                                <ArrowPathIcon className={"w-6 h-6"} strokeWidth={2}/>
                                Force Update
                            </Button>
                        </CardContent>
                        <CardContent className={"p-6 border-b"}>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleStake)}>
                                    <p className={"font-semibold "}>
                                        Add stake
                                    </p>
                                    <p className={"text-sm text-muted-foreground mb-4"}>
                                        New stake will become active in the next epoch.
                                    </p>
                                    <div className={"flex flex-col gap-2"}>
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({field}) => (
                                                <FormItem className={"mb-2"}>
                                                    <FormControl>
                                                        <Input
                                                            disabled={loadingStake}
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
                                        <Button className={"w-full max-w-sm"} disabled={loadingStake} type={"submit"}>
                                            <span className={"font-semibold"}>Stake</span>
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                        <CardContent className={"p-6"}>
                            <p className={"font-semibold "}>
                                Claim
                            </p>
                            <p className={"text-sm text-muted-foreground mb-4"}>
                                Claimable balance will be credited to your balance immediately.
                            </p>
                            <div className={"flex flex-col gap-2"}>
                                <Button variant={"default"} className={"w-full max-w-sm"}
                                        onClick={handleClaim} disabled={loadingClaim}>
                                    Claim
                                </Button>
                            </div>
                        </CardContent>
                        <CardContent className={"p-6"}>
                            <p className={"font-semibold "}>
                                Unstake
                            </p>
                            <p className={"text-sm text-muted-foreground mb-4"}>
                                Inactive stake will be credit to your balance manager immediately, while active stake
                                will
                                only be available in the next epoch.
                            </p>
                            <div className={"flex flex-col gap-2"}>
                                <Button variant={"outline"} className={"w-full max-w-sm"}
                                        onClick={() => handleUnstake()} disabled={loadingUnstake}>
                                    Unstake
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
            }
        </div>

    );
}