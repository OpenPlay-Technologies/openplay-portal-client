"use client"
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
// import {getOrCreateKeypair} from "@/lib/keypair";
// import {fetchAllPlayCaps} from "@/api/queries/balance-manager";
// import {PlayCapModel} from "@/api/models/openplay-core";
// import {useBalanceManager} from "@/components/providers/balance-manager-provider";
// import {useCurrentAccount} from "@mysten/dapp-kit";
import { getOrCreateWalletId } from "@/lib/local-wallet-id";
import { getInvisWalletAddress, TryCreateInvisWallet } from "@/app/actions";
import { PlayCapModel } from "@/api/models/openplay-core";
import {fetchAllPlayCaps} from "@/api/queries/balance-manager";
import { useBalanceManager } from "./balance-manager-provider";
import { useCurrentAccount } from "@mysten/dapp-kit";

/**
 * 1. Create a context to hold the keypair
 */
interface InvisibleWalletContextValue {
    walletId: string | null;
    isLoading: boolean;
    walletAddress: string | null;
    playCaps: PlayCapModel[];
    activePlayCap: PlayCapModel | null;
    updatePlayCaps: () => void;
}

const InvisibleWalletContext = createContext<InvisibleWalletContextValue | null>(null);

/**
 * 2. Create a provider component
 */
interface InvisibleWalletProviderProps {
    children: ReactNode;
}

export const InvisibleWalletProvider: React.FC<InvisibleWalletProviderProps> = ({ children }) => {
    const [walletId, setWalletId] = useState<string | null>(null);
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(true);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [playCaps, setPlayCaps] = useState<PlayCapModel[]>([]);
    const [activePlayCap, setActivePlayCap] = useState<PlayCapModel | null>(null);

    const {
        currentBalanceManager,
    } = useBalanceManager();

    useEffect(() => {
        // On first mount, retrieve or generate the keypair
        const walletId = getOrCreateWalletId();
        setWalletId(walletId);
        setIsLoading(false);
    }, []);



    useEffect(() => {

        async function updateWalletAddress() {
            if (walletId) {
                await TryCreateInvisWallet(walletId);

                const address = await getInvisWalletAddress(walletId);
                setWalletAddress(address);
                console.log("walletAddress", address);
            }
        }
        updateWalletAddress();
    }, [walletId]);

    // Check if we can resume the game, or whether we need to mint a new play cap
    useEffect(() => {
        if (account && currentBalanceManager && playCaps.length > 0) {
            const allowedPlayCap = playCaps.find((ownedCap) =>
                currentBalanceManager?.tx_allow_listed?.fields?.contents?.find((allowedCap) => ownedCap.id.id == allowedCap)
            );
            setActivePlayCap(allowedPlayCap ?? null);
        }
        else {
            setActivePlayCap(null);
        }
    }, [currentBalanceManager, playCaps, account]);
    
    const updatePlayCaps = useCallback(async () => {
        if (!walletAddress) return;
        const playCaps = await fetchAllPlayCaps(walletAddress);
        setPlayCaps(playCaps);
    }, [walletAddress]);

    useEffect(() => {
        updatePlayCaps();
    }, [updatePlayCaps]);

    return (
        <InvisibleWalletContext.Provider 
        value={{ isLoading, walletId, walletAddress, playCaps, updatePlayCaps, activePlayCap }}>
        {/* value={{ keypair, isLoading, playCaps, updatePlayCaps, activePlayCap }}> */}
            {children}
        </InvisibleWalletContext.Provider>
    );
};

/**
 * 3. Create a custom hook to consume the keypair context
 */
export const useInvisibleWallet = (): InvisibleWalletContextValue => {
    const context = useContext(InvisibleWalletContext);
    if (!context) {
        throw new Error("useInvisibleWallet must be used within a InvisibleWalletProvider");
    }
    return context;
};