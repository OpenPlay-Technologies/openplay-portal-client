"use client";

import {createContext, useEffect, useState, useCallback, useContext} from "react";
import { BalanceManagerData } from "@/api/models/models";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { fetchAllBalanceManagers } from "@/api/queries/balance-manager";

export interface BalanceManagerProviderContext {
    selectedBalanceManager: string | null;
    setSelectedBalanceManager: (manager: string | null) => void;
    balanceManagers: BalanceManagerData[];
    refreshBalanceManagers: () => Promise<void>; // Expose this function for manual refresh
}

export const BalanceManagerContext = createContext<BalanceManagerProviderContext | null>(null);

export const BalanceManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [selectedBalanceManager, setSelectedBalanceManager] = useState<string | null>(null);
    const [balanceManagers, setBalanceManagers] = useState<BalanceManagerData[]>([]);

    // Define fetchBalanceManagers as a reusable function
    const fetchBalanceManagers = useCallback(async () => {
        if (!account?.address) {
            return;
        }
        try {
            const fetchedBalanceManagers = await fetchAllBalanceManagers(account.address);
            const sortedBalanceManagers = fetchedBalanceManagers.sort((a, b) => b.balance.value - a.balance.value);
            setBalanceManagers(fetchedBalanceManagers);
            
            console.log(selectedBalanceManager);
            
            // Select the balance manager with the highest value if none is selected
            if (!selectedBalanceManager && sortedBalanceManagers.length > 0) {
                setSelectedBalanceManager(sortedBalanceManagers[0].id);
            }
            
            
        } catch (error) {
            console.error("Failed to fetch balance managers:", error);
        }
    }, [account, selectedBalanceManager]);

    useEffect(() => {
        fetchBalanceManagers(); // Fetch data initially
    }, [fetchBalanceManagers]);

    return (
        <BalanceManagerContext.Provider
            value={{
                selectedBalanceManager,
                setSelectedBalanceManager,
                balanceManagers,
                refreshBalanceManagers: fetchBalanceManagers, // Expose the fetch function
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