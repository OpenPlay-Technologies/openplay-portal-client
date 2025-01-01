"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {useCallback, useEffect, useState} from "react";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {GameCapData, ParticipationData} from "@/api/models/models";
import {fetchAllParticipations} from "@/api/queries/participation";
import ParticipationRewards from "@/components/rewards/participation-rewards";
import {fetchAllGameCaps} from "@/api/queries/game-cap";
import GameOwnerRewards from "@/components/rewards/game-owner-rewards";
export default function RewardsPage() {
    const [activeTab, setActiveTab] = useState('house-participation');

    const account = useCurrentAccount();

    // Participations
    const [participationData, setParticipationData] = useState<ParticipationData[]>([]);
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

    // Game caps
    const [gameCapData, setGameCapData] = useState<GameCapData[]>([]);
    const updateGameCapData = useCallback(async () => {
        if (!account?.address) {
            setGameCapData([]);
            return;
        }
        const gameCaps = await fetchAllGameCaps(account.address);
        setGameCapData(gameCaps);
    }, [account]);

    useEffect(() => {
        updateGameCapData();
    }, [updateGameCapData]);
    


    return (
        <div className={"container mx-auto py-8"}>
            <Card className={"relative p-6 flex flex-col"}>
                <h1 className={"text-2xl font-semibold mb-4"}>
                    Manage your rewards
                </h1>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-auto">
                    <TabsList className="grid w-full grid-cols-3 h-auto mb-4">
                        <TabsTrigger value="house-participation">
                            <span className={"p-1"}>House Participation ({participationData.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="game-owner">
                            <span className={"p-1"}>Game Owner ({gameCapData.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="protocol" disabled>
                            <span className={"p-1"}>Protocol (Coming Soon)</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="house-participation">
                        <CardHeader className={"px-0"}>
                            <CardTitle>House Participation Rewards</CardTitle>
                            <CardDescription>View your rewards for participating as the house in games. All profits or
                                losses are equally distributed between stakers per epoch.</CardDescription>
                        </CardHeader>
                        <ParticipationRewards participationData={participationData} updateParticipationData={updateParticipationData}/>
                        
                    </TabsContent>

                    <TabsContent value="game-owner">
                        <CardHeader className={"px-0"}>
                            <CardTitle>Game Owner Rewards</CardTitle>
                            <CardDescription>View the collected fees from games you own.</CardDescription>
                        </CardHeader>
                        <GameOwnerRewards gameCapData={gameCapData} updateGameCapData={updateGameCapData} />
                    </TabsContent>

                    <TabsContent value="protocol">
                        <CardHeader>
                            <CardTitle>Protocol Rewards</CardTitle>
                            <CardDescription>Coming soon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Protocol rewards are not yet available. Stay tuned for
                                updates!</p>
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
} 