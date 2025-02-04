import Banner from "@/components/nav/banner";
import React from "react";
import CoinFlipSlider from "@/components/games/coin-flip-slider";

export default function GamesPage() {
    return (
        <div>
            <Banner />
            {/*<CoinFlipGrid />*/}
            <CoinFlipSlider title={"Coin Flip"} />
        </div>
    );
}