// app/components/ProtectedLink.tsx
'use client';

import Link from 'next/link';
import { useWalletAuth } from '../providers/wallet-auth-context-provider';

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function ProtectedLink({ href, children }: ProtectedLinkProps) {
  const { isConnected, openModal } = useWalletAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isConnected) {
      e.preventDefault();
      openModal(href);
    }
  };

  return (
    <Link href={href} legacyBehavior>
      <a onClick={handleClick}>{children}</a>
    </Link>
  );
}
