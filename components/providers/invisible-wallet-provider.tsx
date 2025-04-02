"use client";

import { createContext, useEffect, useState, useCallback, useContext, useMemo, useRef } from "react";
import { getOrCreateWalletId } from "@/lib/local-wallet-id";
import { getInvisWalletAddress, TryCreateInvisWallet } from "@/app/actions";
import { PlayCapModel } from "@/api/models/openplay-core";
import { fetchAllPlayCaps } from "@/api/queries/balance-manager";
import { useBalanceManager } from "./balance-manager-provider";

export interface InvisibleWalletContextValue {
    walletId: string | null;
    walletAddress: string | null;
    playCaps: PlayCapModel[];
    activePlayCap: PlayCapModel | null;
    updatePlayCaps: () => Promise<void>;
    isLoading: boolean;
    playCapLoading: boolean;
    hasInitialized: boolean;
    error: Error | null;
}

const debug = true;

const InvisibleWalletContext = createContext<InvisibleWalletContextValue | null>(null);

/**
 * Provider for Invisible Wallet functionality and related data
 */
export const InvisibleWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentBalanceManager } = useBalanceManager();
    
    // Basic wallet states
    const [walletId, setWalletId] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    
    // Data states
    const [playCaps, setPlayCaps] = useState<PlayCapModel[]>([]);
    
    // Loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [playCapLoading, setPlayCapLoading] = useState<boolean>(false);
    const [hasInitialized, setHasInitialized] = useState<boolean>(false);
    
    // Error state
    const [error, setError] = useState<Error | null>(null);
    
    // Track dependency changes
    const walletAddressRef = useRef<string | null>(null);
    const balanceManagerIdRef = useRef<string | null>(null);

    // Derive active play cap from current balance manager and play caps
    const activePlayCap = useMemo(() => {
        if (!currentBalanceManager || playCaps.length === 0) {
            if (debug) console.log("activePlayCap: No balance manager or play caps available");
            return null;
        }
        
        const allowListedCaps = currentBalanceManager.tx_allow_listed?.fields?.contents || [];
        
        if (debug) {
            console.log("activePlayCap calculation:", {
                playCapsCount: playCaps.length,
                allowListedCapsCount: allowListedCaps.length
            });
        }
        
        const allowedPlayCap = playCaps.find(cap => 
            allowListedCaps.some(allowedCapId => cap.id.id === allowedCapId)
        );
        
        if (debug) {
            console.log("activePlayCap result:", allowedPlayCap ? allowedPlayCap.id.id : "none found");
        }
        
        return allowedPlayCap || null;
    }, [currentBalanceManager, playCaps]);

    /**
     * Initialize or retrieve wallet ID
     */
    const initializeWalletId = useCallback(async () => {
        try {
            if (debug) console.log("initializeWalletId: Retrieving or creating wallet ID");
            const id = getOrCreateWalletId();
            setWalletId(id);
            if (debug) console.log("initializeWalletId: Wallet ID set", id);
            return id;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("initializeWalletId: Failed to initialize wallet ID:", error);
            setError(error);
            return null;
        }
    }, []);

    /**
     * Create wallet and get its address
     */
    const initializeWalletAddress = useCallback(async (id: string) => {
        if (!id) {
            if (debug) console.log("initializeWalletAddress: No wallet ID provided");
            return null;
        }

        try {
            if (debug) console.log("initializeWalletAddress: Creating invisible wallet for ID:", id);
            await TryCreateInvisWallet(id);
            
            if (debug) console.log("initializeWalletAddress: Getting wallet address");
            const address = await getInvisWalletAddress(id);
            
            if (debug) console.log("initializeWalletAddress: Wallet address obtained:", address);
            setWalletAddress(address);
            return address;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("initializeWalletAddress: Failed to initialize wallet address:", error);
            setError(error);
            return null;
        }
    }, []);

    /**
     * Fetch play caps for the current wallet address
     */
    const fetchPlayCaps = useCallback(async (): Promise<PlayCapModel[]> => {
        if (!walletAddress) {
            if (debug) console.log("fetchPlayCaps: No wallet address available");
            return [];
        }

        setPlayCapLoading(true);
        setError(null);

        try {
            if (debug) console.log("fetchPlayCaps: Fetching play caps for wallet:", walletAddress);
            const caps = await fetchAllPlayCaps(walletAddress);
            
            if (debug) console.log("fetchPlayCaps: Fetched play caps count:", caps.length);
            setPlayCaps(caps);
            return caps;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("fetchPlayCaps: Failed to fetch play caps:", error);
            setError(error);
            return [];
        } finally {
            setPlayCapLoading(false);
        }
    }, [walletAddress]);

    /**
     * Public method to update play caps
     */
    const updatePlayCaps = useCallback(async (): Promise<void> => {
        if (!walletAddress) {
            if (debug) console.log("updatePlayCaps: No wallet address available");
            return;
        }

        if (debug) console.log("updatePlayCaps: Updating play caps");
        await fetchPlayCaps();
    }, [walletAddress, fetchPlayCaps]);

    // Initialize wallet on component mount
    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            
            try {
                // Step 1: Get or create wallet ID
                const id = await initializeWalletId();
                if (!id) return;
                
                // Step 2: Initialize wallet address
                await initializeWalletAddress(id);
                
                setHasInitialized(true);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                console.error("Initialization error:", error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };
        
        initialize();
    }, [initializeWalletId, initializeWalletAddress]);

    // Fetch play caps when wallet address changes or is initially set
    useEffect(() => {
        if (walletAddress && walletAddress !== walletAddressRef.current) {
            if (debug) console.log("Effect: Wallet address changed, fetching play caps");
            walletAddressRef.current = walletAddress;
            fetchPlayCaps();
        }
    }, [walletAddress, fetchPlayCaps]);

    // Log balance manager changes for debugging
    useEffect(() => {
        if (currentBalanceManager?.id?.id !== balanceManagerIdRef.current) {
            if (debug) {
                console.log("Effect: Balance manager changed:", 
                    currentBalanceManager ? currentBalanceManager.id.id : "null");
            }
            balanceManagerIdRef.current = currentBalanceManager?.id?.id || null;
        }
    }, [currentBalanceManager]);

    // Log active play cap changes for debugging
    useEffect(() => {
        if (debug) {
            console.log("Active play cap:", activePlayCap ? activePlayCap.id.id : "null");
        }
    }, [activePlayCap]);

    // Create context value
    const contextValue: InvisibleWalletContextValue = {
        walletId,
        walletAddress,
        playCaps,
        activePlayCap,
        updatePlayCaps,
        isLoading,
        playCapLoading,
        hasInitialized,
        error
    };

    return (
        <InvisibleWalletContext.Provider value={contextValue}>
            {children}
        </InvisibleWalletContext.Provider>
    );
};

/**
 * Hook to access the Invisible Wallet context
 */
export const useInvisibleWallet = (): InvisibleWalletContextValue => {
    const context = useContext(InvisibleWalletContext);
    if (!context) {
        throw new Error("useInvisibleWallet must be used within an InvisibleWalletProvider");
    }
    return context;
};