/* eslint-disable @next/next/no-img-element */
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import Link from "next/link";

interface GameCardProps {
    id: string;
    title: string;
    image: string;
    url: string;
}

export default function GameCard(props: GameCardProps) {
    return (
        <Link href={props.url}>
            <Card className={"w-[300px] h-auto overflow-hidden"}>
                <CardHeader className="p-0">
                    <div className="relative w-full h-full">
                        <img
                            src={props.image}
                            alt={props.id + "-banner"}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-4 bg-card">
                    <h2 className="text-lg font-bold mb-2 line-clamp-1">{props.title}</h2>
                </CardContent>
            </Card>
        </Link>
    );
}