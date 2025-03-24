import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/nav/header';
import React from 'react';
import SuiClientProviders from "@/components/providers/sui-client-providers";
import { BalanceProvider } from "@/components/providers/balance-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Footer from "@/components/nav/footer";
import { KeypairProvider } from "@/components/providers/keypair-provider";
import { BalanceManagerProvider } from "@/components/providers/balance-manager-provider";
import { Analytics } from "@vercel/analytics/react"
import { InvisibleWalletProvider } from '@/components/providers/invisible-wallet-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'OpenPlay App',
    description:
        'OpenPlay is the world’s first decentralized gambling protocol that revolutionizes the industry by giving players unprecedented power. Create new games and stake here.',
    icons: {
        icon: '/icon_only_no_bg.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SuiClientProviders>
                        <BalanceProvider>
                            <BalanceManagerProvider>
                                <KeypairProvider>
                                    <InvisibleWalletProvider>
                                        <div className={'flex flex-col min-h-screen'}>
                                            <Header />
                                            <main className={"relative flex-grow bg-muted/80"}>
                                                {children}
                                            </main>
                                            <Footer />
                                        </div>
                                    </InvisibleWalletProvider>
                                </KeypairProvider>
                            </BalanceManagerProvider>
                        </BalanceProvider>
                    </SuiClientProviders>
                </ThemeProvider>
                <Toaster />
                <Analytics debug={false} />
            </body>
        </html>
    );
}
