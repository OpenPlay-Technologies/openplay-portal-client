import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import Header from '@/components/nav/header';
import React from 'react';
import SuiClientProviders from "@/components/providers/sui-client-providers";
import {BalanceProvider} from "@/components/providers/balance-provider";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'OpenPlay App',
    description:
        'OpenPlay is the world’s first decentralized gambling protocol that revolutionizes the industry by giving players unprecedented power. Create new games and stake here.',
    icons: {
        icon: '/icon_only_no_bg.png',
    },
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <SuiClientProviders>
            <BalanceProvider>
                <div className={'flex flex-col min-h-screen'}>
                    <Header/>
                    <main className={"relative flex-grow bg-muted/80"}>
                        {children}
                    </main>
                </div>
            </BalanceProvider>
        </SuiClientProviders>
        <Toaster/>
        </body>
        </html>
    );
}
