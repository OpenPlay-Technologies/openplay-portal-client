import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {formatBps} from "@/lib/utils";
import Link from "next/link";

interface CoinFlipGameCardProps {
    id: string;
    title: string;
    image: string;
    url: string;
    maxStake: number;
    houseEdgeBps: number;
    payoutFactorBps: number;
}

export default function CoinFlipGameCard(props: CoinFlipGameCardProps) {
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
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">House Edge</p>
                            <p className="font-medium truncate">
                                {formatBps(props.houseEdgeBps)}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">Payout Factor</p>
                            <p className="font-medium truncate">
                                {formatBps(props.payoutFactorBps)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}