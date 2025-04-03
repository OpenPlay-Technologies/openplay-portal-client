// context/WalletAuthContext.tsx
'use client';

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAutoConnectWallet, useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnectModal } from '../wallet/wallet-conect-modal';

interface WalletAuthContextProps {
    isConnected: boolean;
    modalOpen: boolean;
    isLoading: boolean;
    openModal: (targetRoute?: string) => void;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onWalletConnected: (targetRouteOverwrite?: string) => void;
    onWalletDisconnect: () => void;
    targetRoute: string | null;
}

const WalletAuthContext = createContext<WalletAuthContextProps | undefined>(
    undefined
);

export const WalletAuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [targetRoute, setTargetRoute] = useState<string | null>(null);
    const autoConnectionStatus = useAutoConnectWallet();
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(true);

    // Open the modal and optionally store the target route.
    const openModal = useCallback((targetRoute?: string) => {
        if (targetRoute) {
            setTargetRoute(targetRoute);
        }
        setModalOpen(true);
    }, []);

    // Called when the wallet connection is successful.
    const onWalletConnected = useCallback((targetRouteOverwrite?: string) => {
        setIsConnected(true);
        // Set a cookie to mark the wallet as connected.
        console.log("Setting cookie to mark wallet as connected.");
        document.cookie = 'walletConnected=true; path=/;';
        console.log("Target route:", targetRoute);
        if (targetRouteOverwrite || targetRoute) {
            router.push(targetRouteOverwrite || targetRoute || '/');
            setTargetRoute(null);
        }
        // Optionally, you can keep the modal open if desired.
    }, [router, targetRoute]);

    // Called when the wallet disconnects or user logs out.
    const onWalletDisconnect = useCallback(() => {
        setIsConnected(false);
        setModalOpen(false);
        // Remove the cookie by setting its expiry to a past date.
        document.cookie =
            'walletConnected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }, []);

    // Keep the cookie and auth state in sync
    useEffect(() => {
        if (autoConnectionStatus == "attempted" && !account) {
            // Remove the cookie by setting its expiry to a past date.
            document.cookie =
                'walletConnected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setIsConnected(false);
            setIsLoading(false);
        }
        else if (autoConnectionStatus == "attempted" && account) {
            // Set the cookie to mark the wallet as connected.
            document.cookie = 'walletConnected=true; path=/;';
            setIsConnected(true);
            setIsLoading(false);
        }
    }, [autoConnectionStatus, account, onWalletDisconnect]);

    return (
        <WalletAuthContext.Provider
            value={{
                isConnected,
                isLoading,
                modalOpen,
                openModal,
                setModalOpen,
                onWalletConnected,
                onWalletDisconnect,
                targetRoute,
            }}
        >
            {children}
            <WalletConnectModal />
        </WalletAuthContext.Provider>
    );
};

export const useWalletAuth = (): WalletAuthContextProps => {
    const context = useContext(WalletAuthContext);
    if (!context) {
        throw new Error('useWalletAuth must be used within a WalletAuthProvider');
    }
    return context;
};
