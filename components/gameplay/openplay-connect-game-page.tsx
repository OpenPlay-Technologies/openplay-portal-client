"use client";
import { useEffect, useState } from 'react';
import GameLauncher from "@/components/gameplay/game-launcher";

interface OpenPlayConnectGamePageProps {
    gameUrl: string;
    houseId: string;
    bgUrl?: string;
}

export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) {
    const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";
    const baseOffset = isMainnet ? "72px" : "104px";
    const desktopHeight = `calc(100vh - ${baseOffset})`;
    const desktopMaxWidth = `calc((100vh - ${baseOffset}) * 4/3)`;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        // Mobile: full-screen overlay that covers the header and takes all available space.
        return (
            <div 
                className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center"
            >
                <div className="w-full h-full">
                    <GameLauncher gameUrl={props.gameUrl} houseId={props.houseId} />
                </div>
            </div>
        );
    }

    // Desktop: the original 4:3 aspect ratio container.
    return (
        <div 
            className="flex w-full justify-center items-center"
            style={{
                height: desktopHeight,
                backgroundImage: props.bgUrl ? `url(${props.bgUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="w-full aspect-[4/3] max-h-full" style={{ maxWidth: desktopMaxWidth }}>
                <GameLauncher gameUrl={props.gameUrl} houseId={props.houseId} />
            </div>
        </div>
    );
}