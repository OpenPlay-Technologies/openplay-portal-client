import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import CoinFlipGameCard from "@/components/games/coinflip-game-card";
import {fetchAllCoinFlipGames} from "@/api/queries/games";

const gameData = [
    {
        id: "0x3f88bb4fe1ecd4d5a1ea7a80c79359a9c00ebfceb8cffc9a57168b8f3dd19d4f",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
    }
]

interface GameSliderProps {
    title: string;
}

export default async function CoinFlipSlider(props: GameSliderProps) {
    const coinFlipGames = await fetchAllCoinFlipGames();
    
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
                    {gameData.map((data) => {
                        const game = coinFlipGames.find((game) => game.id === data.id);
                        if (!game) return null;

                        return (
                            <CarouselItem key={game.id} className="pl-1 basis-1/8">
                                <div className="p-1">
                                    <CoinFlipGameCard
                                        url={data.url + "?gameId=" + game.id}
                                        title={data.title}
                                        image={data.image}
                                        houseEdgeBps={Number(game.house_edge_bps)}
                                        payoutFactorBps={Number(game.payout_factor_bps)}
                                        id={game.id}
                                        maxStake={Number(game.max_stake)}
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