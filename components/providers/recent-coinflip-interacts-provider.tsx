"use client"
import {CoinFlipInteraction, getRecentCoinFlipInteractions} from "@/api/queries/coin-flip";
import {createContext, useCallback, useContext, useEffect, useState} from "react";


export interface RecentCoinflipInteractsProviderContext {
    personalRecentInteracts: CoinFlipInteraction[];
    globalRecentInteracts: CoinFlipInteraction[];
    newGlobalRecentInteractCounter: number;
}

export const RecentCoinflipInteractsContext = createContext<RecentCoinflipInteractsProviderContext | null>(null);

export const RecentCoinflipInteractsProvider: React.FC<{ children: React.ReactNode, coinFlipId: string }> = ({ children, coinFlipId }) => {
    const [globalRecentInteracts, setGlobalRecentInteracts] = useState<CoinFlipInteraction[]>([]);
    const [newItemsCount, setNewItemsCount] = useState(0);
    const [previousDigests, setPreviousDigests] = useState(new Set());

    const updateGlobalRecentInteracts = useCallback(async (firstTime: boolean) => {
        const recentInteractions = await getRecentCoinFlipInteractions(coinFlipId);

        // Calculate new items by comparing digests
        const currentDigests = new Set(recentInteractions.map(item => item.digest));
        const newItems = recentInteractions.filter(item => !previousDigests.has(item.digest));


        // 1s delay to avoid spoiling
        setTimeout(() => {
            setGlobalRecentInteracts(recentInteractions)
            setPreviousDigests(currentDigests);
            if (!firstTime){
                setNewItemsCount(newItems.length);
            }
        }, 2000);
    }, [coinFlipId, previousDigests]);

    useEffect(() => {
        // Update every second
        const intervalId = setInterval(() => {
            updateGlobalRecentInteracts(false);
        }, 5000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [updateGlobalRecentInteracts]);

    useEffect(() => {
        updateGlobalRecentInteracts(true);
    }, [updateGlobalRecentInteracts]);
    
    
    return (
        <RecentCoinflipInteractsContext.Provider
            value={{
                personalRecentInteracts: [],
                globalRecentInteracts: globalRecentInteracts,
                newGlobalRecentInteractCounter: newItemsCount
            }}
        >
            {children}
        </RecentCoinflipInteractsContext.Provider>
    );
}

export const useRecentCoinFlipInteracts = () => {
    const context = useContext(RecentCoinflipInteractsContext);
    if (!context) {
        throw new Error("useRecentCoinFlipInteracts must be used within a RecentCoinflipInteractsProvider");
    }
    return context;
};