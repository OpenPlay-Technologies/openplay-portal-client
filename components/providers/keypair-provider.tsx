"use client"
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {getOrCreateKeypair} from "@/lib/keypair";
import {fetchAllPlayCaps} from "@/api/queries/balance-manager";
import {PlayCapModel} from "@/api/models/openplay-core";
import {useBalanceManager} from "@/components/providers/balance-manager-provider";
import {useCurrentAccount} from "@mysten/dapp-kit";

/**
 * 1. Create a context to hold the keypair
 */
interface KeypairContextValue {
    keypair: Ed25519Keypair | null;
    isLoading: boolean;
    playCaps: PlayCapModel[];
    activePlayCap: PlayCapModel | null;
    updatePlayCaps: () => void;
}

const KeypairContext = createContext<KeypairContextValue | null>(null);

/**
 * 2. Create a provider component
 */
interface KeypairProviderProps {
    children: ReactNode;
}

export const KeypairProvider: React.FC<KeypairProviderProps> = ({ children }) => {
    const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(true);
    const [playCaps, setPlayCaps] = useState<PlayCapModel[]>([]);
    const [activePlayCap, setActivePlayCap] = useState<PlayCapModel | null>(null);

    const {
        currentBalanceManager,
        selectedBalanceManagerId
    } = useBalanceManager();

    useEffect(() => {
        // On first mount, retrieve or generate the keypair
        const kp = getOrCreateKeypair();
        setKeypair(kp);
        setIsLoading(false);
    }, []);

    // Check if we can resume the game, or whether we need to mint a new play cap
    useEffect(() => {
      // console.log("currentBalanceManager", currentBalanceManager);
        if (account && currentBalanceManager && playCaps.length > 0) {
            const allowedPlayCap = playCaps.find((ownedCap) =>
                currentBalanceManager?.tx_allow_listed?.fields?.contents?.find((allowedCap) => ownedCap.id.id == allowedCap)
            );

          // console.log(allowedPlayCap);
            setActivePlayCap(allowedPlayCap ?? null);
        }
        else {
            setActivePlayCap(null);
        }
    }, [currentBalanceManager, selectedBalanceManagerId, playCaps, account]);
    
    const updatePlayCaps = useCallback(async () => {
        if (!keypair) return;
        const playCaps = await fetchAllPlayCaps(keypair.toSuiAddress());
        setPlayCaps(playCaps);
    }, [keypair]);

    useEffect(() => {
        if (keypair){
            updatePlayCaps();
        }
    }, [account, keypair, currentBalanceManager, updatePlayCaps]);

    return (
        <KeypairContext.Provider value={{ keypair, isLoading, playCaps, updatePlayCaps, activePlayCap }}>
            {children}
        </KeypairContext.Provider>
    );
};

/**
 * 3. Create a custom hook to consume the keypair context
 */
export const useKeypair = (): KeypairContextValue => {
    const context = useContext(KeypairContext);
    if (!context) {
        throw new Error("useKeypair must be used within a KeypairProvider");
    }
    return context;
};