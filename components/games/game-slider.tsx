import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import CoinFlipGameCard from "@/components/games/game-card";

interface GameData {
    id: string;
    title: string;
    image: string;
    url: string;
}

const games: GameData[] = [
    {
        id: "1",
        title: "Sui vs Sol",
        image: "/sui-vs-sol-thumbnail.png",
        url: "/coin-flip/sui-vs-sol",
    },
    {
        id: "2",
        title: "Piggy Bank",
        image: "/piggy-bank-thumbnail.png",
        url: "/piggy-bank",
    }
]

export default async function GameSlider() {    
    return (
        <div className={"p-8 mx-8"}>
            <Carousel className="w-full" opts={{
                align: "start",
                slidesToScroll: "auto"
            }}>
                <CarouselContent className="-ml-1">
                    {games.map((data) => {
                        return (
                            <CarouselItem key={data.id} className="pl-1 basis-1/8">
                                <div className="p-1">
                                    <CoinFlipGameCard
                                        url={data.url}
                                        title={data.title}
                                        image={data.image}
                                        id={data.id}
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