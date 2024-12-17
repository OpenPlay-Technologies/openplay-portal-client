"use client";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
    ArrowTopRightOnSquareIcon,
    ChevronDownIcon,
    CircleStackIcon,
    LifebuoyIcon,
    WalletIcon
} from "@heroicons/react/24/outline";
import {CherryIcon} from "lucide-react";
import React from "react";
import { useConnectWallet, useCurrentAccount, useWallets, useCurrentWallet} from '@mysten/dapp-kit';

interface NavbarProps {
    transparent?: boolean;
}

export default function Navbar(props: NavbarProps) {

    const wallets = useWallets();
    const {mutate: connect} = useConnectWallet();
    const _wallet = useCurrentWallet();
    const account = useCurrentAccount();

    const handleConnect = () => {
        if (wallets.length > 0) {
            connect(
                {
                    wallet: wallets[0]
                },
                {
                    onSuccess: () => console.log('connected'),
                    onError: (error) => console.error('Connection failed:', error),
                },
            );
        } else {
            console.warn('No wallets available to connect');
        }
    };


    return (
        <div className="px-4 flex flex-row justify-between items-center">
            {/*<div style={{padding: 20}}>*/}
            {/*    <ConnectButton/>*/}
            {/*    <ul>*/}
            {/*        {wallets.map((wallet) => (*/}
            {/*            <li key={wallet.name}>*/}
            {/*                <button*/}
            {/*                    onClick={() => {*/}
            {/*                        connect(*/}
            {/*                            {wallet},*/}
            {/*                            {*/}
            {/*                                onSuccess: () => console.log('connected'),*/}
            {/*                            },*/}
            {/*                        );*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    Connect to {wallet.name}*/}
            {/*                </button>*/}
            {/*            </li>*/}
            {/*        ))}*/}
            {/*    </ul>*/}
            {/*</div>*/}

            {/*Logo*/}
            {props.transparent ?
                <div>
                    <Image src={"/OpenPlay-Inverted-Color.png"} width={150} height={150} alt={"OpenPlay"}/>
                </div>
                :
                <div>
                    <Image src={"/OpenPlay Main Logo (2).png"} width={150} height={150} alt={"OpenPlay"}/>
                </div>
            }


            {/*Navigation Menu*/}
            <div className={"inline-flex gap-8 items-center"}>
                <div
                    className={cn("cursor-pointer inline-flex gap-2 items-center bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-semibold text-lg",
                        props.transparent ? "text-background hover:text-background focus:text-background" : "text-foreground hover:text-foreground focus:text-foreground")}>
                    <span>
                        Games
                    </span>
                </div>
                <div
                    className={cn("cursor-pointer inline-flex gap-2 items-center bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-semibold text-lg",
                        props.transparent ? "text-background hover:text-background focus:text-background" : "text-foreground hover:text-foreground focus:text-foreground")}>
                    <span>
                        Rewards
                    </span>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <div
                            className={cn("cursor-pointer inline-flex gap-2 items-center bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-semibold text-lg",
                                props.transparent ? "text-background hover:text-background focus:text-background" : "text-foreground hover:text-foreground focus:text-foreground")}>
                    <span>
                        Create
                    </span>
                            <ChevronDownIcon className={cn("size-4 text-background",
                                props.transparent ? "text-background" : "text-foreground")} strokeWidth={3}/>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-card">
                        <div className="flex flex-col gap-2">
                            <div
                                className="flex items-center gap-4 cursor-pointer hover:bg-muted p-2 rounded-lg">
                                <CircleStackIcon className="h-6 w-6 text-card-foreground"/>
                                <p className="text-card-foreground">Coin Flip</p>
                            </div>
                            <div
                                className="flex items-center gap-4 cursor-pointer hover:bg-muted p-2 rounded-lg">
                                <LifebuoyIcon className="h-6 w-6 text-card-foreground"/>
                                <p className="text-card-foreground">Roulette</p>
                            </div>
                            <div className="flex items-center gap-4 p-2 rounded-lg">
                                <CherryIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                                <p className="text-muted-foreground">Slots (Coming soon)</p>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/*Extra links*/}
            <div className={"flex flex-row gap-2 p-4"}>
                <div
                    className={cn("h-10 flex flex-row align-top pl-2 border-transparent rounded-lg backdrop-blur-3xl items-center",
                        props.transparent ? "bg-background/20 text-primary-foreground" : "bg-foreground/5 text-foreground")}>
                    Docs
                    <ArrowTopRightOnSquareIcon
                        className="size-10 p-2 border-transparent rounded-lg"/>
                </div>

                {/*<div*/}
                {/*    className="h-10 flex flex-row align-top bg-foreground/5 text-foreground border-transparent rounded-lg backdrop-blur-3xl items-center">*/}
                {/*    <UserCircleIcon*/}
                {/*        className="size-10 p-2 border-transparent rounded-lg"/>*/}
                {/*</div>*/}
                {/*<div*/}
                {/*    className="h-10 flex flex-row align-top bg-foreground/5 text-foreground border-transparent rounded-lg backdrop-blur-3xl items-center">*/}
                {/*    <Cog8ToothIcon*/}
                {/*        className="size-10 p-2 border-transparent rounded-lg"/>*/}
                {/*</div>*/}
                {!account && <div
                    onClick={handleConnect}
                    className={cn("h-10 flex flex-row align-top pl-2 border-transparent rounded-lg backdrop-blur-3xl items-center",
                        props.transparent ? "bg-background/20 text-primary-foreground" : "bg-foreground/5 text-foreground")}>
                    Connect
                    <WalletIcon
                        className="size-10 p-2 border-transparent rounded-lg"/>
                </div>}
                {account && <div
                    onClick={handleConnect}
                    className={cn("h-10 flex flex-row align-top pl-2 border-transparent rounded-lg backdrop-blur-3xl items-center",
                        props.transparent ? "bg-background/20 text-primary-foreground" : "bg-foreground/5 text-foreground")}>
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    <WalletIcon
                        className="size-10 p-2 border-transparent rounded-lg"/>
                </div>}
            </div>
        </div>
    );
}