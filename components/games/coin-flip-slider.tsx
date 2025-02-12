import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import CoinFlipGameCard from "@/components/games/coinflip-game-card";
import {fetchGame} from "@/api/queries/games";
import {gameMetaData} from "@/lib/game-metadata";

export default async function CoinFlipSlider() {
    const gameId = gameMetaData.id;
    const gameData = await fetchGame(gameId);
    
    return (
        <div className={"p-8 mx-8"}>
            <h2 className={"font-semibold text-2xl mb-2"}>
                Coin Flip
            </h2>
            <Carousel className="w-full" opts={{
                align: "start",
                slidesToScroll: "auto"
            }}>
                <CarouselContent className="-ml-1">
                    {[gameMetaData].map((data) => {
                        if (!gameData) return null;
                        return (
                            <CarouselItem key={data.id} className="pl-1 basis-1/8">
                                <div className="p-1">
                                    <CoinFlipGameCard
                                        url={data.url}
                                        title={data.title}
                                        image={data.image}
                                        houseEdgeBps={Number(gameData.house_edge_bps)}
                                        payoutFactorBps={Number(gameData.payout_factor_bps)}
                                        id={data.id}
                                        maxStake={Number(gameData.max_stake)}
                                    />
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious/>
                <CarouselNext/>
            </Carousel>
        </div>
    );
}