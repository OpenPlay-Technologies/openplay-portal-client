"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {UserPenIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import { GameData, ParticipationData} from "@/api/models/models";
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

interface ManagePositionProps {
    game: GameData;
}

const stakeSchema = z.object({
    amount: z
        .coerce
        .number()
        .min(0),
});

export default function ManagePosition(props: ManagePositionProps) {
    const { toast } = useToast();
    const {updateBalance} = useBalance();
    const [loadingStake, setLoadingStake] = useState<boolean>(false);
    const [loadingUnstake, setLoadingUnstake] = useState<boolean>(false);
    const [loadingClaim, setLoadingClaim] = useState<boolean>(false);
    const [epoch, setEpoch] = useState<number | null>(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
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

    const account = useCurrentAccount();
    const [participationData, setParticipationData] = useState<ParticipationData | null>(null);
    const updateParticipationData = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        const participations = await fetchAllParticipations(account.address);
        setParticipationData(participations.find(p => p.game_id == props.game.id) ?? null);
    }, [account]);

    useEffect(() => {
        updateParticipationData();
    }, [updateParticipationData]);

    async function handleUnstake() {

        if (!account || !participationData) {
            toast({
                variant:"destructive",
                title: 'Unstake failed',
                description: 'Participation not found',
            });
            return;
        }

        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::game::update_participation`,
            arguments: [
                tx.object(props.game.id),
                tx.object(participationData.id),
            ],
        });
        tx.moveCall({
            target: `${packageId}::game::unstake`,
            arguments: [
                tx.object(props.game.id),
                tx.object(participationData.id),
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
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        });
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

    async function handleStake(values: z.infer<typeof stakeSchema>) {

        if (!account) {
            toast({
                variant:"destructive",
                title: 'Account not found',
                description: 'Please connect your wallet to stake.',
            })
            return;
        }

        const tx = new Transaction();

        let participationObj;
        if (!participationData) {
            const [participation] = tx.moveCall({
                target: `${packageId}::game::new_participation`,
                arguments: [
                    tx.object(props.game.id)
                ],
            });
            participationObj = tx.object(participation);
        } else {
            participationObj = tx.object(participationData.id);
            tx.moveCall({
                target: `${packageId}::game::update_participation`,
                arguments: [
                    tx.object(props.game.id),
                    participationObj,
                ],
            });
        }

        const [coin] = tx.splitCoins(tx.gas, [values.amount * 1e9]);
        tx.moveCall({
            target: `${packageId}::game::stake`,
            arguments: [
                tx.object(props.game.id),
                participationObj,
                tx.object(coin)
            ],
        });

        if (!participationData) {
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
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
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

    // Update the participation
    async function handleUpdate() {

        if (!account || !participationData) {
            toast({
                variant:"destructive",
                title: 'Account not found',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        tx.moveCall({
            target: `${packageId}::game::update_participation`,
            arguments: [
                tx.object(participationData.game_id),
                tx.object(participationData.id),
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
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
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

    // Claim
    async function handleClaim() {
        if (!account || !participationData) {
            toast({
                variant:"destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        tx.moveCall({
            target: `${packageId}::game::update_participation`,
            arguments: [
                tx.object(props.game.id),
                tx.object(participationData.id),
            ],
        });
        const [coin] = tx.moveCall({
            target: `${packageId}::game::claim_all`,
            arguments: [
                tx.object(participationData.game_id),
                tx.object(participationData.id),
            ],
        });
        tx.transferObjects([coin], account.address);


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
                    }).catch((error) => {
                        toast({
                            variant:"destructive",
                            title: 'Transaction failed',
                            description: error.message,
                        })
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
        <div className="w-full pb-4">
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
                                        {formatSuiAmount(participationData?.active_stake ? participationData.active_stake : 0)}
                                        {participationData?.unstake_requested &&
                                            <span className={"text-destructive text-sm"}>(Unstaking)</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Inactive stake
                                    </p>
                                    <p className={" "}>
                                        {formatSuiAmount(participationData?.inactive_stake ? participationData.inactive_stake : 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Claimable balance
                                    </p>
                                    <div className={"inline-flex gap-4 items-center align-bottom"}>
                                        <span className={(participationData?.claimable_balance ?? 0) > 0 ? "text-green-700" : ""}>
                                            {formatSuiAmount(participationData?.claimable_balance ? participationData.claimable_balance : 0)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-muted-foreground text-sm"}>
                                        Last updated epoch
                                    </p>
                                    <p className={" "}>
                                        {participationData?.last_updated_epoch ?? "N/A"}
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
                            <Button className={"w-fit"} variant={"outline"} disabled={loadingUpdate} onClick={handleUpdate}>
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
        </div>

    );
}