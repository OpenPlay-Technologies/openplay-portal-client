"use client";

import {createContext, useEffect, useState, useCallback, useContext} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
    fetchAllBalanceManagerCaps,
    fetchAllPlayCaps,
    fetchBalanceManagerCapByTxDigest,
    fetchBalanceManagersByIds
} from "@/api/queries/balance-manager";
import {BalanceManagerCapModel, BalanceManagerModel, PlayCapModel} from "@/api/models/openplay-core";

export interface BalanceManagerProviderContext {
    selectedBalanceManagerId: string | null;
    setSelectedBalanceManagerId: (manager: string | null) => void;
    currentBalanceManager: BalanceManagerModel | null;
    balanceManagerCaps: BalanceManagerCapModel[];
    balanceManagerData: Record<string, BalanceManagerModel>;
    currentManagerPlayCaps: PlayCapModel[];
    refreshBalanceManagerCaps: () => Promise<void>; // Expose this function for manual refresh
    refreshBalanceManagers: () => Promise<void>; // Expose this function for manual refresh
    refreshPlayCaps: () => Promise<void>; // Expose this function for manual refresh
    currentBalanceManagerCap: BalanceManagerCapModel | null;
    setBalanceManagerIdByTxDigest: (txDigest: string) => void;
}

export const BalanceManagerContext = createContext<BalanceManagerProviderContext | null>(null);

export const BalanceManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [selectedBalanceManagerId, setSelectedBalanceManagerId] = useState<string | null>(null);
    const [currentBalanceManager, setCurrentBalanceManager] = useState<BalanceManagerModel | null>(null);
    const [balanceManagerCaps, setBalanceManagerCaps] = useState<BalanceManagerCapModel[]>([]);
    const [balanceManagerData, setBalanceManagerData] = useState<Record<string, BalanceManagerModel>>({});
    const [currentManagerPlayCaps, setCurrentManagerPlayCaps] = useState<PlayCapModel[]>([]);
    const [currentBalanceManagerCap, setCurrentBalanceManagerCap] = useState<BalanceManagerCapModel | null>(null);

    useEffect(() => {
        setCurrentBalanceManager(selectedBalanceManagerId ? balanceManagerData[selectedBalanceManagerId] : null);
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

    const fetchBalanceManagerCaps = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        try {
            const fetchedBalanceManagerCaps = await fetchAllBalanceManagerCaps(account.address);
            setBalanceManagerCaps(fetchedBalanceManagerCaps);
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account]);

    const fetchBalanceManagers = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        try {
            const fetchedBalanceManagers = await fetchBalanceManagersByIds(balanceManagerCaps.map((cap) => cap.balance_manager_id));
            const sortedObject = Object.fromEntries(
                Object.entries(fetchedBalanceManagers)
                    .sort(([, a], [, b]) => b.balance.value - a.balance.value) // Sorting in descending order
            );            
            setBalanceManagerData(sortedObject);
            //setBalanceManagerData({});
            // This OR condition is added so that you can switch wallets and the selected balance manager will be set to the first one in the list
            if (Object.entries(sortedObject).length > 0 && (selectedBalanceManagerId == null || !sortedObject[selectedBalanceManagerId]) ){ 
                setSelectedBalanceManagerId(Object.entries(sortedObject)[0][0]);
            }
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account?.address, balanceManagerCaps, selectedBalanceManagerId]);
    
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
    
    const setBalanceManagerIdByTxDigest = useCallback( async (txDigest: string) => {
        if (!account?.address){
            return;
        }
        
        console.log("Setting balance manager by tx digest", txDigest);
        
        const bmCap = await fetchBalanceManagerCapByTxDigest(account.address, txDigest);
        if (bmCap){
            setSelectedBalanceManagerId(bmCap.balance_manager_id);
        }
    }, [account?.address]);

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
                setBalanceManagerIdByTxDigest
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