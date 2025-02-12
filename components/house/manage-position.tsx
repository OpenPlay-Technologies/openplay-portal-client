"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {UserPenIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import {useCurrentAccount, useSignTransaction} from "@mysten/dapp-kit";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Transaction} from '@mysten/sui/transactions';
import {fetchAllParticipations} from "@/api/queries/participation";
import {getCurrentEpoch} from "@/api/queries/epoch";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {formatAddress, formatSuiAmount} from "@/lib/utils";
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
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import {executeAndWaitForTransactionBlock} from "@/app/actions";
import {
    buildClaimParticipationTransaction,
    buildPrivateStakeTransaction,
    buildPublicStakeTransaction,
    buildUnstakeTransaction, buildUpdateParticipationTransaction
} from "@/app/house/[houseId]/actions";

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

    const {mutate: signTransaction} = useSignTransaction();

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

        const filiteredParticipations = participations.filter(p => p.house_id == props.house.id.id).sort(
            (a, b) =>
                Number((b.stake + b.pending_stake + b.claimable_balance) -
                    (a.stake + a.pending_stake + a.claimable_balance))
        );

        setParticipationData(filiteredParticipations);
        if (selectedParticipation?.id.id == null && filiteredParticipations.length > 0) {
            setSelectedParticipation(filiteredParticipations[0]);
        } else {
            setSelectedParticipation(filiteredParticipations.find(p => p.id.id == selectedParticipation?.id.id) ?? null);
        }
    }, [account?.address, props.house.id.id, selectedParticipation?.id.id]);

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
        
        const bytes = await buildUnstakeTransaction(account.address, props.house.id.id, selectedParticipation.id.id);

        const tx = Transaction.from(bytes);
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    setLoadingUnstake(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
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

        let bytes;
        if (props.house.private) {
            const adminCap = houseAdminCapData.find(cap => cap.house_id == props.house.id.id);
            if (!adminCap) {
                toast({
                    variant: "destructive",
                    title: 'Participation failed',
                    description: 'House admin cap not found',
                });
                return;
            }
            bytes = await buildPrivateStakeTransaction(account.address, props.house.id.id, adminCap.id.id, values.amount, selectedParticipation?.id.id ?? null);
        }
        else {
            bytes = await buildPublicStakeTransaction(account.address, props.house.id.id, values.amount, selectedParticipation?.id.id ?? null);
        }
        
        
        const tx = Transaction.from(bytes);
        signTransaction({
            transaction: tx
        }, {
            onSuccess: (result) => {
                setLoadingStake(true);
                executeAndWaitForTransactionBlock(result.bytes, result.signature)
                    .then(() => {
                        toast({
                            title: 'Transaction successful',
                            description: 'Your stake has been successfully added.',
                        });
                        setLoadingStake(false);
                        form.reset();
                        updateParticipationData();
                        updateBalance();
                        router.refresh();
                    })
                    .catch((error) => {
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
        })
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

        const bytes = await buildUpdateParticipationTransaction(account.address, props.house.id.id, selectedParticipation.id.id);
        const tx = Transaction.from(bytes);
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    // console.log('Transaction executed', result);
                    setLoadingUpdate(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
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

        const bytes = await buildClaimParticipationTransaction(account.address, props.house.id.id, selectedParticipation.id.id, 
            selectedParticipation.stake == BigInt(0) && selectedParticipation.pending_stake == BigInt(0));
        
        const tx = Transaction.from(bytes);
        signTransaction({
                transaction: tx
            },
            {
                onSuccess: (result) => {
                    // console.log('Transaction executed', result);
                    setLoadingClaim(true);
                    executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
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
            {props.house.private && !houseAdminCapData.find(cap => cap.house_id == props.house.id.id) && !selectedParticipation ?
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
                                    participation per house.
                                </p>
                                <p className={"text-sm mb-4"}>
                                    Current participation: {selectedParticipation?.id?.id}
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
                                                <DropdownMenuItem key={participation.id.id} onClick={() => {
                                                    setSelectedParticipation(participation)
                                                }}>
                                                    <div className={"inline-flex justify-between flex-grow"}>
                                                    <span>
                                                        {participation.id.id.slice(0, 6)}...{participation.id.id.slice(-6)}
                                                    </span>
                                                        <span className={"font-semibold"}>
                                                        {formatSuiAmount(Number(participation.stake) + Number(participation.claimable_balance) + Number(participation.pending_stake))}
                                                    </span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>}
                            <CardContent className={"p-6 border-b"}>
                                <p className={"font-semibold"}>
                                    Current position
                                </p>
                                <p className={"text-muted-foreground mb-2 inline-flex items-center gap-2"}>
                                    {selectedParticipation && <>{formatAddress(selectedParticipation.id.id)}
                                        <ClientCopyIcon value={selectedParticipation.id.id}
                                                        className={"w-4 h-4 mr-2"}/></>}
                                </p>
                                <div className={"grid grid-cols-2 gap-2"}>
                                    <div>
                                        <p className={"text-muted-foreground text-sm"}>
                                            Stake
                                        </p>
                                        <div className={"inline-flex gap-2 items-center align-bottom"}>
                                            {formatSuiAmount(Number(selectedParticipation?.stake ?? 0))}
                                            {(selectedParticipation?.unstake_requested ?? false) &&
                                                <span className={"text-destructive text-sm"}>(Unstaking)</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className={"text-muted-foreground text-sm"}>
                                            Pending stake
                                        </p>
                                        <p className={" "}>
                                            {formatSuiAmount(Number(selectedParticipation?.pending_stake ?? 0))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={"text-muted-foreground text-sm"}>
                                            Claimable balance
                                        </p>
                                        <div className={"inline-flex gap-4 items-center align-bottom"}>
                                        <span
                                            className={(selectedParticipation?.claimable_balance ?? 0) > 0 ? "text-green-600" : ""}>
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
                                    By updating your participation, the profits or losses from each epoch are added to
                                    your
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
                                            <Button className={"w-full max-w-sm"} disabled={loadingStake}
                                                    type={"submit"}>
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
                                    Inactive stake will be credit to your balance manager immediately, while active
                                    stake
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