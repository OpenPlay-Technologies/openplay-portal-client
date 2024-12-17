import {GameCard} from "@/components/games/game-card";

interface GameSliderProps {
    title: string;
}

export function GameSlider(props: GameSliderProps) {
    return (
        <div className={"px-8 py-4"}>
            <h2 className={"text-xl font-bold my-4"}>
                {props.title}
            </h2>
            <div className={"flex flex-row flex-wrap gap-4"}>
                <GameCard />
                <GameCard />
                <GameCard />
            </div>
        </div>
    );
}