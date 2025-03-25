import GameLauncher from "@/components/gameplay/game-launcher";

interface OpenPlayConnectGamePageProps {
    gameUrl: string;
    houseId: string;
    bgUrl?: string;
}

export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) {

    return (
        <div className={"flex w-full h-[calc(100vh-72px)] justify-center items-center"}>
            <div className="w-full aspect-video p-16 max-h-[calc(100vh-72px)]">
                <GameLauncher gameUrl={props.gameUrl} houseId={props.houseId} />
            </div>
        </div>
    );
}