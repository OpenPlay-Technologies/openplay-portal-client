"use client";
import SessionExpiredCard from './session-expired-card';
import OpenPlayConnectGame from './openplay-connect-game';
import { useWalletAuth } from '../providers/wallet-auth-context-provider';
import { useMemo, useRef } from 'react';
import { useBalanceManager } from '../providers/balance-manager-provider';
import FirstDepositCard from './first-deposit-card';
import { useInvisibleWallet } from '../providers/invisible-wallet-provider';
import LoaderCard from '../ui/loader-card';
import { useAlert } from '../providers/alert-provider';

interface OpenPlayConnectGamePageProps {
    gameUrl: string;
    houseId: string;
    bgUrl?: string;
}

// interface HTMLElementWithFullscreen extends HTMLDivElement {
//     webkitRequestFullscreen?: () => Promise<void>;
//     msRequestFullscreen?: () => Promise<void>;
// }

export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) {
    const { alertHeight } = useAlert();
    // Add state to control button visibility
    // const [showFullscreenButton, setShowFullscreenButton] = useState(true);
    // Ref for the timeout
    // const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const baseOffset = (72 + alertHeight) + "px"; // Header + Footer + Alert height
    const containerHeight = `calc(100vh - ${baseOffset})`;
    const desktopMaxWidth = `calc((100vh - ${baseOffset}) * 4/3)`;

    const { isConnected, isLoading: isAuthLoading } = useWalletAuth();
    const {
        currentBalanceManager,
        bmLoading,
        playCapLoading
    } = useBalanceManager();
    const { activePlayCap, isLoading: isInvisWalletLoading } = useInvisibleWallet();

    // Create a ref for the outer container
    const containerRef = useRef<HTMLDivElement>(null);

    // // Function to handle tapping and entering full screen
    // const handleFullScreen = () => {
    //     const element = containerRef.current as HTMLElementWithFullscreen;
    //     if (element) {
    //         if (element.requestFullscreen) {
    //             element.requestFullscreen();
    //         } else if (element.webkitRequestFullscreen) {
    //             element.webkitRequestFullscreen();
    //         } else if (element.msRequestFullscreen) {
    //             element.msRequestFullscreen();
    //         }
    //     }
    //     setShowFullscreenButton(false); // Hide the button after entering fullscreen
    // };

    // // Function to show the button temporarily
    // const showButtonTemporarily = () => {
    //     // Clear any existing timeout
    //     if (timeoutRef.current) {
    //         clearTimeout(timeoutRef.current);
    //     }

    //     // Show the button
    //     setShowFullscreenButton(true);

    //     // Set a new timeout to hide it
    //     timeoutRef.current = setTimeout(() => {
    //         setShowFullscreenButton(false);
    //     }, 50000); // Hide after 3 seconds
    // };

    // // Set up the initial timeout when the component mounts
    // useEffect(() => {
    //     showButtonTemporarily();

    //     // Add touch/click event listener to the container to show the button
    //     const container = containerRef.current;
    //     if (container) {
    //         container.addEventListener('click', showButtonTemporarily);
    //         container.addEventListener('touchstart', showButtonTemporarily);
    //     }

    //     // Clean up the timeout and event listeners when unmounting
    //     return () => {
    //         if (timeoutRef.current) {
    //             clearTimeout(timeoutRef.current);
    //         }
    //         if (container) {
    //             container.removeEventListener('click', showButtonTemporarily);
    //             container.removeEventListener('touchstart', showButtonTemporarily);
    //         }
    //     };
    // }, []);

    const content = useMemo(() => {
        // First check if it's still loading
        if (isAuthLoading || bmLoading || playCapLoading || isInvisWalletLoading) {
            return <LoaderCard />;
        }
        // Early return if not connected
        if (!isConnected) {
            return <div />;
        }
        // First deposit
        if (!currentBalanceManager) {
            return <FirstDepositCard />;
        }
        // No play cap
        if (!activePlayCap) {
            return <SessionExpiredCard />;
        }
        // Gameplay
        return <OpenPlayConnectGame gameUrl={props.gameUrl} houseId={props.houseId} />;
    }, [activePlayCap, bmLoading, currentBalanceManager, isAuthLoading, isConnected, isInvisWalletLoading, playCapLoading, props.gameUrl, props.houseId]);

    return (
        <div
            ref={containerRef}
            className="w-full flex justify-center items-center"
            style={{
                height: containerHeight,
                backgroundImage: props.bgUrl ? `url(${props.bgUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Single container with responsive styling */}
            <div
                className="fixed z-50 inset-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] w-full h-full md:static md:h-auto md:aspect-[4/3] md:max-h-full md:p-4"
                style={{ maxWidth: desktopMaxWidth }}
            >
                {/* {showFullscreenButton && (
                    <Button
                        onClick={handleFullScreen}
                        className="absolute bottom-4 mx-auto md:hidden w-full max-w-sm transition-opacity duration-300"
                        variant="accent"
                        size="lg"
                    >
                        Go Fullscreen
                    </Button>
                )} */}
                <div className="w-full h-full md:rounded-lg md:overflow-hidden">
                    {content}
                </div>
            </div>
        </div>
    );
}