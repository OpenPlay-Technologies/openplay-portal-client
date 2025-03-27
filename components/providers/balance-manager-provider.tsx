"use client";

import {createContext, useEffect, useState, useCallback, useContext} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
    fetchAllBalanceManagerCaps,
    fetchAllPlayCaps,
    fetchBalanceManagersByIds
} from "@/api/queries/balance-manager";
import {BalanceManagerCapModel, BalanceManagerModel, PlayCapModel} from "@/api/models/openplay-core";

export interface BalanceManagerProviderContext {
    selectedBalanceManagerId: string | null;
    setSelectedBalanceManagerId: (manager: string | null) => void;
    currentBalanceManager: BalanceManagerModel | null;
    balanceManagerCaps: BalanceManagerCapModel[];
    balanceManagerData: BalanceManagerModel[];
    currentManagerPlayCaps: PlayCapModel[];
    refreshBalanceManagerCaps: () => Promise<void>; // Expose this function for manual refresh
    refreshBalanceManagers: () => Promise<void>; // Expose this function for manual refresh
    refreshPlayCaps: () => Promise<void>; // Expose this function for manual refresh
    currentBalanceManagerCap: BalanceManagerCapModel | null;
    bmLoading: boolean;
    playCapLoading: boolean;
}

const debug = true;

export const BalanceManagerContext = createContext<BalanceManagerProviderContext | null>(null);

export const BalanceManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [selectedBalanceManagerId, setSelectedBalanceManagerId] = useState<string | null>(null);
    const [currentBalanceManager, setCurrentBalanceManager] = useState<BalanceManagerModel | null>(null);
    const [balanceManagerCaps, setBalanceManagerCaps] = useState<BalanceManagerCapModel[]>([]);
    const [balanceManagerData, setBalanceManagerData] = useState<BalanceManagerModel[]>([]);
    const [currentManagerPlayCaps, setCurrentManagerPlayCaps] = useState<PlayCapModel[]>([]);
    const [currentBalanceManagerCap, setCurrentBalanceManagerCap] = useState<BalanceManagerCapModel | null>(null);

    // Loading
    const [bmLoading, setBmLoading] = useState<boolean>(false);
    const [playCapLoading, setPlayCapLoading] = useState<boolean>(false);

    useEffect(() => {
        setCurrentBalanceManager(selectedBalanceManagerId ? balanceManagerData.find(x => x.id.id == selectedBalanceManagerId) ?? null : null);
    }, [balanceManagerData, selectedBalanceManagerId]);

    useEffect(() => {
        if (selectedBalanceManagerId && balanceManagerCaps) {
            const currentCap = balanceManagerCaps.find((cap) => cap.balance_manager_id === selectedBalanceManagerId);
            setCurrentBalanceManagerCap(currentCap ?? null);
        }
        else {
            setCurrentBalanceManagerCap(null);
        }
    }, [balanceManagerCaps, selectedBalanceManagerId]);

    useEffect(() => {
        if (debug) console.log("Selected balance manager id:", selectedBalanceManagerId);
    }, [selectedBalanceManagerId]);

    const fetchBalanceManagerCaps = useCallback(async () => {
        if (!account?.address) {
            if (debug) console.log("[fetchBalanceManagerCaps] No account address found");
            return;
        }
        try {
            setBmLoading(true);
            if (debug) console.log("[fetchBalanceManagerCaps] Fetching balance manager caps");
            const fetchedBalanceManagerCaps = await fetchAllBalanceManagerCaps(account.address);
            if (debug) console.log("[fetchBalanceManagerCaps] Fetched balance manager caps:", fetchedBalanceManagerCaps.length);
            setBalanceManagerCaps(fetchedBalanceManagerCaps);
            setBmLoading(false);
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account?.address]);

    const fetchBalanceManagers = useCallback(async () => {
        if (!account?.address || !balanceManagerCaps || balanceManagerCaps.length === 0) {
            if (debug) console.log("[fetchBalanceManagers] No account address found or no balance manager caps found");
            return;
        }
        try {
            if (debug) console.log("[fetchBalanceManagers] Fetching balance managers");
            setBmLoading(true);
            const fetchedBalanceManagers = await fetchBalanceManagersByIds(balanceManagerCaps.map((cap) => cap.balance_manager_id));
            const sortedBalanceManagers = fetchedBalanceManagers.sort((a, b) => b.balance - a.balance); // Sorting in descending order
            if (debug) console.log("[fetchBalanceManagers] Fetched balance managers:", sortedBalanceManagers.length);
            setBalanceManagerData(sortedBalanceManagers);
            setBmLoading(false);
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account?.address, balanceManagerCaps]);

    useEffect(() => {
        if (!selectedBalanceManagerId && balanceManagerData.length > 0) {
            // console.log("Pre-selecting balance manager id:", balanceManagerData[0].id.id);
            setSelectedBalanceManagerId(balanceManagerData[0].id.id);
        }
    }, [selectedBalanceManagerId, balanceManagerData]);
    
    const fetchPlayCaps = useCallback(async () => {
        if (!account?.address) {
            if (debug) console.log("[fetchPlayCaps] No account address found");
            return;
        }
        try {
            if (debug) console.log("[fetchPlayCaps] Fetching play caps");
            setPlayCapLoading(true);
            const fetchedPlayCaps = await fetchAllPlayCaps(account.address);
            if (!fetchedPlayCaps) {
                return;
            }
            if (debug) console.log("[fetchPlayCaps] Fetched play caps:", fetchedPlayCaps.length);
            const filteredPlayCaps = fetchedPlayCaps.filter((cap) => cap.balance_manager_id === selectedBalanceManagerId);
            setCurrentManagerPlayCaps(filteredPlayCaps);
            setPlayCapLoading(false);
        } catch (error) {
            console.error("Failed to fetch play caps:", error);
        }
    }, [account?.address, selectedBalanceManagerId]);

    useEffect(() => {
        fetchBalanceManagerCaps(); // Fetch data initially
    }, [fetchBalanceManagerCaps]);
    
    useEffect(() => {
        fetchBalanceManagers(); // Fetch data initially
    }, [fetchBalanceManagers]);
    
    useEffect(() => {
        fetchPlayCaps(); // Fetch data initially
    }, [fetchPlayCaps]);

    return (
        <BalanceManagerContext.Provider
            value={{
                selectedBalanceManagerId,
                setSelectedBalanceManagerId,
                balanceManagerCaps,
                refreshBalanceManagers: fetchBalanceManagers,
                refreshBalanceManagerCaps: fetchBalanceManagerCaps,
                balanceManagerData,
                currentManagerPlayCaps,
                refreshPlayCaps: fetchPlayCaps,
                currentBalanceManager,
                currentBalanceManagerCap,
                bmLoading,
                playCapLoading
            }}
        >
            {children}
        </BalanceManagerContext.Provider>
    );
};

export const useBalanceManager = () => {
    const context = useContext(BalanceManagerContext);
    if (!context) {
        throw new Error("useBalanceManager must be used within a BalanceManagerProvider");
    }
    return context;
};