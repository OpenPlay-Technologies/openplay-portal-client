import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import GameCard from "@/components/games/game-card";

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
        image: "/sui-vs-sol thumbnail.png",
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
        <div className="p-4 md:p-8">
            <Carousel className="w-full" opts={{ align: "start", slidesToScroll: "auto" }}>
                <CarouselContent className="-ml-2 md:-ml-8">
                    {games.map((data) => (
                        <CarouselItem key={data.id} className="pl-2 md:pl-8 basis-auto">
                            <GameCard
                                url={data.url}
                                title={data.title}
                                image={data.image}
                                id={data.id}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {/* <CarouselPrevious /> */}
                {/* <CarouselNext /> */}
            </Carousel>
        </div>
    );
}
