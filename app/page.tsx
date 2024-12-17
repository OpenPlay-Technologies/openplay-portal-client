import React from "react";
import {GameSlider} from "@/components/games/game-slider";
import FeaturedGames from "@/components/games/featured-games";

export default function Home() {
    return (
        <div>
            <div className={"relative mt-[-100px] pt-[100px] overflow-hidden flex flex-col w-full"}>
                <div
                    className="absolute inset-0 w-full h-full bg-[url('/coinflip-banner.jpg')] bg-cover bg-center filter blur-2xl scale-110"></div>
                <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-b from-black to-black/0 via-black/20 via-30%"></div>
                <div
                    className="absolute bottom-0 w-full h-full bg-gradient-to-b from-transparent to-background"></div>
                <FeaturedGames/>
            </div>
            <GameSlider title={"Coin Flip"}/>
            <GameSlider title={"Roulette"}/>
        </div>

    );
}

