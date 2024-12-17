import Image from "next/image";
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {
    ArrowDownIcon,
    ArrowUpIcon
} from '@heroicons/react/24/outline'

export function GameCard() {

    const isProfitable = true;

    return (
        <Card className="w-72 overflow-hidden flex-shrink-0">
            <CardHeader className="p-0">
                <div className="relative w-full h-48">
                    <Image
                        src="/coinflip-banner.jpg"
                        alt="Coin flip banner"
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">06 87&apos;s Coin Flip</h2>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Active Stake</p>
                        <p className="font-medium">500.01 SUI</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Profits/Losses</p>
                        <div className={`flex items-center ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfitable ? (
                                <ArrowUpIcon className="w-4 h-4 mr-1"/>
                            ) : (
                                <ArrowDownIcon className="w-4 h-4 mr-1"/>
                            )}
                            <span className="font-medium">{Number(1.01).toLocaleString()} SUI</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

}