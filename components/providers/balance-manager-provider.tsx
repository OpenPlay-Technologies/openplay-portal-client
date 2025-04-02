"use client";

import { createContext, useEffect, useState, useCallback, useContext, useMemo, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
    fetchAllBalanceManagerCaps,
    fetchAllPlayCaps,
    fetchBalanceManagersByIds
} from "@/api/queries/balance-manager";
import { BalanceManagerCapModel, BalanceManagerModel, PlayCapModel } from "@/api/models/openplay-core";

export interface BalanceManagerProviderContext {
    selectedBalanceManagerId: string | null;
    setSelectedBalanceManagerId: (managerId: string | null) => void;
    currentBalanceManager: BalanceManagerModel | null;
    balanceManagerCaps: BalanceManagerCapModel[];
    balanceManagerData: BalanceManagerModel[];
    currentManagerPlayCaps: PlayCapModel[];
    refreshData: () => Promise<void>;
    refreshPlayCaps: () => Promise<void>;
    currentBalanceManagerCap: BalanceManagerCapModel | null;
    bmLoading: boolean;
    playCapLoading: boolean;
    hasInitialized: boolean;
    error: Error | null;
}

const debug = true;

export const BalanceManagerContext = createContext<BalanceManagerProviderContext | null>(null);

/**
 * Provider for Balance Manager data and related functionality
 */
export const BalanceManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const accountAddress = account?.address;

    // Track previous account address to detect changes
    const previousAddressRef = useRef<string | undefined>(undefined);

    // Data states
    const [selectedBalanceManagerId, setSelectedBalanceManagerId] = useState<string | null>(null);
    const [balanceManagerCaps, setBalanceManagerCaps] = useState<BalanceManagerCapModel[]>([]);
    const [balanceManagerData, setBalanceManagerData] = useState<BalanceManagerModel[]>([]);
    const [currentManagerPlayCaps, setCurrentManagerPlayCaps] = useState<PlayCapModel[]>([]);

    // Loading states
    const [bmLoading, setBmLoading] = useState<boolean>(false);
    const [playCapLoading, setPlayCapLoading] = useState<boolean>(false);
    const [hasInitialized, setHasInitialized] = useState<boolean>(false);

    // Error state
    const [error, setError] = useState<Error | null>(null);

    // Compute derived states using useMemo for performance
    const currentBalanceManager = useMemo(() => {
        if (!selectedBalanceManagerId) return null;
        return balanceManagerData.find(x => x.id.id === selectedBalanceManagerId) ?? null;
    }, [balanceManagerData, selectedBalanceManagerId]);

    const currentBalanceManagerCap = useMemo(() => {
        if (!selectedBalanceManagerId) return null;
        return balanceManagerCaps.find((cap) => cap.balance_manager_id === selectedBalanceManagerId) ?? null;
    }, [balanceManagerCaps, selectedBalanceManagerId]);

    /**
     * Fetch balance manager caps for the current account
     */
    const fetchCaps = useCallback(async (): Promise<BalanceManagerCapModel[]> => {
        if (!accountAddress) {
            if (debug) console.log("fetchCaps: No account address available");
            return [];
        }

        try {
            if (debug) console.log("fetchCaps: Fetching balance manager caps for address:", accountAddress);
            const caps = await fetchAllBalanceManagerCaps(accountAddress);
            if (debug) console.log("fetchCaps: Fetched caps count:", caps.length);
            setBalanceManagerCaps(caps);
            return caps;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("fetchCaps: Failed to fetch balance manager caps:", error);
            setError(error);
            return [];
        }
    }, [accountAddress]);

    /**
     * Fetch balance managers by their IDs
     */
    const fetchManagers = useCallback(async (capsToUse: BalanceManagerCapModel[]): Promise<BalanceManagerModel[]> => {
        if (!accountAddress || capsToUse.length === 0) {
            if (debug) console.log("fetchManagers: No account address or caps available");
            return [];
        }

        try {
            const managerIds = capsToUse.map(cap => cap.balance_manager_id);
            if (debug) console.log("fetchManagers: Fetching managers for IDs:", managerIds.length);

            const managers = await fetchBalanceManagersByIds(managerIds);
            const sortedManagers = managers.sort((a, b) => b.balance - a.balance);

            if (debug) console.log("fetchManagers: Fetched managers count:", sortedManagers.length);
            setBalanceManagerData(sortedManagers);
            return sortedManagers;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("fetchManagers: Failed to fetch balance managers:", error);
            setError(error);
            return [];
        }
    }, [accountAddress]);

    /**
     * Fetch play caps for the current account and filter by selected manager
     */
    const fetchPlayCaps = useCallback(async (): Promise<PlayCapModel[]> => {
        if (!accountAddress) {
            if (debug) console.log("fetchPlayCaps: No account address available");
            return [];
        }

        if (!selectedBalanceManagerId) {
            if (debug) console.log("fetchPlayCaps: No selected balance manager");
            return [];
        }

        setPlayCapLoading(true);
        setError(null);

        try {
            if (debug) console.log("fetchPlayCaps: Fetching play caps for manager:", selectedBalanceManagerId);
            const playCaps = await fetchAllPlayCaps(accountAddress);

            if (!playCaps) {
                if (debug) console.log("fetchPlayCaps: No play caps returned");
                return [];
            }

            if (debug) console.log("fetchPlayCaps: Fetched play caps count:", playCaps.length);

            const filtered = playCaps.filter(cap => cap.balance_manager_id === selectedBalanceManagerId);
            setCurrentManagerPlayCaps(filtered);
            return filtered;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("fetchPlayCaps: Failed to fetch play caps:", error);
            setError(error);
            return [];
        } finally {
            setPlayCapLoading(false);
        }
    }, [accountAddress, selectedBalanceManagerId]);

    /**
     * Refreshes only the play caps for the current selected balance manager
     */
    const refreshPlayCaps = useCallback(async (): Promise<void> => {
        if (!selectedBalanceManagerId || !accountAddress) {
            if (debug) console.log("refreshPlayCaps: No selected manager or account address");
            return;
        }

        setPlayCapLoading(true);
        setError(null);

        try {
            if (debug) console.log("refreshPlayCaps: Refreshing play caps for manager:", selectedBalanceManagerId);
            await fetchPlayCaps();
            if (debug) console.log("refreshPlayCaps: Successfully refreshed play caps");
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("refreshPlayCaps: Failed to refresh play caps:", error);
            setError(error);
        } finally {
            setPlayCapLoading(false);
        }
    }, [accountAddress, selectedBalanceManagerId, fetchPlayCaps]);

    /**
     * Main data fetching function that orchestrates the entire data loading flow
     */
    const fetchAllData = useCallback(async () => {
        if (!accountAddress) {
            if (debug) console.log("fetchAllData: No account address available");
            setHasInitialized(true);
            return;
        }

        setBmLoading(true);
        setError(null);

        try {
            if (debug) console.log("fetchAllData: Starting data fetch for account:", accountAddress);

            // Step 1: Fetch caps
            const caps = await fetchCaps();

            // Step 2: If we have caps, fetch managers
            if (caps.length > 0) {
                const managers = await fetchManagers(caps);

                // Step 3: If we don't have a selected manager but have managers, select the first one
                if (managers.length > 0) {
                    if (!selectedBalanceManagerId ||
                        !managers.some(manager => manager.id.id === selectedBalanceManagerId)) {
                        // Either no manager selected or the selected one is not in the list
                        setSelectedBalanceManagerId(managers[0].id.id);
                    }
                } else {
                    // No managers found, clear selection
                    setSelectedBalanceManagerId(null);
                }
            } else {
                // No caps found, clear managers and selection
                setBalanceManagerData([]);
                setSelectedBalanceManagerId(null);
            }

        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("fetchAllData: Error in data fetching flow:", error);
            setError(error);
        } finally {
            setBmLoading(false);
            setHasInitialized(true);
        }
    }, [accountAddress, fetchCaps, fetchManagers, selectedBalanceManagerId]);

    // Detect account address changes
    useEffect(() => {
        // Check if account address has changed
        if (accountAddress !== previousAddressRef.current) {
            if (debug) console.log("Account address changed from", previousAddressRef.current, "to", accountAddress);

            // If switching to a new address (not just initial load or disconnecting)
            if (accountAddress) {
                // Reset data for the new account
                setBalanceManagerCaps([]);
                setBalanceManagerData([]);
                setCurrentManagerPlayCaps([]);
                setSelectedBalanceManagerId(null);
                setHasInitialized(false);

                // Fetch data for the new account
                fetchAllData();
            } else {
                // Account disconnected, clear all data
                setBalanceManagerCaps([]);
                setBalanceManagerData([]);
                setCurrentManagerPlayCaps([]);
                setSelectedBalanceManagerId(null);
                setError(null);
                setHasInitialized(true);
            }

            // Update ref to track this change
            previousAddressRef.current = accountAddress;
        }
    }, [accountAddress, fetchAllData]);

    // Initialize data on first load
    useEffect(() => {
        if (accountAddress && !hasInitialized) {
            fetchAllData();
        }
    }, [accountAddress, fetchAllData, hasInitialized]);

    // Fetch play caps when selected manager changes
    useEffect(() => {
        if (hasInitialized && selectedBalanceManagerId) {
            fetchPlayCaps();
        }
    }, [selectedBalanceManagerId, fetchPlayCaps, hasInitialized]);

    // Log selected manager ID changes for debugging
    useEffect(() => {
        if (debug) console.log("Selected balance manager id:", selectedBalanceManagerId);
    }, [selectedBalanceManagerId]);

    // Create context value object
    const contextValue: BalanceManagerProviderContext = {
        selectedBalanceManagerId,
        setSelectedBalanceManagerId,
        currentBalanceManager,
        balanceManagerCaps,
        balanceManagerData,
        currentManagerPlayCaps,
        refreshData: fetchAllData,
        refreshPlayCaps,
        currentBalanceManagerCap,
        bmLoading,
        playCapLoading,
        hasInitialized,
        error
    };

    return (
        <BalanceManagerContext.Provider value={contextValue}>
            {children}
        </BalanceManagerContext.Provider>
    );
};

/**
 * Hook to access the Balance Manager context
 */
export const useBalanceManager = () => {
    const context = useContext(BalanceManagerContext);
    if (!context) {
        throw new Error("useBalanceManager must be used within a BalanceManagerProvider");
    }
    return context;
};