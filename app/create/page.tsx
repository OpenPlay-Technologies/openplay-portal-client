import {Card, CardContent, CardHeader} from "@/components/ui/card";
import Link from "next/link";
import {CircleStackIcon, LifebuoyIcon} from "@heroicons/react/24/outline";
import {CherryIcon} from "lucide-react";
import React from "react";

export default function CreateGamePage() {
    return (

        <Card className="w-1/2 w-lg min-w-72">
            <CardHeader>
                <h1 className={"text-2xl font-semibold"}>
                    Create a Game
                </h1>
                <p className={"text-muted-foreground"}>
                    Create a game to become the owner of the game. You can choose all of the parameters and you
                    will receive the ownership token of the game.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p>
                        Select which type of game you want to create:
                    </p>
                    <Link
                        href={"/create/coin-flip"}
                        className="flex items-center gap-4 cursor-pointer hover:bg-muted p-4 rounded-lg">
                        <CircleStackIcon className="h-6 w-6 text-card-foreground"/>
                        <p className="text-card-foreground">Coin Flip</p>
                    </Link>
                    <div
                        className="flex items-center gap-4 p-4 rounded-lg">
                        <LifebuoyIcon className="h-6 w-6 text-muted-foreground"/>
                        <p className="text-muted-foreground">Roulette (Coming soon)</p>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg">
                        <CherryIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                        <p className="text-muted-foreground">Slots (Coming soon)</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
