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
}

export const BalanceManagerContext = createContext<BalanceManagerProviderContext | null>(null);

export const BalanceManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [selectedBalanceManagerId, setSelectedBalanceManagerId] = useState<string | null>(null);
    const [currentBalanceManager, setCurrentBalanceManager] = useState<BalanceManagerModel | null>(null);
    const [balanceManagerCaps, setBalanceManagerCaps] = useState<BalanceManagerCapModel[]>([]);
    const [balanceManagerData, setBalanceManagerData] = useState<BalanceManagerModel[]>([]);
    const [currentManagerPlayCaps, setCurrentManagerPlayCaps] = useState<PlayCapModel[]>([]);
    const [currentBalanceManagerCap, setCurrentBalanceManagerCap] = useState<BalanceManagerCapModel | null>(null);

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
        console.log("Selected balance manager id:", selectedBalanceManagerId);
    }, [selectedBalanceManagerId]);

    const fetchBalanceManagerCaps = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        try {
            console.log("Fetching balance manager caps");
            const fetchedBalanceManagerCaps = await fetchAllBalanceManagerCaps(account.address);
            setBalanceManagerCaps(fetchedBalanceManagerCaps);
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account?.address]);

    const fetchBalanceManagers = useCallback(async () => {
        if (!account?.address || balanceManagerCaps.length === 0) {
            return;
        }
        try {
            console.log("Fetching balance managers");
            const fetchedBalanceManagers = await fetchBalanceManagersByIds(balanceManagerCaps.map((cap) => cap.balance_manager_id));
            const sortedBalanceManagers = fetchedBalanceManagers.sort((a, b) => b.balance - a.balance); // Sorting in descending order
            setBalanceManagerData(sortedBalanceManagers);
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account?.address, balanceManagerCaps]);

    useEffect(() => {
        if (!selectedBalanceManagerId && balanceManagerData.length > 0) {
            console.log("Pre-selecting balance manager id:", balanceManagerData[0].id.id);
            setSelectedBalanceManagerId(balanceManagerData[0].id.id);
        }
    }, [selectedBalanceManagerId, balanceManagerData]);
    
    const fetchPlayCaps = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        try {
            const fetchedPlayCaps = await fetchAllPlayCaps(account.address);
            const filteredPlayCaps = fetchedPlayCaps.filter((cap) => cap.balance_manager_id === selectedBalanceManagerId);
            setCurrentManagerPlayCaps(filteredPlayCaps);
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
                currentBalanceManagerCap
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