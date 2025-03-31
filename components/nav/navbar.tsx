"use client";
import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Link from "next/link";
// import Wallet from "@/components/sui/wallet";
// import NavButton from "@/components/nav/nav-button";
import { useTheme } from "next-themes";
import { DepositButton } from "./deposit-button";
import AccountSidebar from "./account-sidebar";

interface NavbarProps {
    transparent?: boolean;
}

// const navigationLinks = [
//     { name: "Games", href: "/" },
//     { name: "Houses", href: "/houses" },
//     // {name: "Rewards", href: "/rewards"},
// ]

export default function Navbar(props: NavbarProps) {

    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div className="px-4 flex flex-row justify-between items-center h-[72px]">
            {/*Logo*/}
            {
                loading ?
                    <div key={"logo-placeholder"} className={"w-[150px] h-[34px]"}>

                    </div>
                    :
                    <Link className={"flex-shrink-0"} href={"/"}>
                        {props.transparent || theme.theme == "dark" || (theme.theme == "system" && theme.systemTheme == "dark") ?

                            <Image src={"/OpenPlay-Inverted-Color.png"} width={150} height={34} alt={"OpenPlay"} />
                            :
                            <Image src={"/OpenPlay Main Logo (2).png"} width={150} height={34} alt={"OpenPlay"} />}
                    </Link>
            }


            {/*Navigation Menu*/}
            <div className={"inline-flex gap-8 items-center"}>
                {/* {navigationLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn("cursor-pointer inline-flex gap-2 items-center bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-semibold text-lg",
                            props.transparent ?
                                "text-background hover:text-background/70"
                                :
                                "text-foreground hover:text-foreground/70")}>
                        {link.name}
                    </Link>
                ))} */}
            </div>

            {/*Extra links*/}
            <div className={"flex flex-row gap-2 p-4"}>
                {/*<ModeToggle/>*/}
                {/* <a href={process.env.NEXT_PUBLIC_GITBOOK_URL ?? ""} target={"_blank"} >
                    <NavButton
                        tabIndex={0}
                        text="Docs"
                        icon={<ArrowTopRightOnSquareIcon className="w-6 h-6" />}
                        light={props.transparent}
                    />
                </a> */}
                <DepositButton balance={0.44} />
                <AccountSidebar />
                {/* <Wallet transparent={props.transparent} /> */}
            </div>
        </div>
    );
}