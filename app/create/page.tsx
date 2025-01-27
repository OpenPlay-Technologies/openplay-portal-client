import {Card, CardContent, CardHeader} from "@/components/ui/card";
import Link from "next/link";
import {LandmarkIcon} from "lucide-react";
import React from "react";

export default function CreateGamePage() {
    return (

        <Card className="w-1/2 w-lg min-w-72">
            <CardHeader>
                <h1 className={"text-2xl font-semibold"}>
                    Create
                </h1>
                <p className={"text-muted-foreground"}>
                    Create a house to become the owner of the house.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <Link
                        href={"/create/house"}
                        className="flex items-center gap-4 cursor-pointer hover:bg-muted p-4 rounded-lg">
                        <LandmarkIcon className="h-6 w-6 text-card-foreground" strokeWidth={1.5}/>
                        <p className="text-card-foreground">House</p>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
