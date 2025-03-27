/* eslint-disable @next/next/no-img-element */
import { Card } from "@/components/ui/card";
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
            <Card className="relative w-[250px] md:w-[300px] h-[300px] md:h-[400px] overflow-hidden">
                <div className="relative w-full h-full">
                    <img
                        src={props.image}
                        alt={`${props.id}-banner`}
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent">
                        <h2 className="text-white text-lg md:text-xl font-bold drop-shadow-md">
                            {props.title}
                        </h2>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
