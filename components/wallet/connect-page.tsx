// app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWalletAuth } from '@/components/providers/wallet-auth-context-provider';
import WalletConnectCard from '@/components/wallet/wallet-connect-card';
import { Loader } from '@/components/ui/loader';

export default function ConnectPage() {
  const { openModal, isConnected, onWalletConnected, isLoading } = useWalletAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Skip the page if the wallet is already connected
  useEffect(() => {
    if (isLoading) return; // Prevent running the effect if loading
    if (isConnected) {
      onWalletConnected(redirect || '/');
    }
  }, [openModal, onWalletConnected, redirect, isLoading, isConnected]);

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading || isConnected ? (
        <Loader title='Attempting to connect to wallet...' />
      ) 
      : 
      (
        <WalletConnectCard onClick={() => openModal(redirect || '')} />
      )}
      
    </div>
  );
}
