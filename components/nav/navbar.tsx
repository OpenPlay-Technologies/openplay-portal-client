"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import AccountSidebar from "./account-sidebar";
import { NavActionButton } from "./nav-action-button";
import { useCurrentAccount, useAutoConnectWallet } from "@mysten/dapp-kit";


export default function Navbar() {

    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    const currentAccount = useCurrentAccount();

    const autoConnectionStatus = useAutoConnectWallet();


    return (
        <div className="px-4 flex flex-row justify-between items-center h-[72px]">
            {/*Logo*/}
            {
                loading ?
                    <div key={"logo-placeholder"} className={"w-[150px] h-[34px]"}>

                    </div>
                    :
                    <Link className={"flex-shrink-0"} href={"/"}>
                        {theme.theme == "dark" || (theme.theme == "system" && theme.systemTheme == "dark") ?
                            <Image src={"/OpenPlay-Inverted-Color.png"} width={150} height={34} alt={"OpenPlay"} />
                            :
                            <Image src={"/OpenPlay Main Logo (2).png"} width={150} height={34} alt={"OpenPlay"} />}
                    </Link>
            }

            {autoConnectionStatus == "attempted" &&
                <div className={"flex flex-row gap-2"}>
                    <NavActionButton />
                    {currentAccount && <AccountSidebar />}
                </div>
            }
        </div>
    );
}