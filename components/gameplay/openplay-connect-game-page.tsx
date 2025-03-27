import GameLauncher from "@/components/gameplay/game-launcher"; 
 
interface OpenPlayConnectGamePageProps { 
    gameUrl: string; 
    houseId: string; 
    bgUrl?: string; 
} 
 
export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) { 
    const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet"; 
    const baseOffset = isMainnet ? "72px" : "104px"; 
 
    // Calculate height and maxWidth using the same baseOffset value. 
    const height = `calc(100vh - ${baseOffset})`; 
    const maxWidth = `calc((100vh - ${baseOffset}) * 4/3)`; 
 
    return ( 
        <div 
            className="flex w-full justify-center items-center" 
            style={{ 
                height, 
                backgroundImage: props.bgUrl ? `url(${props.bgUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        > 
            <div className="w-full aspect-[4/3] max-h-full" style={{ maxWidth }}> 
                <GameLauncher gameUrl={props.gameUrl} houseId={props.houseId} /> 
            </div> 
        </div> 
    ); 
}