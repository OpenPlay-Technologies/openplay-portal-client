"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {HandshakeIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useCallback, useEffect, useState} from "react";
import {useCurrentAccount, useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from '@mysten/sui/transactions';
import {getCurrentEpoch} from "@/api/queries/epoch";
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
import {fetchAllOwnedReferrals} from "@/api/queries/referrals";
import {HouseModel, ReferralModel} from "@/api/models/openplay-core";

interface ManagePositionProps {
    house: HouseModel;
}

export default function ManageReferral(props: ManagePositionProps) {
    const {toast} = useToast();
    const {updateBalance} = useBalance();
    const router = useRouter();
    const [loadingClaim, setLoadingClaim] = useState<boolean>(false);
    const [epoch, setEpoch] = useState<number | null>(null);
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

    // Referral caps
    const [referralData, setReferralData] = useState<ReferralModel[]>([]);
    const [selectedReferral, setSelectedReferral] = useState<ReferralModel | null>(null);
    const updateReferralData = useCallback(async () => {
        if (!account?.address) {
            setReferralData([]);
            return;
        }
        const referrals = await fetchAllOwnedReferrals(account.address);
        const thisHouseReferrals = referrals.filter(referral => referral.house_id == props.house.id);

        if (selectedReferral == null && thisHouseReferrals.length > 0) {
            setSelectedReferral(thisHouseReferrals[0]);
        }
        setReferralData(thisHouseReferrals);
    }, [account]);
    useEffect(() => {
        updateReferralData();
    }, [updateReferralData]);

    // Fetch the current epoch
    useEffect(() => {
        const fetchEpoch = async () => {
            // Fetch the current epoch
            const epoch = await getCurrentEpoch();
            setEpoch(epoch);
        }
        fetchEpoch();
    }, []);


    // // Claim
    // async function handleClaim() {
    //     if (!account || !selectedParticipation) {
    //         toast({
    //             variant: "destructive",
    //             title: 'Claim failed',
    //             description: 'Participation not found',
    //         })
    //         return;
    //     }
    //
    //     const tx = new Transaction();
    //
    //     tx.moveCall({
    //         target: `${packageId}::house::update_participation`,
    //         arguments: [
    //             tx.object(props.house.id),
    //             tx.object(selectedParticipation.id),
    //         ],
    //     });
    //     const [coin] = tx.moveCall({
    //         target: `${packageId}::house::claim_all`,
    //         arguments: [
    //             tx.object(selectedParticipation.house_id),
    //             tx.object(selectedParticipation.id),
    //         ],
    //     });
    //     tx.transferObjects([coin], account.address);
    //
    //     if (selectedParticipation.active_stake == 0 && selectedParticipation.inactive_stake == 0) {
    //         tx.moveCall({
    //             target: `${packageId}::participation::destroy_empty`,
    //             arguments: [
    //                 tx.object(selectedParticipation.id),
    //             ],
    //         });
    //     }
    //
    //
    //     signAndExecuteTransaction({
    //             transaction: tx
    //         },
    //         {
    //             onSuccess: (result) => {
    //                 console.log('Transaction executed', result);
    //                 setLoadingClaim(true);
    //                 suiClient.waitForTransaction({
    //                     digest: result.digest
    //                 }).then(() => {
    //                     toast({
    //                         title: 'Transaction successful',
    //                         description: 'Your funds have been successfully claimed.',
    //                     });
    //                     setLoadingClaim(false);
    //                     updateParticipationData();
    //                     updateBalance();
    //                     router.refresh();
    //
    //                 }).catch((error) => {
    //                     toast({
    //                         variant: "destructive",
    //                         title: 'Transaction failed',
    //                         description: error.message,
    //                     })
    //                 });
    //             },
    //             onError: (error) => {
    //                 toast({
    //                     variant: "destructive",
    //                     title: 'Transaction failed',
    //                     description: error.message,
    //                 })
    //             }
    //         });
    // }

    // Create
    async function handleCreate() {
        if (!account) {
            toast({
                variant: "destructive",
                title: 'Claim failed',
                description: 'Participation not found',
            })
            return;
        }

        const tx = new Transaction();

        const [referralCap] = tx.moveCall({
            target: `${packageId}::house::new_referral`,
            arguments: [
                tx.object(props.house.id),
            ],
        });
        tx.transferObjects([referralCap], account.address);

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
                            description: 'Your referral was successfully created.',
                        });
                        setLoadingClaim(false);
                        updateReferralData();
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
                        <HandshakeIcon className={"w-6 h-6 mr-2"}/>
                        Referral Program
                    </div>
                </CardHeader>
                {!account && (
                    <CardContent className={"p-6"}>
                        <p>Connect your wallet to start with the referral program.</p>
                    </CardContent>
                )}
                {account && (
                    <>
                        {(referralData?.length ?? 0) >= 1 && <CardContent className={"p-6 border-b"}>
                            <p className={"font-semibold "}>
                                {referralData?.length ?? 0} Referrals found
                            </p>
                            <p className={"text-sm mb-4"}>
                                Current referral: {selectedReferral?.id.slice(0, 5)}...{selectedReferral?.id.slice(-5)}
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Change referral
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Referrals</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuGroup>
                                        {referralData?.map((referral) => (
                                            <DropdownMenuItem key={referral.id} onClick={() => {
                                                setSelectedReferral(referral)
                                            }}>
                                                <div className={"inline-flex justify-between flex-grow"}>
                                                    <span>
                                                        {referral.id.slice(0, 6)}...{referral.id.slice(-6)}
                                                    </span>
                                                    <span className={"font-semibold"}>
                                                        {formatSuiAmount(0)}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>}
                        {props.house.referral_fee_bps == BigInt(0) ?
                            <CardContent className={"p-6 flex flex-col gap-4"}>
                                <p>This house currently does not have the referral program enabled.</p>
                            </CardContent>
                            :
                            <CardContent className={"p-6"}>
                                <p className={"font-semibold "}>
                                    Create
                                </p>
                                <p className={"text-sm text-muted-foreground mb-4"}>
                                    Create a new referral for this house.
                                </p>
                                <div className={"flex flex-col gap-2"}>
                                    <Button variant={"default"} className={"w-full max-w-sm"}
                                            onClick={handleCreate} disabled={loadingCreate}>
                                        Create
                                    </Button>
                                </div>
                            </CardContent>
                        }
                    </>
                )}
            </Card>
        </div>

    );
}