"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {useCallback, useEffect, useState} from "react";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {fetchAllParticipations} from "@/api/queries/participation";
import ParticipationRewards from "@/components/rewards/participation-rewards";
import {fetchAllHouseAdminCaps} from "@/api/queries/house-cap";
import HouseOwnerRewards from "@/components/rewards/house-owner-rewards";
import {HouseAdminCapModel, ParticipationModel} from "@/api/models/openplay-core";
export default function RewardsPage() {
    const [activeTab, setActiveTab] = useState('house-participation');

    const account = useCurrentAccount();

    // Participations
    const [participationData, setParticipationData] = useState<ParticipationModel[]>([]);
    const updateParticipationData = useCallback(async () => {
        if (!account?.address) {
            setParticipationData([]);
            return;
        }
        const participations = await fetchAllParticipations(account.address);
        setParticipationData(participations);
    }, [account]);

    useEffect(() => {
        updateParticipationData();
    }, [updateParticipationData]);

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
    
    // // Referrals
    // const [referralData, setReferralData] = useState<ReferralModel[]>([]);
    // const updateReferralData = useCallback(async () => {
    //     if (!account?.address) {
    //         setReferralData([]);
    //         return;
    //     }
    //     const referrals = await fetchAllOwnedReferrals(account.address);
    //     setReferralData(referrals);
    // }, [account]);
    // useEffect(() => {
    //     updateReferralData();
    // }, [updateReferralData]);


    return (
        <div className={"container mx-auto py-8"}>
            <Card className={"relative p-6 flex flex-col"}>
                <h1 className={"text-2xl font-semibold mb-4"}>
                    Manage your rewards
                </h1>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-auto">
                    <TabsList className="grid w-full grid-cols-3 h-auto mb-4">
                        <TabsTrigger value="house-participation">
                            <span className={"p-1"}>Participation ({participationData.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="house-owner">
                            <span className={"p-1"}>Owner ({houseAdminCapData.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="referral" disabled>
                            <span className={"p-1"}>Referral</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="house-participation">
                        <CardHeader className={"px-0"}>
                            <CardTitle>House Participation Rewards</CardTitle>
                            <CardDescription>View your rewards for participating as the house in games. All profits or
                                losses are equally distributed between stakers each epoch.</CardDescription>
                        </CardHeader>
                        <ParticipationRewards participationData={participationData} updateParticipationData={updateParticipationData}/>
                        
                    </TabsContent>

                    <TabsContent value="house-owner">
                        <CardHeader className={"px-0"}>
                            <CardTitle>House Owner Rewards</CardTitle>
                            <CardDescription>View the collected fees from games you own.</CardDescription>
                        </CardHeader>
                        <HouseOwnerRewards houseAdminCapData={houseAdminCapData} updateGameCapData={updateGameCapData} />
                    </TabsContent>

                    <TabsContent value="referral">
                        <CardHeader className={"px-0"}>
                            <CardTitle>Referral Program</CardTitle>
                            <CardDescription>Coming soon.</CardDescription>
                        </CardHeader>
                        {/*<ReferralRewards referralData={referralData} updateReferralData={updateReferralData} />*/}
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
} 