"use client"
import {fetchAllHouses} from "@/api/queries/house";
import {Card, CardDescription, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import ClientCopyIcon from "@/components/ui/client-copy-icon";
import Link from "next/link";
import {formatSuiAmount} from "@/lib/utils";
import {CheckIcon, PlusIcon, XIcon} from "lucide-react";
import React, {useEffect} from "react";
import { Button } from "@/components/ui/button";
import {HouseModel} from "@/api/models/openplay-core";

export default function HouseOverviewPage() {
    
    const [houses, setHouses] = React.useState<HouseModel[]>([]);

    useEffect(() => {
        
        const func = async () => {
            const data = await fetchAllHouses();
            setHouses(data);
        }

        func();
    }, []);
    
    return (
        <Card className={"container mx-auto my-8"}>
            <CardHeader>
                <CardTitle>
                    Houses
                </CardTitle>
                <CardDescription>
                    Here you can find an overview of all OpenPlay houses.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href={"/create/house"}>
                    <Button className={"mb-4"}>
                        <PlusIcon className={"w-6 h-6"} strokeWidth={2}/>
                        Create your own house
                    </Button>
                </Link>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                House ID
                            </TableHead>
                            <TableHead>
                                Active
                            </TableHead>
                            <TableHead>
                                Private/Public
                            </TableHead>
                            <TableHead>
                                Stake
                            </TableHead>
                            <TableHead>
                                Profits/Losses
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {houses.map(house => (
                            <TableRow key={house.id.id}>
                                <TableCell>
                                    <div className={"inline-flex items-center gap-2"}>
                                        {house.id.id.slice(0, 6)} ...{house.id.id.slice(-6)}
                                        <ClientCopyIcon value={house.id.id} className={"w-4 h-4"}/>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {house.state.fields.is_active ?
                                        <CheckIcon className={"w-6 h-6 text-green-600"} strokeWidth={2}/>
                                        :
                                        <XIcon className={"w-6 h-6 text-red-600"} strokeWidth={2}/>
                                    }
                                </TableCell>
                                <TableCell>
                                    {house.private ? "Private" : "Public"}
                                </TableCell>
                                <TableCell>
                                    {formatSuiAmount(Number(house.state.fields.active_stake) + Number(house.state.fields.inactive_stake) - Number(house.state.fields.pending_unstake))}
                                </TableCell>
                                <TableCell className={
                                    (Number(house.state.fields.all_time_profits) >= Number(house.state.fields.all_time_losses))
                                        ? "text-green-600" :
                                        "text-red-600"}>
                                    {formatSuiAmount(Number(house.state.fields.all_time_profits - house.state.fields.all_time_losses))}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/house/${house.id.id}`}>
                                        <span className="underline font-semibold">See more</span>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

        </Card>
    )
}