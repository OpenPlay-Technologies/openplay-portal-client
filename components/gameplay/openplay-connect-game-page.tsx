import GameLauncher from "@/components/gameplay/game-launcher";

interface OpenPlayConnectGamePageProps {
    gameUrl: string;
    houseId: string;
    bgUrl?: string;
}

export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) {

    const network = process.env.NEXT_PUBLIC_NETWORK ?? "localnet";

    const height = network != "mainnet" ? "calc(100vh - 104px)" : "calc(100vh - 72px)";

    return (
        <div className={"flex w-full justify-center items-center p-8"} style={{ height }}>
            <div className={"w-full aspect-[4/3] max-h-full max-w-[calc((100vh-72px)*4/3)]"}>
                <GameLauncher gameUrl={props.gameUrl} houseId={props.houseId} />
            </div>
        </div>
    );
}