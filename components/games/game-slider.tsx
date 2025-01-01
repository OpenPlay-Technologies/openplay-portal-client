import {GameCard} from "@/components/games/game-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

interface GameSliderProps {
    title: string;
}

export function GameSlider(props: GameSliderProps) {
    return (
        <div className={"p-8 mx-8"}>
            <h2 className={"font-semibold text-2xl mb-2"}>
                {props.title}
            </h2>
            <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                    {Array.from({ length: 50 }).map((_, index) => (
                        <CarouselItem key={index} className="pl-1 basis-1/8">
                            <div className="p-1">
                                <GameCard/>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}