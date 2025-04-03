import { ComingSoonGameCard } from "@/components/games-ui/coming-soon-game-card";
import { GameCardV2 } from "@/components/games-ui/game-card-v2";
import CollaborationCTA from "@/components/home/collaboration-cta";
import Banner from "@/components/home/banner";
import React from "react";


export default function GamesPage() {
    return (
        <div>
            <Banner />
            {/* Games Section */}
            <section className="container mx-auto py-12 md:py-16 px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">
                    <span className="text-primary">Our</span>{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-openplay1 to-openplay2">Games</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                    <GameCardV2
                        href="/play/piggy-bank"
                        src="/piggy-bank/piggy-bank-thumbnail.png"
                        alt="Piggy Bank"
                        title="Piggy Bank"
                    />
                    <GameCardV2
                        href="/play/sui-vs-sol"
                        src="/sui-vs-sol/sui-vs-sol thumbnail.png"
                        alt="Sui vs Sol"
                        title="Sui vs Sol"
                    />
                    <ComingSoonGameCard />
                </div>
            </section>
            <CollaborationCTA />
        </div>
    );
}