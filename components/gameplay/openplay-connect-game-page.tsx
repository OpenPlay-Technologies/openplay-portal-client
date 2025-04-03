"use client";
import SessionExpiredCard from './session-expired-card';
import OpenPlayConnectGame from './openplay-connect-game';
import { useWalletAuth } from '../providers/wallet-auth-context-provider';
import { useMemo } from 'react';
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

export default function OpenPlayConnectGamePage(props: OpenPlayConnectGamePageProps) {
    // Calculate values based on network type

    const {alertHeight} = useAlert();

    const baseOffset = (72 + alertHeight) + "px"; // Header + Footer + Alert height
    const desktopHeight = `calc(100vh - ${baseOffset})`;
    const desktopMaxWidth = `calc((100vh - ${baseOffset}) * 4/3)`;


    const { isConnected, isLoading: isAuthLoading } = useWalletAuth();
    const {
        currentBalanceManager,
        bmLoading,
        playCapLoading
    } = useBalanceManager();
    const { activePlayCap, isLoading: isInvisWalletLoading } = useInvisibleWallet();

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
        <>
            {/* Mobile Layout: visible on screens smaller than md */}
            <div
                className="md:hidden w-full flex justify-center items-center"
                style={{ height: desktopHeight }}
            >
                <div className="w-full h-full">
                    {content}
                </div>
            </div>

            {/* Desktop Layout: visible on md and larger screens */}
            <div
                className="hidden md:flex w-full justify-center items-center"
                style={{
                    height: desktopHeight,
                    backgroundImage: props.bgUrl ? `url(${props.bgUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div
                    className="w-full aspect-[4/3] max-h-full p-4"
                    style={{ maxWidth: desktopMaxWidth }}
                >
                    <div className="w-full h-full rounded-lg overflow-hidden">
                        {content}
                    </div>
                </div>
            </div>
        </>
    );
}
