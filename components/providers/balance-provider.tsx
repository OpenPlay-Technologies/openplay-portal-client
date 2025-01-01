"use client"
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {fetchBalance} from "@/api/queries/balance";
import {useCurrentAccount} from "@mysten/dapp-kit";

export interface BalanceProviderContext {
    balance: number;
    updateBalance: () => void;
}

export const BalanceContext = createContext<BalanceProviderContext | null>(null);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const account = useCurrentAccount();
    const [balance, setBalance] = useState(0);

    const updateBalance = useCallback(async () => {
        if (!account) {
            return;
        }
        const balance = await fetchBalance(account.address);
        setBalance(balance);
    }, [account])

    useEffect(() => {
        updateBalance();
    }, [updateBalance]);
    
    return (
        <BalanceContext.Provider
            value={{
                balance: balance,
                updateBalance: updateBalance,
            }}
        >
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useEpoch must be used within a EpochProvider');
    }
    return context;
}
    